# Space Apps 2026 submission — copy and paste, field by field

Team Rocket HN · Tegucigalpa · Challenge: Space Mission Design Game

---

## 1. Project Name

Odyssey: Lunar Mission Designer

---

## 2. Summary

Odyssey is a browser game where players design a small spacecraft for a real lunar mission and live with the consequences of their engineering choices. Before launch, players pick a mission objective, a launch vehicle, a lunar orbit and four subsystems, balancing budget, mass, energy and Δv with size and mass limits from NASA's CubeSat 101. Invalid designs cannot launch, and the game explains why. In flight, cockpit screens show live energy, fuel, mass, remaining budget, and the Earth–Moon distance and signal delay from JPL Horizons. At the lunar south pole, players find only real features: NASA landing sites, the VIPER rover and water-ice deposits placed from cited NASA mission data. It matters because students rarely get to experiment with a whole mission, and here every trade-off is visible and explained.

---

## 3. Project Demonstration

https://blue201.github.io/NASA_PROYEC/demo/

(7 slides in English. Use the arrow keys or swipe.)

---

## 4. Final Project

https://blue201.github.io/NASA_PROYEC/

(Public, no login. Source code: https://github.com/blue201/NASA_PROYEC)

---

## 5. Detailed Description

**What it does.** Odyssey turns mission design into a game. The player's goal is to prove that water ice at Shackleton crater, at the lunar south pole, can be studied and extracted. The game has three stages:

1. **Design hangar (before launch).** Choose an objective (search for water ice, map the terrain, or measure radiation), a launch vehicle (cheap rideshare for small spacecraft, or a dedicated launcher), a lunar orbit (low polar orbit with more science but more Δv and shorter contact windows, or an elliptical polar orbit), and four subsystems: power, communications, instrument and propulsion, on a 6U or 12U structure. Live meters show mass, volume, budget and power balance. The design is blocked if it is overweight, does not fit, is over budget or lacks the Δv for the chosen orbit, and the game explains which rule failed.
2. **Flight.** The design becomes the cockpit. Starting fuel comes from the Δv margin, and the battery charges or drains with generation versus consumption. Cockpit screens show energy, fuel, Δv, mass, remaining budget, Earth–Moon distance and signal delay.
3. **Surface.** Landing at the pole shows only real things, each labeled with its source: the Marius Hills lava tube pit, Apollo and Surveyor sites, a simplified model of NASA's VIPER ice rover, and water-ice and ilmenite deposits generated from our data files. Completing the lunar mission unlocks Mars, where Perseverance and Ingenuity appear next to real resources (hematite spherules, CO₂ jets, perchlorates, subsurface ice).

**How it works.** The game is a static web app (JavaScript and three.js) published on GitHub Pages. Real data lives in versioned JSON files (`data/planets/<body>.json`), and every value carries its source URL and a "verified" flag. A small Node.js API, run with Docker during development, fetches JPL Horizons and the NASA Image and Video Library and caches the results with their retrieval date. The public site reads those cached copies, so it works without any server or API key.

**Benefits.** Students experience how one decision ripples through mass, power, cost and science. There is no single right answer, and failures teach as much as successes. Every number is traceable to a source.

**What we hope to achieve.** A classroom-ready, free tool that makes systems engineering tangible. Next steps: a final mission report with a score, a drone that excavates the ice using the player's energy budget, and cooperative play for up to four people with mission roles.

**Tools, languages and software.** JavaScript, HTML, CSS, three.js r128, Node.js, Docker, GitHub Pages and GitHub Actions, and Python with Pillow for asset preparation.

---

## 6. Use of Super Intelligence (SI)

We used SI assistants (Claude by Anthropic, among others) to help write and review code, documentation and these texts, and to prepare the slides. Every change was reviewed and approved by the team before it was committed. Images in the game that were generated with SI carry an "SI-generated" watermark. The rules our SI follows are in `AGENTS.md`, and `docs/BITACORA.md` records the work log.

---

## 7. NASA Data

- **JPL Horizons API** (https://ssd.jpl.nasa.gov/api/horizons.api): Moon (301) position relative to Earth's center. We use the range (≈405,000 km) for travel time and the light time (≈1.35 s) for signal delay.
- **NASA Image and Video Library** (https://images-api.nasa.gov): lunar south pole, LRO and CubeSat imagery shown in the hangar, each kept with its `nasa_id` and link.
- **NASA CubeSat 101** (NASA CubeSat Launch Initiative): 6U and 12U size and mass references for the design phase.
- **NASA NSSDC planetary fact sheets and NASA Science pages**: gravity, radius, temperatures, day length and atmospheric composition for the Moon, Mars, Mercury, Venus, Jupiter, Saturn, Uranus and Neptune.
- **NASA mission results used as resource and hazard data:**
  - LCROSS: water ice in Cabeus, 5.6 ± 2.9 % by mass (Colaprete et al., 2010)
  - LRO: polar data and the Marius Hills pit
  - Phoenix: subsurface ice and perchlorates (Hecht et al., 2009)
  - MRO/HiRISE: mid-latitude ice (Dundas et al., 2018) and seasonal CO₂ jets
  - Mars Odyssey/THEMIS: Arsia Mons skylights
  - Opportunity: hematite spherules at Meridiani
  - MESSENGER: polar ice and sulfur on Mercury
  - Magellan: Maxwell Montes
  - VIPER: mission information
- **NASA 3D Resources**: Perseverance and Ingenuity 3D models (credit NASA/JPL-Caltech). We covered the NASA and JPL logos in their textures to comply with the rules.

---

## 8. Space Agency Partner Data & Other References

- **JAXA SELENE (Kaguya)**: discovery of the Marius Hills lava tube pit (2009).
- **CNSA Chang'e 4 Lunar Lander Neutron and Dosimetry (LND)**: lunar surface radiation dose (Zhang et al., 2020).
- **ESO**: Milky Way panorama, ESO/S. Brunier (CC BY 4.0).
- **Lunar Sourcebook** (Heiken, Vaniman and French, 1991): regolith oxygen, helium-3 and ilmenite references.
- **Venera 13** (via NASA NSSDC): basaltic surface composition of Venus.
- **Solar System Scope**: 2K planet textures (CC BY 4.0).
- **three.js r128** (MIT license).
- **Piper text-to-speech** (model es_ES-sharvard-medium, CC BY 3.0 corpus): Spanish voices.
- **Odyssey**: our team's own game engine, used as the base and extended during the hackathon. The MIT license notice is kept in `game/LICENSE.txt`.
- **Full credits list**: `game/assets/CREDITS.md` in the repository.

This project is not endorsed by NASA or any space agency and does not use NASA logos or branding.
