(function () {
  "use strict";

  class HandTrackingController {
    constructor(videoElement) {
      this.video = videoElement;
      this.stream = null;
      this.hands = null;
      this.running = false;
      this.lastSeenAt = 0;
      this.onMove = null;
      this.onStatus = null;
    }

    async start(onMove, onStatus) {
      this.onMove = onMove;
      this.onStatus = onStatus;

      if (!window.isSecureContext) {
        return {
          ok: false,
          reason: "Camera mode needs HTTPS or localhost. Mouse mode is ready instead.",
        };
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return {
          ok: false,
          reason: "Camera access is not supported on this browser.",
        };
      }

      try {
        await this.loadDependencies();

        this.stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 360 },
          },
        });

        this.video.srcObject = this.stream;
        await this.video.play();
        this.video.classList.add("is-live");

        this.hands = new window.Hands({
          locateFile(file) {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
          },
        });

        this.hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 0,
          minDetectionConfidence: 0.55,
          minTrackingConfidence: 0.5,
        });

        this.hands.onResults((results) => {
          const hand = results.multiHandLandmarks && results.multiHandLandmarks[0];

          if (!hand) {
            if (performance.now() - this.lastSeenAt > 900 && this.onStatus) {
              this.onStatus("Hand not found");
            }
            return;
          }

          this.lastSeenAt = performance.now();

          const palm = hand[9] || hand[0];
          if (this.onMove) {
            this.onMove(1 - palm.x);
          }

          if (this.onStatus) {
            this.onStatus("Camera Live");
          }
        });

        this.running = true;
        this.tick();

        return { ok: true };
      } catch (error) {
        this.stop();
        return {
          ok: false,
          reason: "Camera permission was denied or hand tracking could not start.",
        };
      }
    }

    stop() {
      this.running = false;

      if (this.video) {
        this.video.pause();
        this.video.srcObject = null;
        this.video.classList.remove("is-live");
      }

      if (this.stream) {
        this.stream.getTracks().forEach((track) => track.stop());
      }

      this.stream = null;
      this.hands = null;
    }

    async tick() {
      if (!this.running || !this.hands || !this.video || this.video.readyState < 2) {
        if (this.running) {
          requestAnimationFrame(() => this.tick());
        }
        return;
      }

      await this.hands.send({ image: this.video });

      if (this.running) {
        requestAnimationFrame(() => this.tick());
      }
    }

    async loadDependencies() {
      if (window.Hands) {
        return;
      }

      // MediaPipe is loaded on demand so mouse mode stays lightweight.
      await this.loadScript(
        "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js",
      );
      await this.loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js");
    }

    loadScript(src) {
      return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[data-src="${src}"]`);
        if (existing) {
          if (existing.dataset.loaded === "true") {
            resolve();
            return;
          }

          existing.addEventListener("load", () => resolve(), { once: true });
          existing.addEventListener("error", () => reject(new Error(src)), { once: true });
          return;
        }

        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.dataset.src = src;
        script.addEventListener(
          "load",
          () => {
            script.dataset.loaded = "true";
            resolve();
          },
          { once: true },
        );
        script.addEventListener("error", () => reject(new Error(src)), { once: true });
        document.head.appendChild(script);
      });
    }
  }

  window.HandTrackingController = HandTrackingController;
})();
