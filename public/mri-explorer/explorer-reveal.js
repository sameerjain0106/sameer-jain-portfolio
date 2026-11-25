const frame = window.frameElement;
const room = frame?.closest("[data-room-scroll]");

if (room) {
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const beats = Array.from(document.querySelectorAll("[data-explorer-reveal]"), node => ({ node }));
  let frameRequest = 0;
  let dirty = true;
  let viewportHeight = 0;

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
      for (const beat of beats) {
        beat.top = frameTop + layoutTop(beat.node, null);
        beat.height = beat.node.offsetHeight;
      }
      dirty = false;
    }

    const scroll = room.scrollTop;
    for (const beat of beats) {
      if (!beat.height) continue;
      const top = beat.top - scroll;
      const entry = smooth((viewportHeight * .98 - top) / (viewportHeight * .29));
      const exit = smooth((top + beat.height) / (viewportHeight * .22));
      const opacity = ((.22 + .78 * entry) * (.56 + .44 * exit)).toFixed(3);
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
    if (!frameRequest && !motion.matches && !document.hidden) frameRequest = requestAnimationFrame(render);
  }

  function refresh() {
    dirty = true;
    schedule();
  }

  const observer = new ResizeObserver(refresh);
  observer.observe(document.querySelector("main"));
  observer.observe(room);
  for (const { node } of beats) observer.observe(node);
  room.addEventListener("scroll", schedule, { passive: true });
  room.addEventListener("spatial:entered", refresh);
  motion.addEventListener("change", refresh);
  document.addEventListener("visibilitychange", refresh);
  window.addEventListener("pagehide", () => {
    cancelAnimationFrame(frameRequest);
    frameRequest = 0;
  });
  window.addEventListener("pageshow", refresh);
  refresh();
}
