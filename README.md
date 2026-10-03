# OSTO PR

Ping remover for OSTO. Skills start the moment you press them instead of
waiting a round trip for the server.

## Install

1. Download this repository (Code > Download ZIP) and extract it.
2. Put the folder in your Toolbox `mods` folder and name it `osto-pr`.
3. Start Toolbox. It updates itself from here on every launch.

Do not run it together with another ping remover or skill prediction mod.

## Commands (in game, `/8`)

| Command | What it does |
| --- | --- |
| `pr` | Turn it on or off |
| `pr status` | On/off, ping, and how many skills it played early |
| `pr ping` | Real ping (hovering the in-game ping gauge shows it too); `pr ping off` gives the gauge back |
| `pr dry` / `pr live` | Watch only / play skills early (live is the default) |
| `pr omni on` / `off` | Omnidirectional skills: hold W, A, S, D or an arrow key with Backstep, Fiery Escape, Teleport Jaunt, a charging dash and similar, and the skill goes that way (off by default; no separate omnidirectional mod needed) |
| `pr lockon on` / `off` | Play lock-on skills early: the targeting, the target locks and the cast (off by default, new and still being tested) |
| `pr dash on` / `off` | Play targeted dashes early (off by default) |
| `pr dump` | Save a log to the mod folder for bug reports |

Settings are remembered between launches.

## Reporting problems

Right after something goes wrong, type `/8 pr dump` and send the file it names
(`telemetry-....osto` in the mod folder; it is encrypted, only the developer can read it) with a short description.
