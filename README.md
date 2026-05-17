# Freshness Rush

REWE branded HTML5 mini-game demo based on the planning document in [游戏策划文档.md](/Users/cretid/Desktop/Game_demo/游戏策划文档.md).

## Run locally

Camera mode needs `https` or `localhost`.

```bash
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173/`.

## Project structure

- `index.html`: game shell and overlays
- `styles/main.css`: pixel-style UI and responsive layout
- `scripts/main.js`: gameplay loop, scoring, rewards, HUD, audio
- `scripts/hand-tracking.js`: MediaPipe-based camera control with mouse fallback
- `assets/images/backgrounds`: background art
- `assets/images/characters`: REWE employee mood states
- `assets/images/foods`: good, bad, and bonus foods
- `assets/images/powerups`: power-up items
- `assets/images/ui`: logo badge and interface art
- `assets/images/vehicles`: cart states

## Notes

- All in-game copy is in English, matching the design document.
- Rewards are demo-only front-end previews and do not connect to any REWE account or coupon backend.
- Sound effects are generated in code, so there is no audio asset folder in this demo.
