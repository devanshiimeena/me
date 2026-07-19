// Floating draggable image collage — pointer-based, with inertia and GPU-accelerated transforms
(function () {
  const board = document.getElementById("dragBoard");
  if (!board) return;

  const cards = Array.from(board.querySelectorAll(".drag-card"));
  let topZ = 10;

  // Each card gets its own state: position, velocity, rotation, and a momentum loop flag
  const state = new Map();

  function boardSize() {
    const rect = board.getBoundingClientRect();
    return { w: rect.width, h: rect.height };
  }

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function placeRandomly(card) {
    const { w, h } = boardSize();
    const cardW = card.offsetWidth;
    const cardH = card.offsetHeight;

    const maxX = Math.max(0, w - cardW);
    const maxY = Math.max(0, h - cardH);

    const x = randomBetween(0, maxX);
    const y = randomBetween(0, maxY);
    const rotation = randomBetween(-9, 9);

    state.set(card, {
      x,
      y,
      vx: 0,
      vy: 0,
      rotation,
      dragging: false,
      momentum: false,
    });

    applyTransform(card);
  }

  function applyTransform(card) {
    const s = state.get(card);
    card.style.transform =
      "translate3d(" + s.x + "px, " + s.y + "px, 0) rotate(" + s.rotation + "deg)";
  }

  function clampToBoard(card, s) {
    const { w, h } = boardSize();
    const cardW = card.offsetWidth;
    const cardH = card.offsetHeight;
    const maxX = Math.max(0, w - cardW);
    const maxY = Math.max(0, h - cardH);

    if (s.x < 0) {
      s.x = 0;
      s.vx = 0;
    } else if (s.x > maxX) {
      s.x = maxX;
      s.vx = 0;
    }

    if (s.y < 0) {
      s.y = 0;
      s.vy = 0;
    } else if (s.y > maxY) {
      s.y = maxY;
      s.vy = 0;
    }
  }

  // Initial random placement once layout is ready
  window.requestAnimationFrame(() => {
    cards.forEach(placeRandomly);
  });

  // Re-scatter on resize so cards stay within the new viewport bounds
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      cards.forEach((card) => {
        const s = state.get(card);
        if (!s) return;
        clampToBoard(card, s);
        applyTransform(card);
      });
    }, 150);
  });

  const FRICTION = 0.94;
  const STOP_THRESHOLD = 0.03;
  const activeMomentum = new Set();

  function momentumTick() {
    activeMomentum.forEach((card) => {
      const s = state.get(card);
      s.x += s.vx;
      s.y += s.vy;
      s.vx *= FRICTION;
      s.vy *= FRICTION;

      clampToBoard(card, s);
      applyTransform(card);

      if (Math.abs(s.vx) < STOP_THRESHOLD && Math.abs(s.vy) < STOP_THRESHOLD) {
        s.vx = 0;
        s.vy = 0;
        activeMomentum.delete(card);
      }
    });

    if (activeMomentum.size > 0) {
      requestAnimationFrame(momentumTick);
    }
  }

  cards.forEach((card) => {
    let pointerStartX = 0;
    let pointerStartY = 0;
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let lastY = 0;
    let lastTime = 0;
    let velX = 0;
    let velY = 0;

    card.addEventListener("pointerdown", (e) => {
      const s = state.get(card);
      if (!s) return;

      activeMomentum.delete(card);
      s.vx = 0;
      s.vy = 0;

      card.setPointerCapture(e.pointerId);
      card.classList.add("dragging");
      document.body.classList.add("is-dragging");

      topZ += 1;
      card.style.zIndex = topZ;

      pointerStartX = e.clientX;
      pointerStartY = e.clientY;
      startX = s.x;
      startY = s.y;
      lastX = e.clientX;
      lastY = e.clientY;
      lastTime = performance.now();
      velX = 0;
      velY = 0;

      s.dragging = true;
    });

    card.addEventListener("pointermove", (e) => {
      const s = state.get(card);
      if (!s || !s.dragging) return;

      const dx = e.clientX - pointerStartX;
      const dy = e.clientY - pointerStartY;

      s.x = startX + dx;
      s.y = startY + dy;

      clampToBoard(card, s);
      applyTransform(card);

      const now = performance.now();
      const dt = Math.max(now - lastTime, 1);
      velX = ((e.clientX - lastX) / dt) * 16; // approximate px per frame at 60fps
      velY = ((e.clientY - lastY) / dt) * 16;

      lastX = e.clientX;
      lastY = e.clientY;
      lastTime = now;
    });

    function endDrag(e) {
      const s = state.get(card);
      if (!s || !s.dragging) return;

      s.dragging = false;
      card.classList.remove("dragging");
      document.body.classList.remove("is-dragging");

      try {
        card.releasePointerCapture(e.pointerId);
      } catch (err) {
        /* no-op */
      }

      // hand off to inertia
      s.vx = velX;
      s.vy = velY;

      if (Math.abs(s.vx) > STOP_THRESHOLD || Math.abs(s.vy) > STOP_THRESHOLD) {
        activeMomentum.add(card);
        requestAnimationFrame(momentumTick);
      }
    }

    card.addEventListener("pointerup", endDrag);
    card.addEventListener("pointercancel", endDrag);
  });
})();

    
