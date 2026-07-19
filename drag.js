// Infinite procedural image canvas (Cosmos.so-style explore page).
//
// The world is divided into fixed-size "chunks." Each chunk's contents
// (how many images, what sizes, what positions) are generated the first
// time it scrolls into view, using a seeded random generator keyed off
// the chunk's coordinates — so panning back to a spot always shows the
// same arrangement, but every new area looks freshly, organically laid out.
// Chunks far outside the view are removed to keep the DOM light.
(function () {
  const canvas = document.getElementById("infiniteCanvas");
  const world = document.getElementById("canvasWorld");
  if (!canvas || !world) return;

  const CHUNK_SIZE = 900;
  const RENDER_BUFFER = CHUNK_SIZE * 1; // pre-render this far beyond the viewport
  const CLEANUP_BUFFER = CHUNK_SIZE * 2; // remove chunks once this far outside
  const SEED_POOL_SIZE = 40; // how many distinct placeholder photos to cycle through

  // ---------- seeded randomness ----------
  function mulberry32(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hashChunk(cx, cy) {
    let h = cx * 374761393 + cy * 668265263;
    h = (h ^ (h >>> 13)) * 1274126177;
    h = h ^ (h >>> 16);
    return h >>> 0;
  }

  function pickAspect(rand) {
    const r = rand();
    if (r < 0.34) return "portrait";
    if (r < 0.67) return "landscape";
    return "square";
  }

  function sizeFromAspect(base, aspect) {
    if (aspect === "portrait") return { w: base, h: base * 1.3 };
    if (aspect === "landscape") return { w: base * 1.3, h: base };
    return { w: base, h: base };
  }

  function overlapRatio(a, b) {
    const ow = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
    const oh = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
    const overlapArea = ow * oh;
    const minArea = Math.min(a.w * a.h, b.w * b.h);
    return minArea > 0 ? overlapArea / minArea : 0;
  }

  // ---------- procedural chunk content ----------
  function generateChunkItems(cx, cy) {
    const rand = mulberry32(hashChunk(cx, cy));
    const items = [];
    const isFocalChunk = rand() < 0.22;

    if (isFocalChunk) {
      const base = 650 + rand() * 300;
      const aspect = pickAspect(rand());
      const { w, h } = sizeFromAspect(base, aspect);
      const marginX = CHUNK_SIZE * 0.08;
      const marginY = CHUNK_SIZE * 0.08;
      const x = marginX + rand() * Math.max(1, CHUNK_SIZE - w - marginX * 2);
      const y = marginY + rand() * Math.max(1, CHUNK_SIZE - h - marginY * 2);
      items.push({ rand, x, y, w, h });

      if (rand() < 0.5) {
        const base2 = 160 + rand() * 100;
        const aspect2 = pickAspect(rand());
        const size2 = sizeFromAspect(base2, aspect2);
        for (let attempt = 0; attempt < 6; attempt++) {
          const x2 = rand() * Math.max(1, CHUNK_SIZE - size2.w);
          const y2 = rand() * Math.max(1, CHUNK_SIZE - size2.h);
          const rect2 = { x: x2, y: y2, w: size2.w, h: size2.h };
          if (overlapRatio({ x, y, w, h }, rect2) < 0.15) {
            items.push({ rand, x: x2, y: y2, w: size2.w, h: size2.h });
            break;
          }
        }
      }
    } else {
      const count = 3 + Math.floor(rand() * 3);
      const placedRects = [];
      for (let i = 0; i < count; i++) {
        const sizeRoll = rand();
        let base;
        if (sizeRoll < 0.35) base = 160 + rand() * 100;
        else if (sizeRoll < 0.8) base = 280 + rand() * 140;
        else base = 440 + rand() * 180;

        const aspect = pickAspect(rand());
        const { w, h } = sizeFromAspect(base, aspect);

        let bestRect = null;
        for (let attempt = 0; attempt < 6; attempt++) {
          const x = rand() * Math.max(1, CHUNK_SIZE - w);
          const y = rand() * Math.max(1, CHUNK_SIZE - h);
          const rect = { x, y, w, h };
          const badOverlap = placedRects.some((r) => overlapRatio(r, rect) > 0.3);
          bestRect = rect;
          if (!badOverlap) break;
        }
        placedRects.push(bestRect);
        items.push({ rand, x: bestRect.x, y: bestRect.y, w: bestRect.w, h: bestRect.h });
      }
    }

    return items.map((item) => {
      const seedIndex = Math.floor(item.rand() * SEED_POOL_SIZE);
      return {
        seedIndex,
        worldX: cx * CHUNK_SIZE + item.x,
        worldY: cy * CHUNK_SIZE + item.y,
        w: item.w,
        h: item.h,
      };
    });
  }

  // Generates a simple placeholder image entirely locally (no network request),
  // so tiles always render even offline or if an external image host is blocked.
  // Swap this out later for real photos — see createTileElement() below.
  function placeholderDataUri(w, h, seedIndex) {
    const isDark = seedIndex % 2 === 0;
    const bg = isDark ? "%230a0a0a" : "%23ffffff";
    const line = isDark ? "%23ffffff" : "%230a0a0a";
    const svg =
      "<svg xmlns='http://www.w3.org/2000/svg' width='" +
      w +
      "' height='" +
      h +
      "'>" +
      "<rect width='100%25' height='100%25' fill='" +
      bg +
      "'/>" +
      "<line x1='0' y1='0' x2='" +
      w +
      "' y2='" +
      h +
      "' stroke='" +
      line +
      "' stroke-width='2' stroke-opacity='0.25'/>" +
      "<line x1='" +
      w +
      "' y1='0' x2='0' y2='" +
      h +
      "' stroke='" +
      line +
      "' stroke-width='2' stroke-opacity='0.25'/>" +
      "</svg>";
    return "data:image/svg+xml," + svg;
  }

  function createTileElement(item) {
    const tile = document.createElement("div");
    tile.className = "canvas-tile";
    tile.style.left = item.worldX + "px";
    tile.style.top = item.worldY + "px";
    tile.style.width = item.w + "px";
    tile.style.height = item.h + "px";

    const img = document.createElement("img");
    img.loading = "lazy";
    img.decoding = "async";
    img.draggable = false;
    img.alt = "";

    // PLACEHOLDER — replace this line with your own image source once you
    // have real work to show, e.g.:
    //   img.src = "images/project-" + item.seedIndex + ".jpg";
    img.src = placeholderDataUri(Math.round(item.w), Math.round(item.h), item.seedIndex);

    tile.appendChild(img);
    return tile;
  }

  // ---------- chunk virtualization ----------
  const activeChunks = new Map(); // "cx,cy" -> [elements]

  function renderChunk(cx, cy, key) {
    const items = generateChunkItems(cx, cy);
    const els = items.map(createTileElement);
    els.forEach((el) => world.appendChild(el));
    activeChunks.set(key, els);
  }

  function updateChunks() {
    const rect = canvas.getBoundingClientRect();

    const worldMinX = -offsetX - RENDER_BUFFER;
    const worldMaxX = -offsetX + rect.width + RENDER_BUFFER;
    const worldMinY = -offsetY - RENDER_BUFFER;
    const worldMaxY = -offsetY + rect.height + RENDER_BUFFER;

    const cMinX = Math.floor(worldMinX / CHUNK_SIZE);
    const cMaxX = Math.floor(worldMaxX / CHUNK_SIZE);
    const cMinY = Math.floor(worldMinY / CHUNK_SIZE);
    const cMaxY = Math.floor(worldMaxY / CHUNK_SIZE);

    const needed = new Set();
    for (let cx = cMinX; cx <= cMaxX; cx++) {
      for (let cy = cMinY; cy <= cMaxY; cy++) {
        const key = cx + "," + cy;
        needed.add(key);
        if (!activeChunks.has(key)) {
          renderChunk(cx, cy, key);
        }
      }
    }

    const wMinXc = -offsetX - CLEANUP_BUFFER;
    const wMaxXc = -offsetX + rect.width + CLEANUP_BUFFER;
    const wMinYc = -offsetY - CLEANUP_BUFFER;
    const wMaxYc = -offsetY + rect.height + CLEANUP_BUFFER;

    activeChunks.forEach((els, key) => {
      if (needed.has(key)) return;
      const [cxStr, cyStr] = key.split(",");
      const cx = parseInt(cxStr, 10);
      const cy = parseInt(cyStr, 10);
      const chunkWorldX = cx * CHUNK_SIZE;
      const chunkWorldY = cy * CHUNK_SIZE;

      const outOfRange =
        chunkWorldX + CHUNK_SIZE < wMinXc ||
        chunkWorldX > wMaxXc ||
        chunkWorldY + CHUNK_SIZE < wMinYc ||
        chunkWorldY > wMaxYc;

      if (outOfRange) {
        els.forEach((el) => el.remove());
        activeChunks.delete(key);
      }
    });
  }

  let chunkUpdateScheduled = false;
  function scheduleChunkUpdate() {
    if (chunkUpdateScheduled) return;
    chunkUpdateScheduled = true;
    requestAnimationFrame(() => {
      updateChunks();
      chunkUpdateScheduled = false;
    });
  }

  // ---------- panning (drag + wheel/trackpad) with inertia ----------
  let offsetX = 0;
  let offsetY = 0;

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
    offsetX += velX;
    offsetY += velY;
    velX *= FRICTION;
    velY *= FRICTION;
    applyTransform();
    scheduleChunkUpdate();

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

    offsetX = dragStartOffsetX + dx;
    offsetY = dragStartOffsetY + dy;
    applyTransform();
    scheduleChunkUpdate();

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

  // Trackpad / mouse wheel pans the canvas instead of scrolling the page
  canvas.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      offsetX -= e.deltaX;
      offsetY -= e.deltaY;
      applyTransform();
      scheduleChunkUpdate();
    },
    { passive: false }
  );

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(scheduleChunkUpdate, 150);
  });

  updateChunks();
})();
