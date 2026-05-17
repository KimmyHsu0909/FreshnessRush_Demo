# REWE H5 Branded Mini-Game Design Document

## "Freshness Rush"

> Scope: Standalone HTML5 campaign page MVP  
> Goal: Use a lightweight 60-second motion-based gameplay loop to communicate REWE's brand associations of "freshness, regionality, and healthy eating"  
> Language: All in-game text must be presented in English

## 1. Project Positioning

- Game type: 60-second timed catching mini-game, similar to "fruit catching + light motion control"
- Core narrative: The player helps a REWE employee collect fresh local ingredients during a timed shopping rush, avoid spoiled food, and sprint for a high score in the final 10-second "Regional Market" phase
- Brand keywords: Freshness, Regionality, Healthy Eating
- Target devices: Desktop first, compatible with landscape tablets
- Technical recommendation: HTML5 Canvas + Phaser 3 + MediaPipe Hands

## 2. Core Gameplay

- The player moves left and right using camera-based hand gestures to control the REWE shopping cart at the bottom of the screen
- If the user denies camera permission, the game automatically switches to mouse movement control; a "mouse mode" option should also be available directly on the start screen
- Different food items fall from the top; catching "fresh, local, Nutri-Score A" food gives points
- Catching bad food removes 1 life, turns the cart red, and slows it down for 2.5 seconds
- Missing food does not deduct points or lives; it only loses the chance to score from that item
- The run ends immediately when the 60-second countdown finishes or when all 3 lives are lost
- At 50 seconds, the game enters "Regional Market" rush mode: bad food stops spawning, while golden strawberries and golden apples fall at a high frequency
- The cart can display thumbnails of the 6 most recently caught food items to create a "cart filling up" visual feedback loop

## 3. Controls and Collision

- Gesture system: One open hand; use the X coordinate of the palm center or wrist and mirror-map it to the cart position
- Smoothing: Use moving average or interpolation to reduce hand jitter; 80-120ms input buffering is recommended
- Mouse fallback: Mouse X directly controls the center point of the cart
- Base cart size: 176x96px on a 1280x720 reference canvas, approximately 14% of screen width
- Adaptive size range: Minimum width 144px, maximum width 208px
- Effective catch zone: Only the cart opening should count; recommended size is 72% of cart width and 20px height
- Collision rule: An item is considered "caught" when its center point enters the cart opening area; if it falls off the bottom of the screen, it is considered "missed"

## 4. Life and Failure Rules

- Starting lives: 3
- Catching bad food: Lose 1 life + cart movement speed reduced by 35% + red flashing state for 2.5 seconds
- Lives reach zero: Immediate Game Over and final score page is shown
- Missed items: No penalty
- During rush mode: No bad food appears, ensuring that the last 10 seconds focus on satisfying score-chasing

## 5. Difficulty Curve

Difficulty is updated every 10 seconds, gradually increasing both spawn frequency and falling speed.

| Time | Spawn Rate | Fall Speed | Bad Food Ratio | Notes |
|---|---:|---:|---:|---|
| 0-10s | 1.0 item/s | 220 px/s | 8% | Warm-up for new players |
| 10-20s | 1.2 item/s | 250 px/s | 12% | Establish game rhythm |
| 20-30s | 1.5 item/s | 290 px/s | 18% | Standard challenge |
| 30-40s | 1.8 item/s | 330 px/s | 22% | Clear pressure increase |
| 40-50s | 2.2 item/s | 380 px/s | 28% | High-pressure phase before sprint |
| 50-60s | 3.0 item/s | 460 px/s | 0% | Rush mode, 90% golden strawberries/apples |

## 6. Food List and Scoring

### Good Food

Unified size: 48x48px

| Food Item | Score |
|---|---:|
| Strawberry | 12 |
| Apple | 12 |
| Tomato | 10 |
| Carrot | 10 |
| Broccoli | 14 |
| Potato | 8 |
| Pumpkin | 16 |
| Blueberry | 14 |
| Corn | 10 |
| Sweet Pepper | 12 |
| Leafy Greens | 10 |
| Egg (Nutri-A label) | 15 |

### Bad Food

Unified size: 48x48px

| Food Item | Score | Negative Effect |
|---|---:|---|
| Wilted Lettuce | 0 | Lose 1 life + slow |
| Moldy Bread | 0 | Lose 1 life + slow |
| Expired Milk Carton | 0 | Lose 1 life + slow |
| Rotten Banana | 0 | Lose 1 life + slow |
| Expired Chips Bag | 0 | Lose 1 life + slow |

### Rush Mode Exclusive

| Food Item | Size | Score |
|---|---:|---:|
| Golden Strawberry | 48x48px | 24 |
| Golden Apple | 48x48px | 24 |

## 7. Special Power-Ups

- It is not recommended to add a "bomb" visual power-up. Reason: it conflicts with REWE's healthy, natural, and family-friendly tone; bad food already fulfills the risk mechanic

| Power-Up | Size | Effect |
|---|---:|---|
| Nutri-A Badge | 40x40px | +10 points, gain 1 shield against bad food |
| Ice Pack | 48x48px | Immediately clears the slow state and red damage state |
| REWE Freshness Box | 48x48px | +15 points, increases cart opening size by 25% for 5 seconds |

- The total spawn chance for special power-ups should be controlled at around 4%-6%
- Do not spawn functional power-ups during rush mode; keep it as a pure score-chasing experience

## 8. Character Expressions and Animation

### Score Thresholds

| Score | Expression State | Presentation |
|---|---|---|
| 0-50 | Idle | Light blinking |
| 51-200 | Happy | Nodding and smiling |
| 201-400 | Excited | Waving / leaning forward |
| 401-600 | Cheering | Jumping celebration |
| 601+ | Rush | Star effects / fast waving |
| 50-60s | Forced top state | Not affected by current score |

### Animation Frames

- Idle: 2 frames
- Happy: 4 frames
- Excited: 4 frames
- Cheering: 6 frames
- Rush: 6 frames + extra sparkle effect layer
- Bad food hit reaction: 3-frame one-shot, about 600ms, then return to the score-based state

## 9. UI and Page Structure

### In-Game HUD

- Top center: countdown timer
- Top left: current score
- Top right: lives, volume button, camera status icon
- Bottom left: REWE employee character
- Optional top right: collapsible camera preview window, minimized by default

### Start Screen

Must include:

- REWE logo + game title
- One brand subtitle, for example: "Collect fresh local ingredients and chase your REWE high score"
- Camera permission explanation
- Start with camera button
- Start with mouse button
- 3 short tutorial steps, skippable
- Privacy notice and campaign terms entry

Suggested copy:

> This game can use your camera for local gesture recognition. Video is processed only in real time on your device and is not uploaded, stored, or used for identity recognition. You may also decline permission and use mouse controls instead.

### End Screen

Must include:

- Final score
- Rank evaluation
- Whether a reward threshold was reached
- Reward popup or sample coupon display
- Play again button
- Download REWE App button
- Optional social share button

### Result Ranks

| Score | Rank | Copy |
|---|---|---|
| 0-149 | C | Fresh Rookie |
| 150-299 | B | Regional Buyer |
| 300-499 | A | Healthy Supply Officer |
| 500-699 | S | REWE Freshness Expert |
| 700+ | SS | Regional Market Star |

## 10. Rush Mode Prompting

- Countdown position: top center
- 50s trigger prompt: one full-screen green flash + large center text "Regional Market Open!"
- Trigger simultaneously: short cheer sound effect + UI border changes to gold + employee character forced into the highest emotion state
- Final 5 seconds: one countdown sound per second

## 11. Visual and Audio Direction

### Art Direction

- Style: original pixel art, warm farm / market atmosphere, do not directly imitate Stardew Valley
- Main colors: REWE red + fresh green + off-white neutrals
- Scene: market stalls, wooden crates, pastoral background, blue sky and clouds
- Asset requirement: all foods, cart, employee character, and UI icons should share consistent pixel outlines and bright saturated color treatment

### Sound Effects

- Catch good food: crisp "pick" sound
- Catch bad food: low failed-hit sound
- Miss: light drop / slip sound
- Rush mode intro: short horn or cheer cue
- Final 5 seconds: per-second countdown cue
- Game end: short resolving result sound

### Background Music

- Style: pixel market feel, upbeat acoustic guitar / harmonica / percussion, 110-120 BPM
- Recommendation: one looping main track + a faster added rhythm layer during rush mode
- Licensing: MVP can temporarily use CC0 or properly licensed commercial assets; final release should use original music or fully purchased brand usage rights
- Must provide: mute button

## 12. Coupon Plan and Compliance Boundaries

### Current Standalone MVP

- Rewards are display-only and not directly redeemable
- No REWE account login required
- The frontend shows a "sample coupon" based on score tier
- Coupon artwork must clearly state: Demo / Sample Reward, not a real redeemable coupon

### Score Tiers and Reward Display Categories

| Score | Display Reward |
|---|---|
| 0-299 | No coupon, only rank evaluation |
| 300-499 | 50% sample coupon for fruit category |
| 500-699 | 50% sample coupon for organic vegetables category |
| 700+ | 50% sample coupon for selected REWE own-brand healthy products |

### If Real Coupons Are Added in the Future

- Users must be required to log in to a REWE account before claiming
- Scores must be verified by the backend; frontend scores cannot be trusted
- Recommended rule: max 1 real claim per account per day; max 2 win eligibilities per device per day; only the first 3 runs per day can participate in redemption
- A total campaign cap, stock cap, validity period, and regional restrictions must be defined
- Do not issue coupons based only on frontend randomness or `localStorage`
- If device-based limits are used, additional legal review is required; heavy fingerprinting is not recommended

## 13. Data, Embedding, and Scope

- Embedding method: standalone campaign page, accessible directly as a page or embedded in a brand landing page via iframe
- Leaderboards: no global or regional leaderboard
- Data storage: MVP does not save score history; refreshing restarts the game
- Analytics: if not necessary, MVP should avoid third-party advertising / analytics SDKs to reduce privacy complexity
- Target resolution: reference 1280x720; compatible with 1366x768, 1920x1080, and landscape tablets
- Minimum recommended viewport: 1024x576
- Recommended browsers: latest desktop Chrome / Edge first
- Camera library: MediaPipe Hands, running locally in the browser

## 14. Compliance Notes

- This plan is designed around the principle that the camera is used only for local real-time processing, with no upload, no storage, and an optional mouse-mode fallback
- The page must not automatically request camera access on load; permission must only be triggered by an explicit user click
- The page must provide a clear and easy-to-understand privacy explanation and withdrawal method; if the user turns off the camera, the game must remain playable
- If real membership, coupon claiming, analytics, or retargeting are added in the future, separate privacy policy updates, campaign terms, and legal review will be required

## 15. Master AI Prompt for Art Asset Generation

The following content is intended to guide AI tools, external illustrators, or multi-tool workflows to generate all visual assets for this project in a unified way. This section is a formal production instruction set and should be used as a whole rather than broken into scattered fragments.

```text
You are now the lead game art director and pixel asset production owner for this project. Please generate a complete set of unified, high-quality visual assets for the REWE branded HTML5 web game "Freshness Rush". The goal is not to create a few mockups, but to produce a complete set of polished production-ready game assets with an absolutely consistent style and a visual system suitable for real web game implementation. Output everything in SVG format.

1. Overall Goal
Create a complete game visual system for REWE with an "RPG pixel art, market countryside atmosphere, natural, fresh, and cute" aesthetic. Every on-page element must be 100% unified within the same world and the same high-quality pixel-art visual language, including but not limited to:
- Game background
- REWE shopping cart
- Good food and bad food
- Employee character
- HUD interface
- Score digits
- Countdown timer
- Buttons
- Popups
- Start screen
- End screen
- Tutorial prompts
- Coupon popup
- Logo signboard
- All icons, borders, panels, and decorative elements
- The visual style of all text shown in the page

2. Mandatory Style Requirements
1. The overall style must be a unified RPG-game pixel-art style, with atmosphere inspired by Stardew Valley and Dave the Diver, but only in terms of mood, color organization, material language, UI layering, and cute natural charm. You must not directly imitate, collage, recreate, trace, or reuse any existing characters, UI, composition, tiles, or icons from those games.
2. Style keywords: natural, cute, fresh, warm, healthy, abundant harvest feeling, European neighborhood market feeling, approachable brand affinity.
3. The aesthetic quality must be premium. It must never look rough, cheap, blurry, dirty, or messy. Low-finish pixel sketch quality is forbidden. Random flat color blocking is forbidden. Unstable outlines are forbidden. Confused lighting logic is forbidden.
4. Pixel art must be "clear and refined", not a blurry illustration forcibly shrunk into pixel form. Edges must be crisp, volume must be readable, color use must be restrained, and detail must remain legible.
5. Character expressions must be natural and clear, not stiff, uncanny, or childish. The character needs real emotional variation: idle, happy, excited, cheering, disappointed.
6. All elements must feel like they belong to the same game. It must not feel like the UI is one style, the character is another style, and the icons are a third style.

3. Brand and Trademark Requirements
1. The REWE trademark must be searched and checked against the official style before use. Never hand-draw an incorrect version from memory.
2. Prefer using official REWE logo references or official source materials for accurate reconstruction. Do not alter the letterform structure.
3. According to official REWE Group references, the REWE logo should follow the "white text on red background" system. Review official references before drawing:
- https://www.rewe-group.com/de/unternehmen/struktur-und-vertriebslinien/rewe/
- https://www.rewe.de/
4. If the logo is integrated into a pixel-art UI, the supporting plaque, border, signboard, or storefront structure may be pixelated, but the logo itself must remain accurate and recognizable. Do not draw the wrong letters, change the colors, or distort it incorrectly.
5. If a pixelated version of the logo must be output, it may only be a faithful pixel translation. Do not redesign it in a cartoon style, do not change the white-on-red relationship, and do not reduce brand recognizability.

4. Tooling and Asset Usage Permissions
1. You may call or download external drawing tools, pixel tools, color tools, scaling tools, image editing tools, or other AI tools for collaborative generation.
2. You may search online references or download commercial-use assets, but you must verify licensing first. Never use assets with unclear or non-commercial licensing.
3. Do not directly reuse any existing resources, extracted assets, cropped screenshots, or traced materials from Stardew Valley, Dave the Diver, or any other game.
4. If external fonts, placeholder audio icons, textures, or helper assets are used, you must output a source and license explanation list alongside them.

5. Unified Visual Rules
1. Use a unified pixel density, outline logic, shadow direction, highlight treatment, and light-dark hierarchy.
2. It is recommended to establish the asset system around 16x16 / 32x32 / 48x48 base pixel grids, and output using 2x, 3x, or 4x integer scaling.
3. Non-integer scaling that causes blur is forbidden. Blurry linework is forbidden. Interpolation blur is forbidden.
4. All UI elements must use pixel-art visual language such as wooden frames, cloth banners, paper cards, shop signs, fruit crates, and farmer's market placards.
5. Text must also be unified in pixel style:
- Button labels must use a pixel font or pixel-styled title lettering
- HUD numbers must be clear pixel-style digits
- The title must feel game-like, brand-appropriate, and premium
- Modern default sans-serif web fonts must not appear mixed directly into the visual scene
6. All page buttons, panels, popups, progress bars, timers, life icons such as hearts/leaves, and score placards must be fully pixel-art in style.
7. The core color axis should use REWE red, natural produce greens, creamy white, wood browns, and sunny yellow, with an overall bright but not overly harsh palette.

6. Detailed Asset List
Please generate the following content completely, and ensure that every element shares the same unified style:

1. Start Screen
- REWE logo area
- Game title: "Freshness Rush"
- Camera permission explanation panel
- "Start with Camera" button
- "Start with Mouse" button
- Tutorial tip cards
- Background market scene

2. In-Game Scene
- Main background: blue sky, clouds, distant farmland/community, REWE market stall
- Ground layer and lower catch area
- Dynamic decorative elements: flags, wooden crates, produce displays, wind-blown grass leaves, etc.

3. Player-Controlled Object
- Pixel-art REWE shopping cart, cute, clear, and strongly branded
- Normal state
- Red slowed/damaged state after catching bad food
- Optional: upgraded state, shield state

4. Employee Character
- One REWE employee in the bottom left
- Style: natural, friendly, trustworthy, fresh, cute
- Must output full emotional state set:
  - Idle
  - Happy
  - Excited
  - Cheering
  - Disappointed
  - Highest excitement state for rush mode
- Character expressions must be clear and natural, never stiff
- Must be suitable for frame-by-frame animation

5. Food Assets
Good food:
- Strawberry
- Apple
- Tomato
- Carrot
- Broccoli
- Potato
- Pumpkin
- Blueberry
- Corn
- Sweet Pepper
- Leafy Greens
- Egg with Nutri-A marking

Bad food:
- Wilted Lettuce
- Moldy Bread
- Expired Milk Carton
- Rotten Banana
- Expired Chips Bag

Rush mode:
- Golden Strawberry
- Golden Apple

Requirements:
- Every food silhouette must be recognizable at a glance
- Good food must look fresh, full, and glossy
- Bad food must clearly look spoiled, but not so disgusting that it harms the broader brand impression
- All food assets must work well at a 48x48px reference size

6. Power-Ups and Feedback
- Nutri-A Badge
- Ice Pack
- REWE Freshness Box
- Hit effect
- Life-loss effect
- Rush mode effect
- Final 5-second countdown visual prompt

7. Game UI / HUD
- Score frame
- Countdown frame
- Life icon
- Camera status icon
- Volume button
- Pause button
- Rush mode alert bar
- Result rank badges (C/B/A/S/SS)

8. End Screen
- Final score panel
- Rank evaluation panel
- Coupon display panel
- "Play Again" button
- "Download REWE App" button
- Optional share button

7. Quality Standards
1. Every asset must be polished enough to be directly usable in a live product, not just a concept sketch.
2. Blurriness, chaotic jaggedness, over-simplification, unfocused detail, weak volume, and dirty gray colors are not acceptable.
3. Character facial features must remain stable and consistent; different expressions must not look like different characters.
4. All buttons must look obviously clickable and must include normal, hover, and pressed states.
```
