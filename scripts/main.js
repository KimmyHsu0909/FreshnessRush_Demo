(function () {
  "use strict";

  const GAME_WIDTH = 1280;
  const GAME_HEIGHT = 720;
  const GAME_DURATION = 60;
  const BASE_CART = { width: 176, height: 96 };
  const STARTING_LIVES = 3;

  // Content tables mirror the design document so balancing stays in one place.
  const GOOD_FOODS = [
    { id: "strawberry", label: "Strawberry", points: 12, asset: "goodStrawberry" },
    { id: "apple", label: "Apple", points: 12, asset: "goodApple" },
    { id: "tomato", label: "Tomato", points: 10, asset: "goodTomato" },
    { id: "carrot", label: "Carrot", points: 10, asset: "goodCarrot" },
    { id: "broccoli", label: "Broccoli", points: 14, asset: "goodBroccoli" },
    { id: "potato", label: "Potato", points: 8, asset: "goodPotato" },
    { id: "pumpkin", label: "Pumpkin", points: 16, asset: "goodPumpkin" },
    { id: "blueberry", label: "Blueberry", points: 14, asset: "goodBlueberry" },
    { id: "corn", label: "Corn", points: 10, asset: "goodCorn" },
    { id: "pepper", label: "Sweet Pepper", points: 12, asset: "goodPepper" },
    { id: "greens", label: "Leafy Greens", points: 10, asset: "goodGreens" },
    { id: "egg", label: "Nutri-A Egg", points: 15, asset: "goodEgg" },
  ];

  const BAD_FOODS = [
    { id: "wiltedLettuce", label: "Wilted Lettuce", asset: "badWiltedLettuce" },
    { id: "moldyBread", label: "Moldy Bread", asset: "badMoldyBread" },
    { id: "expiredMilk", label: "Expired Milk", asset: "badExpiredMilk" },
    { id: "rottenBanana", label: "Rotten Banana", asset: "badRottenBanana" },
    { id: "expiredChips", label: "Expired Chips", asset: "badExpiredChips" },
  ];

  const BONUS_FOODS = [
    { id: "goldenStrawberry", label: "Golden Strawberry", points: 24, asset: "bonusStrawberry" },
    { id: "goldenApple", label: "Golden Apple", points: 24, asset: "bonusApple" },
  ];

  const POWERUPS = [
    {
      id: "nutriBadge",
      label: "Nutri Shield",
      asset: "powerNutriBadge",
      width: 40,
      height: 40,
      apply(game) {
        game.state.score += 10;
        game.state.shield += 1;
        game.showToast("Nutri Shield +1");
      },
    },
    {
      id: "icePack",
      label: "Cool Reset",
      asset: "powerIcePack",
      apply(game) {
        game.state.slowTimer = 0;
        game.state.damageFlashTimer = 0;
        game.showToast("Slow effect cleared");
      },
    },
    {
      id: "freshBox",
      label: "Fresh Box",
      asset: "powerFreshBox",
      apply(game) {
        game.state.score += 15;
        game.state.expandTimer = Math.max(game.state.expandTimer, 5);
        game.showToast("Wide cart for 5s");
      },
    },
  ];

  const RANKS = [
    { min: 700, rank: "SS", copy: "Regional Market Star" },
    { min: 500, rank: "S", copy: "REWE Freshness Pro" },
    { min: 300, rank: "A", copy: "Healthy Supply Captain" },
    { min: 150, rank: "B", copy: "Regional Shopper" },
    { min: 0, rank: "C", copy: "Fresh Rookie" },
  ];

  const COUPON_TIERS = [
    {
      min: 700,
      title: "50% off selected REWE own-brand healthy products",
      copy: "Demo reward only. Real redemption would require account login and server validation.",
    },
    {
      min: 500,
      title: "50% off selected organic vegetables",
      copy: "Demo reward only. This screen previews the post-game benefit concept.",
    },
    {
      min: 300,
      title: "50% off selected fresh fruit",
      copy: "Demo reward only. Reach higher scores to preview stronger offers.",
    },
  ];

  const DIFFICULTY_STAGES = [
    { until: 10, spawnRate: 1.0, minSpeed: 220, maxSpeed: 240, badChance: 0.08 },
    { until: 20, spawnRate: 1.2, minSpeed: 250, maxSpeed: 270, badChance: 0.12 },
    { until: 30, spawnRate: 1.5, minSpeed: 290, maxSpeed: 310, badChance: 0.18 },
    { until: 40, spawnRate: 1.8, minSpeed: 330, maxSpeed: 350, badChance: 0.22 },
    { until: 50, spawnRate: 2.2, minSpeed: 380, maxSpeed: 410, badChance: 0.28 },
    { until: 60, spawnRate: 3.0, minSpeed: 450, maxSpeed: 490, badChance: 0 },
  ];

  const ASSET_PATHS = {
    background: "assets/images/backgrounds/background.jpg",
    reweBadge: "assets/images/ui/rewe_badge.svg",
    cartNormal: "assets/images/vehicles/cart_normal.svg",
    cartDamaged: "assets/images/vehicles/cart_damaged.svg",
    clerkIdle: "assets/images/characters/idle.png",
    clerkHappy: "assets/images/characters/happy.png",
    clerkExcited: "assets/images/characters/excited.png",
    clerkCheer: "assets/images/characters/cheer.png",
    clerkWow: "assets/images/characters/wow.png",
    clerkSad: "assets/images/characters/sad.png",
    goodStrawberry: "assets/images/foods/good/strawberry.svg",
    goodApple: "assets/images/foods/good/apple.svg",
    goodTomato: "assets/images/foods/good/tomato.svg",
    goodCarrot: "assets/images/foods/good/carrot.svg",
    goodBroccoli: "assets/images/foods/good/broccoli.svg",
    goodPotato: "assets/images/foods/good/potato.svg",
    goodPumpkin: "assets/images/foods/good/pumpkin.svg",
    goodBlueberry: "assets/images/foods/good/blueberry.svg",
    goodCorn: "assets/images/foods/good/corn.svg",
    goodPepper: "assets/images/foods/good/pepper.svg",
    goodGreens: "assets/images/foods/good/greens.svg",
    goodEgg: "assets/images/foods/good/egg.svg",
    badWiltedLettuce: "assets/images/foods/bad/wilted_lettuce.svg",
    badMoldyBread: "assets/images/foods/bad/moldy_bread.svg",
    badExpiredMilk: "assets/images/foods/bad/expired_milk.svg",
    badRottenBanana: "assets/images/foods/bad/rotten_banana.svg",
    badExpiredChips: "assets/images/foods/bad/expired_chips.svg",
    bonusStrawberry: "assets/images/foods/bonus/golden_strawberry.svg",
    bonusApple: "assets/images/foods/bonus/golden_apple.svg",
    powerNutriBadge: "assets/images/powerups/nutri_badge.svg",
    powerIcePack: "assets/images/powerups/ice_pack.svg",
    powerFreshBox: "assets/images/powerups/fresh_box.svg",
  };

  // Simple synth tones keep the demo self-contained without shipping audio files.
  class AudioManager {
    constructor() {
      this.context = null;
      this.enabled = true;
      this.masterGain = null;
      this.musicGain = null;
      this.musicTimer = null;
      this.musicStep = 0;
      this.musicMode = "off";
    }

    toggle() {
      this.enabled = !this.enabled;
      if (this.enabled && this.context && this.context.state === "suspended") {
        this.context.resume();
      }
      this.syncMusicVolume();
      return this.enabled;
    }

    prime() {
      if (!this.context) {
        const AudioContextRef = window.AudioContext || window.webkitAudioContext;
        if (AudioContextRef) {
          this.context = new AudioContextRef();
          this.masterGain = this.context.createGain();
          this.masterGain.gain.value = 0.9;
          this.masterGain.connect(this.context.destination);

          this.musicGain = this.context.createGain();
          this.musicGain.gain.value = 0.0001;
          this.musicGain.connect(this.masterGain);
        }
      }

      if (this.context && this.context.state === "suspended") {
        this.context.resume();
      }
    }

    playGood() {
      this.tone({ frequency: 740, duration: 0.05, type: "square", gain: 0.05 });
      this.tone({ frequency: 960, duration: 0.08, type: "triangle", gain: 0.03, delay: 0.04 });
    }

    playBad() {
      this.tone({ frequency: 180, duration: 0.16, type: "sawtooth", gain: 0.05 });
    }

    playRush() {
      this.tone({ frequency: 520, duration: 0.1, type: "square", gain: 0.05 });
      this.tone({ frequency: 780, duration: 0.1, type: "square", gain: 0.05, delay: 0.1 });
      this.tone({ frequency: 1040, duration: 0.12, type: "triangle", gain: 0.04, delay: 0.2 });
    }

    playMiss() {
      this.tone({ frequency: 280, duration: 0.03, type: "triangle", gain: 0.025 });
    }

    playTick() {
      this.tone({ frequency: 900, duration: 0.03, type: "square", gain: 0.03 });
    }

    playGameOver() {
      this.tone({ frequency: 450, duration: 0.08, type: "triangle", gain: 0.04 });
      this.tone({ frequency: 340, duration: 0.1, type: "triangle", gain: 0.04, delay: 0.1 });
      this.tone({ frequency: 250, duration: 0.18, type: "sine", gain: 0.05, delay: 0.22 });
    }

    playPowerup() {
      this.tone({ frequency: 680, duration: 0.08, type: "triangle", gain: 0.04 });
      this.tone({ frequency: 980, duration: 0.1, type: "triangle", gain: 0.04, delay: 0.08 });
    }

    startMusic(mode = "full") {
      this.prime();
      if (!this.context || !this.musicGain) {
        return;
      }

      this.musicMode = mode;
      this.syncMusicVolume();

      if (this.musicTimer) {
        return;
      }

      this.musicStep = 0;
      const tempoMs = 125;
      const leadPattern = [659, 784, 880, 784, 698, 784, 988, 784];
      const bassPattern = [196, 196, 220, 196, 174, 174, 196, 220];

      const tick = () => {
        if (!this.context || !this.enabled) {
          this.musicTimer = window.setTimeout(tick, tempoMs);
          return;
        }

        const lead = leadPattern[this.musicStep % leadPattern.length];
        const bass = bassPattern[this.musicStep % bassPattern.length];
        const accent = this.musicStep % 8 === 0;

        this.musicTone({
          frequency: lead,
          duration: accent ? 0.11 : 0.08,
          type: "square",
          gain: accent ? 0.08 : 0.055,
        });
        this.musicTone({
          frequency: bass,
          duration: 0.16,
          type: "triangle",
          gain: 0.04,
        });

        if (this.musicStep % 2 === 0) {
          this.musicTone({
            frequency: lead * 0.5,
            duration: 0.04,
            type: "sine",
            gain: 0.018,
            delay: 0.03,
          });
        }

        this.musicStep += 1;
        this.musicTimer = window.setTimeout(tick, tempoMs);
      };

      tick();
    }

    setMusicMode(mode) {
      this.musicMode = mode;
      this.syncMusicVolume();
    }

    stopMusic() {
      this.musicMode = "off";
      this.syncMusicVolume();
      if (this.musicTimer) {
        window.clearTimeout(this.musicTimer);
        this.musicTimer = null;
      }
    }

    syncMusicVolume() {
      if (!this.musicGain || !this.context) {
        return;
      }

      const now = this.context.currentTime;
      let target = 0.0001;

      if (this.enabled) {
        target = this.musicMode === "full" ? 0.22 : this.musicMode === "dim" ? 0.05 : 0.0001;
      }

      this.musicGain.gain.cancelScheduledValues(now);
      this.musicGain.gain.setTargetAtTime(target, now, 0.08);
    }

    musicTone({ frequency, duration, type, gain, delay = 0 }) {
      if (!this.context || !this.musicGain || !this.enabled) {
        return;
      }

      const now = this.context.currentTime + delay;
      const oscillator = this.context.createOscillator();
      const volume = this.context.createGain();

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      volume.gain.setValueAtTime(gain, now);
      volume.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      oscillator.connect(volume);
      volume.connect(this.musicGain);

      oscillator.start(now);
      oscillator.stop(now + duration);
    }

    tone({ frequency, duration, type, gain, delay = 0 }) {
      if (!this.enabled) {
        return;
      }

      this.prime();

      if (!this.context) {
        return;
      }

      const now = this.context.currentTime + delay;
      const oscillator = this.context.createOscillator();
      const volume = this.context.createGain();

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      volume.gain.setValueAtTime(gain, now);
      volume.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      oscillator.connect(volume);
      volume.connect(this.masterGain || this.context.destination);

      oscillator.start(now);
      oscillator.stop(now + duration);
    }
  }

  class FreshnessRushGame {
    constructor() {
      this.canvas = document.getElementById("gameCanvas");
      this.ctx = this.canvas.getContext("2d");
      this.ctx.imageSmoothingEnabled = false;

      this.elements = {
        score: document.getElementById("scoreValue"),
        timer: document.getElementById("timerValue"),
        lives: document.getElementById("livesValue"),
        mode: document.getElementById("modeValue"),
        shield: document.getElementById("shieldValue"),
        cartBuff: document.getElementById("cartBuffValue"),
        cameraStatus: document.getElementById("cameraStatus"),
        rushBanner: document.getElementById("rushBanner"),
        toast: document.getElementById("toastMessage"),
        employeePortrait: document.getElementById("employeePortrait"),
        employeeMood: document.getElementById("employeeMoodLabel"),
        settingsButton: document.getElementById("settingsButton"),
        pauseScreen: document.getElementById("pauseScreen"),
        pauseMusicButton: document.getElementById("pauseMusicButton"),
        resumeButton: document.getElementById("resumeButton"),
        backToStartButton: document.getElementById("backToStartButton"),
        endGameButton: document.getElementById("endGameButton"),
        guideScreen: document.getElementById("guideScreen"),
        goodGuideList: document.getElementById("goodGuideList"),
        badGuideList: document.getElementById("badGuideList"),
        bonusGuideList: document.getElementById("bonusGuideList"),
        guideContinueButton: document.getElementById("guideContinueButton"),
        startScreen: document.getElementById("startScreen"),
        endScreen: document.getElementById("endScreen"),
        finalScore: document.getElementById("finalScoreValue"),
        rankValue: document.getElementById("rankValue"),
        rankCopy: document.getElementById("rankCopy"),
        couponCard: document.getElementById("couponCard"),
        couponTitle: document.getElementById("couponTitle"),
        couponCopy: document.getElementById("couponCopy"),
        recentCatchList: document.getElementById("recentCatchList"),
        cameraPreview: document.getElementById("cameraPreview"),
        loadingLabel: document.getElementById("loadingLabel"),
        cameraStartButton: document.getElementById("cameraStartButton"),
        mouseStartButton: document.getElementById("mouseStartButton"),
        replayButton: document.getElementById("replayButton"),
        shareButton: document.getElementById("shareButton"),
      };

      this.assets = {};
      this.audio = new AudioManager();
      this.handTracking = new window.HandTrackingController(this.elements.cameraPreview);

      this.lastFrameTime = performance.now();
      this.assetsReady = false;
      this.activeMode = "mouse";
      this.preferredRestartMode = "mouse";
      this.pendingMode = "mouse";
      this.mouseNormalizedX = 0.5;
      this.cameraNormalizedX = 0.5;

      this.state = this.createState();

      this.bindEvents();
      this.loadAssets();
      requestAnimationFrame((time) => this.frame(time));
    }

    createState() {
      return {
        playing: false,
        paused: false,
        elapsed: 0,
        timeLeft: GAME_DURATION,
        score: 0,
        lives: STARTING_LIVES,
        shield: 0,
        spawnAccumulator: 0,
        items: [],
        recentCatches: [],
        cartX: GAME_WIDTH * 0.5,
        targetX: GAME_WIDTH * 0.5,
        slowTimer: 0,
        expandTimer: 0,
        damageFlashTimer: 0,
        moodShockTimer: 0,
        rushMode: false,
        rushBannerTimer: 0,
        toastTimer: 0,
        toastText: "",
        nextCountdownTick: 5,
      };
    }

    bindEvents() {
      this.elements.cameraStartButton.addEventListener("click", () => this.startRound("camera"));
      this.elements.mouseStartButton.addEventListener("click", () => this.startRound("mouse"));
      this.elements.replayButton.addEventListener("click", () => this.startRound(this.preferredRestartMode));
      this.elements.shareButton.addEventListener("click", () => this.shareResults());
      this.elements.settingsButton.addEventListener("click", () => this.togglePauseMenu());
      this.elements.pauseMusicButton.addEventListener("click", () => {
        const enabled = this.audio.toggle();
        this.elements.pauseMusicButton.textContent = enabled ? "Music On" : "Music Off";
      });
      this.elements.resumeButton.addEventListener("click", () => this.resumeGame());
      this.elements.backToStartButton.addEventListener("click", () => this.backToStart());
      this.elements.endGameButton.addEventListener("click", () => this.finishRound("manual"));
      this.elements.guideContinueButton.addEventListener("click", () => this.beginGameplay());

      window.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          this.togglePauseMenu();
        }
      });

      this.canvas.addEventListener("pointermove", (event) => {
        const rect = this.canvas.getBoundingClientRect();
        const ratio = clamp((event.clientX - rect.left) / rect.width, 0, 1);
        this.mouseNormalizedX = ratio;
        if (this.activeMode === "mouse" && this.state.playing && !this.state.paused) {
          this.state.targetX = ratio * GAME_WIDTH;
        }
      });
    }

    async loadAssets() {
      this.elements.loadingLabel.textContent = "Loading local assets...";
      this.assets = await loadImages(ASSET_PATHS);
      this.assetsReady = true;
      this.elements.loadingLabel.textContent = "Choose your control mode.";
      this.elements.cameraStartButton.disabled = false;
      this.elements.mouseStartButton.disabled = false;
      this.updateEmployee("idle");
      this.renderGuideLists();
      this.renderRecentCatches();
      this.updateHud();
    }

    async startRound(mode) {
      if (!this.assetsReady) {
        return;
      }

      this.audio.prime();
      this.stopRound(false);
      this.audio.startMusic("dim");
      this.state = this.createState();
      this.elements.pauseScreen.classList.add("hidden");
      this.elements.guideScreen.classList.add("hidden");
      this.elements.endScreen.classList.add("hidden");
      this.elements.startScreen.classList.add("hidden");

      let resolvedMode = mode;

      if (mode === "camera") {
        this.setCameraStatus("Starting camera...");
        const result = await this.handTracking.start(
          (x) => {
            this.cameraNormalizedX = clamp(x, 0, 1);
            if (this.activeMode === "camera" && this.state.playing && !this.state.paused) {
              this.state.targetX = this.cameraNormalizedX * GAME_WIDTH;
            }
          },
          (text) => this.setCameraStatus(text),
        );

        if (!result.ok) {
          resolvedMode = "mouse";
          this.setCameraStatus("Mouse Fallback");
          this.showToast(result.reason);
        } else {
          this.setCameraStatus("Camera Live");
        }
      } else {
        this.handTracking.stop();
        this.setCameraStatus("Camera Off");
      }

      this.activeMode = resolvedMode;
      this.preferredRestartMode = resolvedMode;
      this.pendingMode = resolvedMode;
      this.state.targetX =
        (resolvedMode === "camera" ? this.cameraNormalizedX : this.mouseNormalizedX) * GAME_WIDTH;
      this.state.cartX = this.state.targetX;
      this.updateHud();
      this.updateEmployee("idle");
      this.elements.pauseMusicButton.textContent = this.audio.enabled ? "Music On" : "Music Off";
      this.elements.guideScreen.classList.remove("hidden");
      this.showToast("Check the collectibles guide before you begin.");
    }

    stopRound(showStartScreen) {
      this.state.playing = false;
      this.state.paused = false;
      this.handTracking.stop();
      this.elements.pauseScreen.classList.add("hidden");
      this.elements.guideScreen.classList.add("hidden");
      this.audio.setMusicMode(showStartScreen ? "dim" : "off");

      if (showStartScreen) {
        this.elements.startScreen.classList.remove("hidden");
      }
    }

    beginGameplay() {
      this.elements.guideScreen.classList.add("hidden");
      this.state.playing = true;
      this.state.paused = false;
      this.activeMode = this.pendingMode;
      this.audio.setMusicMode("full");
      this.showToast(
        this.activeMode === "camera"
          ? "Camera mode ready. Move your hand left and right."
          : "Mouse mode ready. Move across the game window.",
      );
    }

    setCameraStatus(text) {
      this.elements.cameraStatus.textContent = text;
    }

    frame(time) {
      const delta = Math.min((time - this.lastFrameTime) / 1000, 0.05);
      this.lastFrameTime = time;

      if (this.state.playing && !this.state.paused) {
        this.update(delta);
      }

      this.render();
      requestAnimationFrame((nextTime) => this.frame(nextTime));
    }

    update(delta) {
      this.state.elapsed += delta;
      this.state.timeLeft = Math.max(0, GAME_DURATION - this.state.elapsed);

      if (!this.state.rushMode && this.state.elapsed >= 50) {
        this.enterRushMode();
      }

      if (this.state.timeLeft <= 5 && this.state.timeLeft > 0) {
        const tick = Math.ceil(this.state.timeLeft);
        if (tick < this.state.nextCountdownTick) {
          this.state.nextCountdownTick = tick;
          this.audio.playTick();
        }
      }

      this.updateTimers(delta);
      this.updateCart(delta);
      this.spawnItems(delta);
      this.updateItems(delta);
      this.updateHud();
      this.updateEmployee(this.getMoodKey());

      if (this.state.timeLeft <= 0) {
        this.finishRound("time");
      }
    }

    updateTimers(delta) {
      this.state.slowTimer = Math.max(0, this.state.slowTimer - delta);
      this.state.expandTimer = Math.max(0, this.state.expandTimer - delta);
      this.state.damageFlashTimer = Math.max(0, this.state.damageFlashTimer - delta);
      this.state.moodShockTimer = Math.max(0, this.state.moodShockTimer - delta);
      this.state.rushBannerTimer = Math.max(0, this.state.rushBannerTimer - delta);
      this.state.toastTimer = Math.max(0, this.state.toastTimer - delta);

      this.elements.rushBanner.classList.toggle("is-visible", this.state.rushBannerTimer > 0);
      this.elements.toast.classList.toggle("is-visible", this.state.toastTimer > 0);
      this.elements.toast.textContent = this.state.toastText;
    }

    updateCart(delta) {
      const moveRate = this.state.slowTimer > 0 ? 4.5 : 7.2;
      this.state.cartX = lerp(this.state.cartX, this.state.targetX, Math.min(1, delta * moveRate));
      this.state.cartX = clamp(
        this.state.cartX,
        this.getCartWidth() * 0.5,
        GAME_WIDTH - this.getCartWidth() * 0.5,
      );
    }

    spawnItems(delta) {
      const difficulty = this.getDifficulty();
      this.state.spawnAccumulator += difficulty.spawnRate * delta;

      while (this.state.spawnAccumulator >= 1) {
        this.state.spawnAccumulator -= 1;
        this.state.items.push(this.createSpawn(difficulty));
      }
    }

    createSpawn(difficulty) {
      const speed = randomRange(difficulty.minSpeed, difficulty.maxSpeed);
      const x = randomRange(64, GAME_WIDTH - 64);

      // Rush mode swaps pressure for a short high-score finale.
      if (this.state.rushMode) {
        const source = Math.random() < 0.9 ? pickRandom(BONUS_FOODS) : pickRandom(GOOD_FOODS);
        return this.makeItem(source, "good", x, speed);
      }

      const roll = Math.random();
      if (roll < 0.05) {
        return this.makeItem(pickRandom(POWERUPS), "powerup", x, speed * 0.9);
      }

      if (roll < 0.05 + difficulty.badChance) {
        return this.makeItem(pickRandom(BAD_FOODS), "bad", x, speed);
      }

      return this.makeItem(pickRandom(GOOD_FOODS), "good", x, speed);
    }

    makeItem(definition, kind, x, speed) {
      return {
        ...definition,
        kind,
        x,
        y: -64,
        width: definition.width || 48,
        height: definition.height || 48,
        speed,
      };
    }

    updateItems(delta) {
      const catchZone = this.getCatchZone();

      this.state.items = this.state.items.filter((item) => {
        item.y += item.speed * delta;

        const centerX = item.x;
        const centerY = item.y + item.height * 0.5;
        const caught =
          centerX >= catchZone.x &&
          centerX <= catchZone.x + catchZone.width &&
          centerY >= catchZone.y &&
          centerY <= catchZone.y + catchZone.height;

        if (caught) {
          this.handleCatch(item);
          return false;
        }

        if (item.y >= GAME_HEIGHT + 60) {
          this.audio.playMiss();
          return false;
        }

        return true;
      });
    }

    handleCatch(item) {
      if (item.kind === "good") {
        this.state.score += item.points;
        this.addRecentCatch(item.asset);
        this.audio.playGood();
        this.showToast(`${item.label} +${item.points}`);
        return;
      }

      if (item.kind === "powerup") {
        item.apply(this);
        this.addRecentCatch(item.asset);
        this.audio.playPowerup();
        return;
      }

      if (this.state.shield > 0) {
        this.state.shield -= 1;
        this.showToast("Shield blocked spoiled food");
        this.audio.playPowerup();
        return;
      }

      this.state.lives -= 1;
      this.state.slowTimer = 2.5;
      this.state.damageFlashTimer = 2.5;
      this.state.moodShockTimer = 0.8;
      this.audio.playBad();
      this.showToast(`${item.label} hit the cart`);

      if (this.state.lives <= 0) {
        this.finishRound("lives");
      }
    }

    enterRushMode() {
      this.state.rushMode = true;
      this.state.rushBannerTimer = 2.2;
      this.showToast("Regional Market Open!");
      this.audio.playRush();
    }

    finishRound(reason) {
      if (!this.state.playing) {
        return;
      }

      this.state.playing = false;
      this.state.paused = false;
      this.handTracking.stop();
      this.elements.pauseScreen.classList.add("hidden");
      this.elements.guideScreen.classList.add("hidden");
      this.setCameraStatus("Round Complete");
      this.audio.setMusicMode("dim");
      this.audio.playGameOver();

      const rank = this.getRank();
      const coupon = this.getCoupon();

      this.elements.finalScore.textContent = String(this.state.score);
      this.elements.rankValue.textContent = rank.rank;
      this.elements.rankCopy.textContent = rank.copy;

      if (coupon) {
        this.elements.couponCard.classList.remove("hidden");
        this.elements.couponTitle.textContent = coupon.title;
        this.elements.couponCopy.textContent = coupon.copy;
      } else {
        this.elements.couponCard.classList.add("hidden");
      }

      this.elements.endScreen.classList.remove("hidden");
      this.showToast(
        reason === "lives"
          ? "The cart ran out of lives."
          : reason === "manual"
            ? "Run ended from settings."
            : "Time is up. Market run complete.",
      );
    }

    togglePauseMenu() {
      if (!this.state.playing) {
        return;
      }

      if (this.state.paused) {
        this.resumeGame();
        return;
      }

      this.state.paused = true;
      this.audio.setMusicMode("dim");
      this.elements.pauseMusicButton.textContent = this.audio.enabled ? "Music On" : "Music Off";
      this.elements.pauseScreen.classList.remove("hidden");
      this.showToast("Game paused");
    }

    resumeGame() {
      if (!this.state.playing) {
        return;
      }

      this.state.paused = false;
      this.elements.pauseScreen.classList.add("hidden");
      this.audio.setMusicMode("full");
      this.showToast("Back to the market");
    }

    backToStart() {
      this.stopRound(true);
      this.elements.endScreen.classList.add("hidden");
      this.setCameraStatus("Camera Off");
      this.showToast("Returned to the main screen");
    }

    getDifficulty() {
      return (
        DIFFICULTY_STAGES.find((stage) => this.state.elapsed < stage.until) ||
        DIFFICULTY_STAGES[DIFFICULTY_STAGES.length - 1]
      );
    }

    getRank() {
      return RANKS.find((item) => this.state.score >= item.min) || RANKS[RANKS.length - 1];
    }

    getCoupon() {
      return COUPON_TIERS.find((tier) => this.state.score >= tier.min) || null;
    }

    getCartWidth() {
      return this.state.expandTimer > 0 ? BASE_CART.width * 1.25 : BASE_CART.width;
    }

    getCatchZone() {
      const cartWidth = this.getCartWidth();
      const cartX = this.state.cartX - cartWidth * 0.5;
      const cartY = GAME_HEIGHT - 120;

      return {
        x: cartX + cartWidth * 0.14,
        y: cartY + 6,
        width: cartWidth * 0.72,
        height: 20,
      };
    }

    addRecentCatch(assetKey) {
      this.state.recentCatches.unshift(assetKey);
      this.state.recentCatches = this.state.recentCatches.slice(0, 6);
      this.renderRecentCatches();
    }

    renderRecentCatches() {
      this.elements.recentCatchList.innerHTML = "";

      for (let index = 0; index < 6; index += 1) {
        const chip = document.createElement("div");
        chip.className = "recent-chip";

        const assetKey = this.state.recentCatches[index];
        if (assetKey && this.assets[assetKey]) {
          const image = document.createElement("img");
          image.src = this.assets[assetKey].src;
          image.alt = assetKey;
          chip.appendChild(image);
        }

        this.elements.recentCatchList.appendChild(chip);
      }
    }

    renderGuideLists() {
      this.renderGuideGroup(this.elements.goodGuideList, GOOD_FOODS);
      this.renderGuideGroup(this.elements.badGuideList, BAD_FOODS);
      this.renderGuideGroup(this.elements.bonusGuideList, BONUS_FOODS);
    }

    renderGuideGroup(container, definitions) {
      container.innerHTML = "";
      definitions.forEach((item) => {
        const card = document.createElement("div");
        card.className = "guide-item";

        const image = document.createElement("img");
        image.src = this.assets[item.asset].src;
        image.alt = item.label;

        const label = document.createElement("span");
        label.textContent = item.label;

        card.appendChild(image);
        card.appendChild(label);
        container.appendChild(card);
      });
    }

    showToast(message) {
      this.state.toastText = message;
      this.state.toastTimer = 2;
      this.elements.toast.textContent = message;
    }

    updateHud() {
      this.elements.score.textContent = String(this.state.score);
      this.elements.timer.textContent = String(Math.ceil(this.state.timeLeft)).padStart(2, "0");
      this.elements.lives.textContent = `${Math.max(this.state.lives, 0)} / ${STARTING_LIVES}`;
      this.elements.mode.textContent = this.activeMode === "camera" ? "Camera" : "Mouse";
      this.elements.shield.textContent = `Shield ${this.state.shield}`;
      this.elements.cartBuff.textContent =
        this.state.expandTimer > 0
          ? `Wide ${this.state.expandTimer.toFixed(1)}s`
          : this.state.slowTimer > 0
            ? `Slow ${this.state.slowTimer.toFixed(1)}s`
            : "Cart Normal";
    }

    getMoodKey() {
      if (this.state.moodShockTimer > 0) {
        return "sad";
      }
      if (this.state.rushMode) {
        return "wow";
      }
      if (this.state.score >= 601) {
        return "wow";
      }
      if (this.state.score >= 401) {
        return "cheer";
      }
      if (this.state.score >= 201) {
        return "excited";
      }
      if (this.state.score >= 51) {
        return "happy";
      }
      return "idle";
    }

    updateEmployee(mood) {
      const moodMap = {
        idle: { label: "Idle", asset: "clerkIdle" },
        happy: { label: "Happy", asset: "clerkHappy" },
        excited: { label: "Excited", asset: "clerkExcited" },
        cheer: { label: "Cheering", asset: "clerkCheer" },
        wow: { label: "Rush Mode", asset: "clerkWow" },
        sad: { label: "Oops", asset: "clerkSad" },
      };

      const target = moodMap[mood];
      this.elements.employeePortrait.src = this.assets[target.asset]
        ? this.assets[target.asset].src
        : ASSET_PATHS[target.asset];
      this.elements.employeeMood.textContent = target.label;
    }

    render() {
      this.ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      const background = this.assets.background;
      if (background) {
        this.ctx.drawImage(background, 0, 0, GAME_WIDTH, GAME_HEIGHT);
      }

      // DOM handles menus and HUD, canvas handles the live playfield only.
      this.drawPlayfield();
    }

    drawPlayfield() {
      for (const item of this.state.items) {
        const image = this.assets[item.asset];
        if (image) {
          this.ctx.drawImage(
            image,
            Math.round(item.x - item.width * 0.5),
            Math.round(item.y),
            item.width,
            item.height,
          );
        }
      }

      this.drawRushTint();
      this.drawCart();
    }

    drawRushTint() {
      if (!this.state.rushMode) {
        return;
      }

      this.ctx.save();
      this.ctx.globalAlpha = 0.08;
      this.ctx.fillStyle = "#f7e06b";
      this.ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      this.ctx.restore();
    }

    drawCart() {
      const cartWidth = this.getCartWidth();
      const cartHeight = BASE_CART.height;
      const cartX = Math.round(this.state.cartX - cartWidth * 0.5);
      const cartY = GAME_HEIGHT - 120;
      const image =
        this.state.damageFlashTimer > 0 ? this.assets.cartDamaged : this.assets.cartNormal;

      if (image) {
        this.ctx.drawImage(image, cartX, cartY, cartWidth, cartHeight);
      }

      if (this.state.shield > 0) {
        this.ctx.save();
        this.ctx.strokeStyle = "#9be5ff";
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(cartX - 4, cartY - 4, cartWidth + 8, cartHeight + 8);
        this.ctx.restore();
      }
    }

    async shareResults() {
      const text = `I scored ${this.state.score} in Freshness Rush.`;

      if (navigator.share) {
        try {
          await navigator.share({
            title: "Freshness Rush",
            text,
            url: window.location.href,
          });
          return;
        } catch (error) {
          // Ignore cancel and try clipboard fallback.
        }
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${text} ${window.location.href}`);
        this.showToast("Score copied to clipboard");
      } else {
        this.showToast("Sharing is not available on this browser");
      }
    }
  }

  async function loadImages(assetPaths) {
    const entries = Object.entries(assetPaths);
    const images = {};

    await Promise.all(
      entries.map(async ([key, path]) => {
        images[key] = await loadImage(path);
      }),
    );

    return images;
  }

  function loadImage(path) {
    return new Promise((resolve) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image), { once: true });
      image.addEventListener("error", () => resolve(image), { once: true });
      image.src = path;
    });
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function lerp(start, end, amount) {
    return start + (end - start) * amount;
  }

  function randomRange(min, max) {
    return min + Math.random() * (max - min);
  }

  function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  window.addEventListener("DOMContentLoaded", () => {
    new FreshnessRushGame();
  });
})();
