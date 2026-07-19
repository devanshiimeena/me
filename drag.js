// Infinite pannable image canvas — drag anywhere to pan; images tile seamlessly forever
(function () {
  const canvas = document.getElementById("infiniteCanvas");
  const world = document.getElementById("canvasWorld");
  if (!canvas || !world) return;

  // One repeating "tile" of images. It's rendered in a grid of copies so
  // panning in any direction always reveals more of the same pattern,
  // creating the illusion of an infinite canvas.
  const TILE_W = 900;
  const TILE_H = 700;

  const PATTERN = [
    { seed: "devanshi01", x: 20, y: 20, w: 260, h: 320 },
    { seed: "devanshi02", x: 300, y: 30, w: 280, h: 200 },
    { seed: "devanshi03", x: 600, y: 20, w: 260, h: 260 },
    { seed: "devanshi04", x: 40, y: 360, w: 260, h: 300 },
    { seed: "devanshi05", x: 320, y: 250, w: 260, h: 320 },
    { seed: "devanshi06", x: 600, y: 300, w: 260, h: 360 },
  ];

  function buildGrid() {
    world.innerHTML = "";
    const rect = canvas.getBoundingClientRect();
    const cols = Math.ceil(rect.width / TILE_W) + 2;
    const rows = Math.ceil(rect.height / TILE_H) + 2;

    for (let cx = -1; cx < cols; cx++) {
      for (let cy = -1; cy < rows; cy++) {
        PATTERN.forEach((item) => {
          const tile = document.createElement("div");
          tile.className = "canvas-tile";
          tile.style.left = cx * TILE_W + item.x + "px";
          tile.style.top = cy * TILE_H + item.y + "px";
          tile.style.width = item.w + "px";
          tile.style.height = item.h + "px";

          const img = document.createElement("img");
          img.src =
            "https://picsum.photos/seed/" +
            item.seed +
            "/" +
            item.w * 2 +
            "/" +
            item.h * 2;
          img.alt = "Work placeholder";
          img.draggable = false;

          tile.appendChild(img);
          world.appendChild(tile);
        });
      }
    }
  }

  buildGrid();

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildGrid, 150);
  });

  // --- Panning with inertia ---
  let offsetX = 0;
  let offsetY = 0;

  function wrap(value, size) {
    return ((value % size) + size) % size;
  }

  function applyTransform() {
    world.style.transform = "translate3d(" + offsetX + "px, " + offsetY + "px, 0)";
  }

  let dragging = false;
  let dragStartPointerX = 0;
  let dragStartPointerY = 0;
  let dragStartOffsetX = 0;
  let dragStartOffsetY = 0;
  let lastX = 0;
  let lastY = 0;
  let lastTime = 0;
  let velX = 0;
  let velY = 0;

  const FRICTION = 0.94;
  const STOP_THRESHOLD = 0.03;

  function momentumTick() {
    offsetX = wrap(offsetX + velX, TILE_W);
    offsetY = wrap(offsetY + velY, TILE_H);
    velX *= FRICTION;
    velY *= FRICTION;
    applyTransform();

    if (Math.abs(velX) > STOP_THRESHOLD || Math.abs(velY) > STOP_THRESHOLD) {
      requestAnimationFrame(momentumTick);
    }
  }

  canvas.addEventListener("pointerdown", (e) => {
    dragging = true;
    velX = 0;
    velY = 0;

    canvas.classList.add("dragging");
    document.body.classList.add("is-dragging");
    canvas.setPointerCapture(e.pointerId);

    dragStartPointerX = e.clientX;
    dragStartPointerY = e.clientY;
    dragStartOffsetX = offsetX;
    dragStartOffsetY = offsetY;
    lastX = e.clientX;
    lastY = e.clientY;
    lastTime = performance.now();
  });

  canvas.addEventListener("pointermove", (e) => {
    if (!dragging) return;

    const dx = e.clientX - dragStartPointerX;
    const dy = e.clientY - dragStartPointerY;

    offsetX = wrap(dragStartOffsetX + dx, TILE_W);
    offsetY = wrap(dragStartOffsetY + dy, TILE_H);
    applyTransform();

    const now = performance.now();
    const dt = Math.max(now - lastTime, 1);
    velX = ((e.clientX - lastX) / dt) * 16;
    velY = ((e.clientY - lastY) / dt) * 16;

    lastX = e.clientX;
    lastY = e.clientY;
    lastTime = now;
  });

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    canvas.classList.remove("dragging");
    document.body.classList.remove("is-dragging");

    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch (err) {
      /* no-op */
    }

    if (Math.abs(velX) > STOP_THRESHOLD || Math.abs(velY) > STOP_THRESHOLD) {
      requestAnimationFrame(momentumTick);
    }
  }

  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);
})();
