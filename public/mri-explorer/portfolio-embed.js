(() => {
  const portfolioOrigin = location.origin;
  const root = document.documentElement;

  const framed = window.parent !== window;
  if (framed) root.dataset.portfolioFramed = "";

  document.addEventListener("DOMContentLoaded", () => {
    if (!framed) return;

    const main = document.querySelector("main");
    const stage = document.querySelector(".scan-stage");
    const world = window.frameElement?.closest("[data-world-room]");
    const pointerMotion = matchMedia("(any-hover: hover) and (any-pointer: fine) and (prefers-reduced-motion: no-preference)");
    let reportedHeight = 0;
    let pointerType;
    let aimFrame = 0;
    let aimX;
    let aimY;

    function send(message) {
      window.parent.postMessage(message, portfolioOrigin);
    }

    function resetStageMotion() {
      stage.style.removeProperty("--scan-aim-x");
      stage.style.removeProperty("--scan-aim-y");
      send({ type: "mri-explorer:stage-leave" });
    }

    function moveStage(x, y) {
      if (!pointerMotion.matches) return;
      const { left, top, right, bottom, width, height } = stage.getBoundingClientRect();
      if (x < left || x > right || y < top || y > bottom || !width || !height) {
        if (stage.style.getPropertyValue("--scan-aim-x")) resetStageMotion();
        return;
      }
      const range = Math.min(1, width / 1120, window.parent.innerHeight / 690) * (world?.dataset.idlePaused === "true" ? .38 : 1);
      const stageX = ((x - left) / width * 2 - 1) * range;
      const stageY = ((y - top) / height * 2 - 1) * range;
      stage.style.setProperty("--scan-aim-x", `${stageX * 21}px`);
      stage.style.setProperty("--scan-aim-y", `${stageY * 15}px`);
      return { stageX, stageY };
    }

    function sendHeight(force = false) {
      const height = Math.ceil(main.getBoundingClientRect().height);
      if (height > 0 && (height !== reportedHeight || force)) {
        reportedHeight = height;
        send({ type: "mri-explorer:size", height });
      }
    }

    new ResizeObserver(() => sendHeight()).observe(main);
    window.addEventListener("message", (event) => {
      if (event.origin === portfolioOrigin && event.source === window.parent &&
          event.data?.type === "mri-explorer:measure") {
        sendHeight(true);
      }
    });

    document.addEventListener("pointermove", (event) => {
      pointerType = event.pointerType;
      if (pointerType === "touch") return;
      aimX = event.clientX;
      aimY = event.clientY;
      if (aimFrame) return;
      aimFrame = requestAnimationFrame(() => {
        aimFrame = 0;
        send({ type: "mri-explorer:aim", x: aimX, y: aimY, ...moveStage(aimX, aimY) });
      });
    }, { passive: true });

    stage.addEventListener("pointerleave", resetStageMotion);
    pointerMotion.addEventListener("change", resetStageMotion);

    document.addEventListener("pointerdown", (event) => {
      pointerType = event.pointerType;
    }, { passive: true });

    document.addEventListener("keydown", (event) => {
      if (event.defaultPrevented || event.isComposing || event.key.toLowerCase() !== "m" ||
          !event.shiftKey || event.repeat || event.metaKey || event.ctrlKey || event.altKey ||
          event.target.closest?.("input, textarea, select") || event.target.isContentEditable) return;
      event.preventDefault();
      send({ type: "mri-explorer:map" });
    });

    document.addEventListener("click", (event) => {
      if (event.button === 0 && event.detail > 0 && (event.pointerType || pointerType) !== "touch") {
        if (aimFrame) {
          cancelAnimationFrame(aimFrame);
          aimFrame = 0;
        }
        send({ type: "mri-explorer:aim", x: event.clientX, y: event.clientY, blink: true });
      }

      const link = event.target.closest?.(".skip-link, #locate-scan, #open-model-input");
      if (!link || event.defaultPrevented || event.button !== 0 ||
          event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const destination = document.getElementById(link.hash.slice(1));
      if (!destination || destination.hidden) return;
      event.preventDefault();

      if (link.id === "open-model-input") {
        destination.querySelector("summary").focus({ preventScroll: true });
      } else if (link.classList.contains("skip-link")) {
        document.getElementById("pick-image").focus({ preventScroll: true });
      }

      const top = destination.getBoundingClientRect().top + window.scrollY;
      send({ type: "mri-explorer:scroll", top });
    });

    sendHeight();
  });
})();
