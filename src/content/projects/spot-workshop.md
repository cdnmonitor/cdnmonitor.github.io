---
title: Boston Dynamics Student Workshop
summary: A Github project used to teach college students introductions to Object Orientation, Python, and using Boston Dynamics in a short period
year: 2024
role: Design + tooling
tags:
  - Python
  - Robotics
  - Education
order: 3
link: https://github.com/ChapmanDCILab/SPOT-Workshop
linkLabel: ChapmanDCILab/SPOT-Workshop
---

While I was at the Chapman Makerspace we had a Boston Dynamics SPOT. What we did
not have was anywhere for a student to write against it, so I designed the
control environment, and the people teaching with it turned that into a workshop.

## The situation

A robot with no control surface is a demo, not a tool. Anyone wanting to teach
with SPOT first had to get through its SDK: leases, missions, choreography
clients, emergency stops. That is a week of setup before the first metre of
movement, and none of it is about robotics.

## What I designed

Two files. `spot_helper.py` holds a `SpotHelper` class that wraps the movement
calls (stow and unstow, sit, stand, tilt, rotate the body, move forward), so
nobody has to hold the SDK in their head to make the robot do something. The
student file, `code_here.py`, is where the writing happens, and the first thing
someone runs works:

```bash
python3 -m pip install bosdyn-client==4.0
python3 -m pip install bosdyn-mission==4.0
python3 -m pip install bosdyn-choreography-client==4.0
python3 code_here.py
```

The part I'd keep in any teaching environment is the stop. `code_here.py`
listens for the enter key; that calls `request_stop()`, which flips
`stop_requested` from false to true, and every movement function checks it before
acting, so nothing queued behind the stop runs. A student who panics stops the
robot on the first press instead of watching it finish the motion they regretted.

The environment is versioned against the SDK rather than the calendar: 1.0 on
SPOT SDK 3.3.2, 1.1 on 4.0, 1.1.2 adding arm support (stow, unstow and
movement).

## What it became

The students and the Makerspace took it from there and made it a workshop: the
Design Create Innovate Makerspace workshop at Chapman's Fowler School of
Engineering. The code lives in the open under
[ChapmanDCILab](https://github.com/ChapmanDCILab), with Kalin Richardson
contributing alongside me.

[Add: what the workshop became: how many students, how many terms, what they
built with it.]

## What it cost

[Add: what the environment cost to design and keep alive: the SDK upgrade from
3.3.2 to 4.0, the arm work, what you would restructure now.]

The honest version of a teaching tool: the environment has to be simpler than the
subject, or students learn the environment instead of the robot.
