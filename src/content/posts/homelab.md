---
title: Seven machines, one flat network, and no VLANs
summary: What every box in the homelab is actually for, the four rules it converged on, and the gaps I have not closed yet.
date: 2026-11-12
tags:
  - Homelab
  - Networking
  - Operations
  - Tailscale
---

The lab is not a rack. It is seven always-on machines in a house, plus the
phones and laptops that come and go, and it exists for one reason: it is where
I answer questions that a cloud console cannot. What does a 763B model cost per
token on consumer hardware? What breaks when a GPU is handed to a VM? Which of
my assumptions about storage is actually true?

Everything below is what runs today, not what was planned.

## The fleet

| Box | Hardware | What it does |
| --- | --- | --- |
| Compute | 32c/64t, 125 GB RAM, 2× RTX 3090, 3.6 TB NVMe + 3.6 TB HDD | Model serving, the Windows gaming VM, builds |
| Storage + services | 8c, 31 GB, 931 GB NVMe + 1.8 TB HDD | Photo library (Immich, 5 containers), Samba shares |
| Ingress + agent | 12c, 31 GB, 8 GB GPU | Agent gateway, Postgres, Redis, MQTT, embeddings, the desktop I actually sit at |
| Appliance ×4 | Raspberry Pi 5, 4c, 7 GB, Ubuntu 25.10 | Retail feed, storefront, proxy farm, VPN egress |
| Console | JetKVM | Out-of-band video and keyboard for the gaming VM |

That is a lot of compute for a house, and almost none of it is idle by accident:
the Pi fleet is deliberately weak, because each one has exactly one job and
should never need a second one.

## The four rules it converged on

**1. One role per box.** When a machine does two things, one of them is wrong
during the incident. The storage box is the clearest case: it is also a desktop,
it sits on WiFi, and the first disk I bought for it held more photos than the
"NAS" volume did. I now assign a role in writing before anything is installed,
and a new service has to displace an existing one or get its own box.

**2. The public surface never lives on the compute box.** The compute box
reboots for CUDA work, hands both GPUs to a Windows guest on demand, and holds
hundreds of gigabytes of weights. Any customer-facing service there inherits
every one of those outages. The public storefront runs on a 7 GB Raspberry Pi
that has been up for three weeks and draws a few watts — which is exactly the
point. Uptime came from choosing the boring host, not from the hardware.

**3. Tunnels instead of port forwards.** Nothing on the LAN accepts inbound
connections from the internet. The public hostnames are Cloudflare tunnels
terminated at the edge, with the connector running next to the app it serves.
That means no NAT rules, no exposed SSH, no certificate renewal on the origin,
and one place to turn a hostname off. It also means the tunnel is a dependency:
if the connector dies, the site is a 530 and the box looks dead from outside
while being perfectly healthy inside.

**4. Anything you cannot SSH into needs a break-glass path.** The Windows
gaming VM has the passed-through GPU, so until Windows boots there is no
display and no network. A JetKVM sits on the HDMI output with its keyboard and
mouse attached to the guest as a USB device. The one time I needed it, it saved
a full physical teardown — and it is the only reason I am comfortable letting
that VM be the machine I do CAD work on.

## What broke, and what it taught

**"Offline" is a status, not a diagnosis.** A node that had been up for months
read `offline` and a fresh login URL. The machine was healthy; its node key had
expired. The first lesson of the lab is to check the LAN before believing the
dashboard — and then to disable key expiry on anything meant to run unattended.

**Hostnames lie.** The box named `lab` is the NAS. The box named `nas` is a
desktop. A device renamed in the admin console ignores the hostname you pass on
join, so the tailnet keeps the old name and the new one never resolves. I now
read the actual hostname, the tailnet name, and the OS-reported model, and treat
all three as independent facts.

**Service health is not resource health.** A model server reported `200` and
served correct answers at four tokens per second because the GPUs had been
handed to the VM and the process had fallen back to CPU. Nothing in the stack
called that a fault. The check that works is a measured request, not a status
code — and that rule now applies to every service here.

**A NAS with an empty bulk disk is a red flag.** For a while the photo library
lived on the root SSD while a 1.8 TB disk reported almost no usage. Capacity was
never the problem; the problem was that "it has a big disk" had been mistaken
for "the data is on the big disk." Check `du` on the actual data directory, not
`df` on the mount.

**A WiFi default route with an idle gigabit NIC is a bug, not a preference.**
Two of the three desktops route over WiFi while a wired port sits unplugged.
Measuring latency from two vantage points is what proved it — the internet was
never slow; the first hop was.

## The gaps, in order of how much they bother me

**Backups.** This is the weakest part of the fleet and I am not going to pretend
otherwise. The model weights are replaceable; the photo library is not, and it
sits on a single disk. There is no scheduled `restic` job, no offsite copy, and
the "backup" script is a date-stamped directory on the same machine. The plan is
a mirror plus an encrypted offsite target, with a restore tested before the
first backup counts as real.

**Monitoring.** There is none. Failures are discovered by using the thing and
noticing it is slow. Every incident above would have been caught in under a
minute by three cheap checks: an HTTP probe per public hostname, a node exporter
per box, and one throughput check on the model router. That is a weekend, and it
should have been done before the seventh machine arrived.

**Network segmentation.** One flat `/24` behind one mesh router, roughly 23
hosts, no VLANs, and a tailnet that is allow-all. It works because the fleet is
small and every device is mine, but it means a compromised appliance can reach
the storage box. The wired backbone and two VLANs (services, clients) are the
next physical change, not the next software one.

**Credential hygiene.** Key-based SSH and per-host secrets are the goal; the
fleet grew faster than that discipline. This is the pass I would do first if I
were starting over, because retrofitting access control onto seven boxes is
strictly more work than designing it in.

## Why keep it

Because the lab is where the failures are cheap. A wrong driver binding costs
an evening, not a customer. A mis-sized model costs a download, not a contract.
Every incident above became a runbook, and every runbook came from measurement
rather than belief — the same habit that makes a production system debuggable.

The hardware is the least interesting part. What I would want a reader to take
from this is the shape of the work: choose the boring host for the thing that
must stay up, isolate the machine that reboots, put a number on every claim, and
write down what broke.
