const frame = window.frameElement;
const room = frame?.closest("[data-room-scroll]");
const roomWindow = room?.ownerDocument.defaultView;

if (room && roomWindow) {
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const stage = document.querySelector(".scan-stage");
  const map = document.querySelector("[data-map-reveal]");
  const beats = Array.from(document.querySelectorAll("[data-explorer-reveal]"), node =>
    node.matches(".figure-heading")
      ? { node, entryStart: .79, entryEnd: .55, minimumOpacity: .10 }
      : { node, entryStart: .98, entryEnd: .69, minimumOpacity: .22 });
  let frameRequest = 0;
  let dirty = true;
  let viewportHeight = 0;
  let stageTop = 0;
  let stageHeight = 0;
  let mapTop = 0;
  let lastDeparture;
  let lastMapReveal;

  function layoutTop(node, boundary) {
    let top = 0;
    for (let ancestor = node; ancestor && ancestor !== boundary; ancestor = ancestor.offsetParent) {
      top += ancestor.offsetTop;
    }
    return top;
  }

  function smooth(value) {
    const range = Math.min(1, Math.max(0, value));
    return range * range * (3 - 2 * range);
  }

  function render() {
    frameRequest = 0;
    if (motion.matches || document.hidden || !room.clientHeight) return;

    if (dirty) {
      viewportHeight = room.clientHeight;
      const frameTop = layoutTop(frame, room);
      stageTop = frameTop + layoutTop(stage, null);
      stageHeight = stage.offsetHeight;
      mapTop = frameTop + layoutTop(map, null);
      for (const beat of beats) {
        beat.top = frameTop + layoutTop(beat.node, null);
        beat.height = beat.node.offsetHeight;
      }
      dirty = false;
    }

    const scroll = room.scrollTop;
    const departure = smooth((scroll - stageTop + viewportHeight * .095) /
      Math.max(1, Math.min(viewportHeight, stageHeight) * .59)).toFixed(3);
    const mapReveal = smooth((viewportHeight * .78 - (mapTop - scroll)) /
      (viewportHeight * .29)).toFixed(3);
    if (lastDeparture !== departure) {
      stage.style.setProperty("--scan-departure", departure);
      lastDeparture = departure;
    }
    if (lastMapReveal !== mapReveal) {
      map.style.setProperty("--explorer-map-reveal", mapReveal);
      lastMapReveal = mapReveal;
    }

    for (const beat of beats) {
      if (!beat.height) continue;
      const top = beat.top - scroll;
      const entry = smooth((viewportHeight * beat.entryStart - top) /
        (viewportHeight * (beat.entryStart - beat.entryEnd)));
      const exit = smooth((top + beat.height) / (viewportHeight * .22));
      const opacity = ((beat.minimumOpacity + (1 - beat.minimumOpacity) * entry) *
        (.56 + .44 * exit)).toFixed(3);
      const rise = `${((1 - entry) * 22).toFixed(1)}px`;
      if (beat.opacity !== opacity) {
        beat.opacity = opacity;
        beat.node.style.setProperty("--explorer-opacity", opacity);
      }
      if (beat.rise !== rise) {
        beat.rise = rise;
        beat.node.style.setProperty("--explorer-rise", rise);
      }
    }
  }

  function schedule() {
    if (!frameRequest && !motion.matches && !document.hidden) frameRequest = roomWindow.requestAnimationFrame(render);
  }

  function refresh() {
    dirty = true;
    schedule();
  }

  const observer = new ResizeObserver(refresh);
  observer.observe(document.querySelector("main"));
  observer.observe(room);
  observer.observe(stage);
  observer.observe(document.querySelector(".map-layout"));
  for (const { node } of beats) observer.observe(node);
  room.addEventListener("scroll", schedule, { passive: true });
  room.addEventListener("spatial:entered", refresh);
  motion.addEventListener("change", refresh);
  document.addEventListener("visibilitychange", refresh);
  window.addEventListener("pagehide", () => {
    roomWindow.cancelAnimationFrame(frameRequest);
    frameRequest = 0;
  });
  window.addEventListener("pageshow", refresh);
  refresh();
}
