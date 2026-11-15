# Odyssey: Lunar Mission Designer — Team Rocket HN

**Challenge:** Space Mission Design Game · NASA Space Apps Challenge 2026 · Tegucigalpa, Honduras
**Play it (no login):** https://blue201.github.io/NASA_PROYEC/
**Code:** https://github.com/blue201/NASA_PROYEC

## High-level summary

Odyssey is a browser game where you design a small spacecraft for a real lunar mission and live with the consequences of your engineering choices. In the near-future story, demand for computing has strained Earth's resources, so your team must prove that water ice at the Moon's south pole (Shackleton crater) can be extracted. Before launch, you choose a mission objective, a launch vehicle, a lunar orbit and four subsystems (structure, power, communications, instrument and propulsion), balancing **budget, mass, energy and Δv**. Invalid designs cannot launch, and the game explains why. In flight, cockpit screens show the battery, fuel, mass, remaining budget, Earth–Moon distance and signal delay computed from real data. On the surface, only real features appear: real NASA landing sites and real resource deposits, each labeled with its source.

## How it addresses the challenge

- **Mission design with trade-offs:** 3–4 subsystems with realistic "currencies" (budget, mass, power), using CubeSat 101 references for size and mass limits. Every choice has a visible consequence: overweight, out of budget, not enough Δv for the chosen orbit, or a power deficit.
- **Launch vehicle and orbit compatibility:** the rideshare option only accepts small spacecraft; a low polar orbit gives more science but needs more Δv and shorter contact windows.
- **Resource management in real time:** cockpit displays update during the mission.
- **Learning by doing:** the design screen and mission texts explain what mass, power and Δv mean and why a mission succeeds or fails.
- **Moon first:** other planets stay locked until the lunar mission is completed (Mars unlocks next).

## NASA data used

- **JPL Horizons API:** Earth–Moon distance and light time (signal delay), used for travel time and communications.
- **NASA Image and Video Library:** real lunar south pole and CubeSat imagery (each image keeps its `nasa_id` and link).
- **NASA NSSDC planetary fact sheets and NASA Science pages:** gravity, radius, temperatures and atmospheric composition for each body.
- **Mission results:** LCROSS (water ice in Cabeus, 5.6 ± 2.9 % by mass), Chang'e 4 LND (surface radiation dose), Phoenix (subsurface ice and perchlorates), MRO/HiRISE (mid-latitude ice), MESSENGER (polar ice and sulfur on Mercury), Opportunity (hematite spherules), Mars Odyssey/THEMIS (Arsia Mons skylights), SELENE/Kaguya and LRO (Marius Hills lava tube pit).
- **CubeSat 101 (NASA CubeSat Launch Initiative):** size and mass references for the design phase.
- **NASA 3D Resources:** Perseverance and Ingenuity models (NASA/JPL-Caltech). We covered the NASA and JPL logos that appear in their textures.

Every value lives in `data/planets/<body>.json` with its `source_url` and a `verified` flag. Values not yet double-checked are marked as pending.

## Other resources and credits

- three.js r128 (MIT).
- Planet textures: Solar System Scope (CC BY 4.0).
- Milky Way panorama: ESO/S. Brunier (CC BY 4.0).
- Spanish voices generated locally with Piper (model es_ES-sharvard-medium, CC BY 3.0 corpus).
- Base game engine "Odyssey", a prior project by our team. MIT license notice kept in `game/LICENSE.txt`.
- Full list: `game/assets/CREDITS.md` and `README.md`.

This project is not endorsed by NASA and does not use NASA logos or branding.

## Use of SI (Super Intelligence)

We used SI assistants (Claude by Anthropic, among others) to help write and review code, documentation and this text. Every change was reviewed and approved by the team. SI-generated images in the prologue carry an "SI-generated" watermark. The rules our SI follows are in `AGENTS.md`. The commit history and `docs/BITACORA.md` record how the project was built.

## Team

Team Rocket HN — Tegucigalpa, Honduras.
