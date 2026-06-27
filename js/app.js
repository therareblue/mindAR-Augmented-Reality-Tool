document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("start-btn");
  const startScreen = document.getElementById("start-screen");
  const startError = document.getElementById("start-error");

  const mainScene = document.getElementById("main-scene");
  const arUI = document.getElementById("ar-ui");
  // const statusChip = document.getElementById("status-chip");
  const soundBtn = document.getElementById("sound-btn");
  const soundIcon = document.getElementById("sound-icon");
  let isSoundOn = false;
  const resetBtn = document.getElementById("reset-btn");
  const capsBtn = document.getElementById("caps-btn");
  const capsIcon = document.getElementById("caps-icon");
  const captionBox = document.getElementById("caption-box");
  const captionText = document.getElementById("caption-text");

  // ── Captions data ──────────────────────────────────────────────
  const captions = {
    bg: [
      { time: 3, text: "Местността е Карабалкан, Западни Родопи." },
      { time: 8, text: "" },
      { time: 10, text: "През 1931 година в тогавашен Горен Чифлик," },
      { time: 15, text: "Салих Аговски има идея:" },
      { time: 20, text: "да отглежда пъстърва високо в планината." },
      { time: 25, text: "" },
      { time: 29, text: "С помощта на семейството си" },
      { time: 33, text: "и с подкрепа от държавата и кметството на гр. Чепеларе," },
      { time: 39, text: "първите рибарници в Родопите стават реалност." },
      { time: 44, text: "" },
      { time: 45, text: "Първият хайвер пристига от Чехия" },
      { time: 50, text: "и водата оживява —" },
      { time: 54, text: "най-високо качество високопланинска пастърва" },
      { time: 60, text: "" },
      { time: 64, text: "Рибарниците са стопанисвани близо 20 години —" },
      { time: 69, text: "до 1949 година." },
      { time: 73, text: "" },
    ],
    en: [
      { time: 3, text: "This is the area of Karabalkan, Western Rhodopes." },
      { time: 8, text: "" },
      { time: 10, text: "In 1931, in Goren Chiflik," },
      { time: 15, text: "Salih Agovski has an idea:" },
      { time: 20, text: "to raise trout high up in the mountains." },
      { time: 25, text: "" },
      { time: 29, text: "With the help of his family" },
      { time: 33, text: "and the support of the municipality of Chepelare," },
      { time: 39, text: "the first fish farms in the Rhodopes become reality." },
      { time: 44, text: "" },
      { time: 45, text: "The first roe arrives from Czechia" },
      { time: 50, text: "and the water comes alive —" },
      { time: 54, text: "highland trout of the finest quality" },
      { time: 60, text: "" },
      { time: 64, text: "The fish farms were operated for nearly 20 years —" },
      { time: 69, text: "until 1949." },
      { time: 73, text: "" },
    ],
  };

  // ── Caption state ──────────────────────────────────────────────
  const capsStates = ["bg", "en", "off"];
  let capsStateIndex = 0; // default: bg
  let capsLang = "bg";
  let captionInterval = null;
  let lastCaptionIndex = -1;

  function updateCapsButton() {
    const state = capsStates[capsStateIndex];
    const iconMap = { bg: "caps_bg.png", en: "caps_en.png", off: "caps_off.png" };
    const labelMap = { bg: "Субтитри: БГ", en: "Субтитри: EN", off: "Субтитри: изкл." };
    capsIcon.src = `assets/ui/icons/${iconMap[state]}`;
    capsBtn.setAttribute("aria-label", labelMap[state]);
    capsLang = state;
  }

  capsBtn.addEventListener("click", () => {
    capsStateIndex = (capsStateIndex + 1) % capsStates.length;
    updateCapsButton();
    lastCaptionIndex = -1; // force refresh on next tick
    if (capsLang === "off") {
      captionBox.classList.add("hidden");
      captionText.textContent = "";
    }
  });

  // ── Caption timer ──────────────────────────────────────────────
  function getCurrentCaptionIndex(currentTime) {
    if (capsLang === "off") return -1;
    const list = captions[capsLang];
    let idx = -1;
    for (let i = 0; i < list.length; i++) {
      if (currentTime >= list[i].time) idx = i;
      else break;
    }
    return idx;
  }

  function startCaptionTimer() {
    stopCaptionTimer();
    lastCaptionIndex = -1;
    captionInterval = setInterval(() => {
      if (capsLang === "off" || !overlayVideo) return;
      const idx = getCurrentCaptionIndex(overlayVideo.currentTime);
      if (idx === lastCaptionIndex) return;
      lastCaptionIndex = idx;
      if (idx === -1) {
        captionBox.classList.add("hidden");
        captionText.textContent = "";
      } else {
        captionText.textContent = captions[capsLang][idx].text;
        captionBox.classList.remove("hidden");
      }
    }, 250);
  }

  function stopCaptionTimer() {
    if (captionInterval) {
      clearInterval(captionInterval);
      captionInterval = null;
    }
    captionBox.classList.add("hidden");
    captionText.textContent = "";
    lastCaptionIndex = -1;
  }


  // const bgMusic = document.getElementById("bg-music");
  const scanningOverlay = document.getElementById("scanning-overlay");

  const overlayVideo = document.getElementById("overlay-video");

  if (overlayVideo) {
    overlayVideo.loop = true;
    overlayVideo.playsInline = true;
    overlayVideo.muted = true;

    overlayVideo.addEventListener("ended", () => {
      overlayVideo.currentTime = 0;
      overlayVideo.play().catch((error) => {
        console.warn("Overlay video replay failed:", error);
      });
    });
  }

  const zones = {
    zone1: {
      markerFile: "./assets/targets/target.mind",
      videos: [
        { src: "./assets/overlays/overlay.mp4", width: 1, height: 0.75},
      ]
    },
  };

  const targets = Array.from({ length: 1 }, (_, index) => ({
    marker: document.getElementById(`marker-slot-${index}`),
    plane: document.getElementById(`video-slot-${index}`),
    slotIndex: index,
    src: zones.zone1.videos[index]?.src || null,
    width: zones.zone1.videos[index]?.width || 1,
    height: zones.zone1.videos[index]?.height || 1,
  }));

  let arStarted = false;
  let arReadyFired = false;
  let permissionTimeout = null;
  let isErrorHandled = false;
  let videoStartTimeout = null;
  let isStartingPermissionFlow = false;
  let ignoreVisibilityUntil = 0;
  let activeTarget = null;

  function showScanning() {
    scanningOverlay.classList.remove("hidden");
    scanningOverlay.setAttribute("aria-hidden", "false");
  }

  function hideScanning() {
    scanningOverlay.classList.add("hidden");
    scanningOverlay.setAttribute("aria-hidden", "true");
    // statusChip.textContent = "";
  }

  function clearPendingVideoStart() {
    if (videoStartTimeout) {
      clearTimeout(videoStartTimeout);
      videoStartTimeout = null;
    }
  }

  function stopAllVideos() {
    if (overlayVideo) {
      overlayVideo.pause();
      overlayVideo.currentTime = 0;
    }

    targets.forEach(({ plane }) => {
      if (!plane) return;
      plane.setAttribute("visible", "false");
    });

    activeTarget = null;
    // captions се управляват само от targetFound/targetLost
    // не ги крием тук
  }

  function waitForVideoReady(video) {
    return new Promise((resolve) => {
      if (video.readyState >= 2) {
        resolve();
        return;
      }

      video.addEventListener("loadeddata", resolve, { once: true });
    });
  }

  async function playTargetVideo(targetItem) {
    if (!targetItem?.plane || !overlayVideo || !targetItem.src) return;

    stopAllVideos();
    activeTarget = targetItem;

    targetItem.plane.setAttribute("visible", "false");
    targetItem.plane.setAttribute("width", targetItem.width);
    targetItem.plane.setAttribute("height", targetItem.height);

    const nextSrc = new URL(targetItem.src, window.location.href).href;

    if (overlayVideo.src !== nextSrc) {
      overlayVideo.pause();

      overlayVideo.removeAttribute("src");
      overlayVideo.load();

      overlayVideo.src = targetItem.src;
      overlayVideo.load();

      await waitForVideoReady(overlayVideo);
    } else {
      await waitForVideoReady(overlayVideo);
    }

    overlayVideo.pause();
    overlayVideo.currentTime = 0;

    targetItem.plane.setAttribute("src", "#overlay-video");
    targetItem.plane.setAttribute("visible", "true");

    try {
      overlayVideo.muted = !isSoundOn;
      await overlayVideo.play();
    } catch (error) {
      console.warn("Overlay video play failed:", error);
    }
  }

  function scheduleTargetVideoStart(targetItem, delay = 1000) {
    clearPendingVideoStart();
    videoStartTimeout = window.setTimeout(async () => {
      videoStartTimeout = null;
      await playTargetVideo(targetItem);
    }, delay);
  }

  function fadeOutStartScreen() {
    startScreen.classList.add("is-hidden");
    startError.hidden = true;
    startError.textContent = "";
  }

  function showStartScreen(message = "") {
    clearPendingVideoStart();
    stopAllVideos();
    stopCaptionTimer();

    scanningOverlay.classList.add("hidden");
    scanningOverlay.setAttribute("aria-hidden", "true");

    startScreen.classList.remove("is-hidden");
    arUI.classList.remove("is-visible");
    arUI.setAttribute("aria-hidden", "true");

    mainScene.classList.remove("is-active");
    mainScene.style.pointerEvents = "none";

    if (message) {
      startError.hidden = false;
      startError.textContent = message;
    } else {
      startError.hidden = true;
      startError.textContent = "";
    }

  }

  function showArUI(message = "Подготвям камерата…") {
    mainScene.classList.add("is-active");
    mainScene.style.pointerEvents = "auto";
    arUI.classList.add("is-visible");
    arUI.setAttribute("aria-hidden", "false");
  }

  async function stopMindAR() {
    const mindarSystem = mainScene.systems["mindar-image-system"];

    if (permissionTimeout) {
      clearTimeout(permissionTimeout);
      permissionTimeout = null;
    }

    if (mindarSystem && arStarted) {
      try {
        await mindarSystem.stop();
      } catch (error) {
        console.warn("MindAR stop warning:", error);
      }
    }

    arStarted = false;
    arReadyFired = false;
    isErrorHandled = false;
    isStartingPermissionFlow = false;

    clearPendingVideoStart();
    stopAllVideos();
  }

  async function restartExperience() {
    clearPendingVideoStart();

    try {
      await stopMindAR();
    } catch (error) {
      console.warn("Restart stop warning:", error);
    }

    if (overlayVideo) {
      try {
        overlayVideo.pause();
        overlayVideo.removeAttribute("src");
        overlayVideo.load();
      } catch (error) {
        console.warn("Video cleanup warning:", error);
      }
    }

    const cleanUrl = window.location.origin + window.location.pathname;
    window.location.replace(`${cleanUrl}?restart=${Date.now()}`);
  }

  async function onCameraDenied(err) {
    if (isErrorHandled) return;
    isErrorHandled = true;

    console.warn("AR camera permission denied or timeout:", err);
    await stopMindAR();

    showStartScreen(
      "Камерата не беше разрешена или не можа да се стартира. Моля, опитай отново."
    );
  }

  function startMindAR() {
    if (arStarted) return;

    try {
      const mindarSystem = mainScene.systems["mindar-image-system"];
      if (!mindarSystem) {
        console.error("AR mindAR system not found");
        onCameraDenied("system not found");
        return;
      }

      arStarted = true;
      showArUI("Подготвям камерата…");
      isStartingPermissionFlow = true;
      ignoreVisibilityUntil = Date.now() + 4000;

      mindarSystem.start();

      permissionTimeout = setTimeout(() => {
        if (!arReadyFired) onCameraDenied("permission timeout");
      }, 15000);
    } catch (err) {
      onCameraDenied(err);
    }
  }

  function shouldIgnoreVisibilityPause() {
    if (isStartingPermissionFlow) return true;
    if (Date.now() < ignoreVisibilityUntil) return true;
    if (!arStarted && !arReadyFired) return true;
    return false;
  }

  async function pauseExperienceForBackground() {
    clearPendingVideoStart();
    stopAllVideos();

    // if (bgMusic && !bgMusic.paused) {
    //   bgMusic.pause();
    // }

    const mindarSystem = mainScene.systems["mindar-image-system"];
    if (mindarSystem && arStarted) {
      try {
        await mindarSystem.stop();
      } catch (error) {
        console.warn("MindAR background stop warning:", error);
      }
    }

    arStarted = false;
    arReadyFired = false;
    isStartingPermissionFlow = false;
    showStartScreen("Скенерът е на пауза. Натисни Старт за да продължиш.");
  }

  async function handleAppHidden() {
    if (shouldIgnoreVisibilityPause()) return;
    await pauseExperienceForBackground();
  }

  startBtn.addEventListener("click", async () => {
    if (overlayVideo) {
      overlayVideo.pause();
      overlayVideo.removeAttribute("src");
      overlayVideo.load();
    }

    fadeOutStartScreen();
    startMindAR();
  });

  soundBtn.addEventListener("click", () => {
    isSoundOn = !isSoundOn;

    if (overlayVideo) {
      overlayVideo.muted = !isSoundOn;
    }

    soundIcon.src = isSoundOn
      ? "assets/ui/icons/unmuted.svg"
      : "assets/ui/icons/muted.svg";

    soundBtn.setAttribute(
      "aria-label",
      isSoundOn ? "Изключи звук" : "Включи звук"
    );
  });
  if (resetBtn) {
    resetBtn.addEventListener("click", async () => {
      resetBtn.disabled = true;
      await restartExperience();
    });
  }

  mainScene.addEventListener("arReady", () => {
    arReadyFired = true;
    isStartingPermissionFlow = false;

    if (permissionTimeout) {
      clearTimeout(permissionTimeout);
      permissionTimeout = null;
    }

    showArUI("Насочи камерата към картината.");
    showScanning();
  });

  mainScene.addEventListener("arError", (event) => {
    isStartingPermissionFlow = false;

    if (permissionTimeout) {
      clearTimeout(permissionTimeout);
      permissionTimeout = null;
    }

    onCameraDenied(event);
  });

  targets.forEach((targetItem) => {
    if (!targetItem.marker) return;

    targetItem.marker.addEventListener("targetFound", () => {
      hideScanning();
      scheduleTargetVideoStart(targetItem, 500);
      startCaptionTimer();
    });

    targetItem.marker.addEventListener("targetLost", () => {
      clearPendingVideoStart();
      if (activeTarget === targetItem) {
        stopAllVideos();
      }
      stopCaptionTimer();
      showScanning();
    });

  });

  document.addEventListener("visibilitychange", async () => {
    if (document.hidden) await handleAppHidden();
  });

  window.addEventListener("blur", async () => {
    await handleAppHidden();
  });

  window.addEventListener("pagehide", async () => {
    await handleAppHidden();
  });

  showStartScreen();
});
