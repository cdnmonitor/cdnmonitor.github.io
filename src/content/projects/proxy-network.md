---
title: Cellular Proxy Network
summary: A proxy network that uses cellular networks to pull clean IPs, costs less than 200 dollars, and has high profit potential
year: 2026
role: Design + engineering
tags:
  - Go
  - Networking
  - Infrastructure
order: 4
---

Most proxy capacity is rented. You buy a share of somebody else's pool and you get
an address, an invoice, and no answer when the address stops working. This is the
other arrangement: exits I own and run, a service that keeps them in shape, and a
dashboard that shows what they are doing.

## The requirements

Having run a proxy business before this one ([Vanish
Proxies](/experience/vanish-proxies/), 2020 to 2022), the requirements were
settled before the first line was written:

- **Exits are the product.** Uptime is the marketing.
- **A fleet fails one link at a time, at night.** Anything that needs a human at
  3am is not finished.
- **Accounting from the first request.** Per user, per unit, or it never gets
  added honestly later.

Everything below is a consequence of those, not of the proxy protocol.

## How it works, at the level I would say out loud

**Discovery.** An exit appears and the service notices it, provisions it and puts
it in the pool. Plug in capacity: no inventory spreadsheet, no manual step to
forget.

**Egress.** Each exit serves its own proxy listener, so the exit a client asks for
is the exit the traffic leaves through. They do not share a path and they do not
share a failure.

**Control.** One HTTP API for the whole thing, and one address that stays true
even when the hardware is spread across more than one machine. That address is
the only thing a client ever needs to know.

It is a single Go binary with no third-party dependencies: standard library
only, which is a deliberate constraint. This is the kind of service where every
line you did not import is a line that cannot surprise you at 3am, and it makes
the whole thing trivial to deploy on a box you can carry.

## The dashboard

The API is for machines; the dashboard is what makes the network legible to a
person. It is where an account signs in, gets its credentials and exports them,
and sees what it has used against its allowance, and where the fleet is visible:
every exit, its current state, and the operations that would otherwise be a shell
session at midnight. Retire one. Bring one back. Move a user off an exit that is
misbehaving.

## What stays off this page

What the exits are and how they are made is the part worth keeping, so it is not
here. The honest summary is that the interesting engineering was never the proxy
protocol. It was making a set of things I do not fully control behave like one
reliable service, and knowing, per request, exactly which of them answered.

## What it cost

[Add: what the build cost you: the weekends, the hardware, the parts you threw
away, and what you would do differently if you built it again.]

It runs for me, and it stays small on purpose. The value is not capacity. It is
that the whole path is understood, down to the last component of it.
