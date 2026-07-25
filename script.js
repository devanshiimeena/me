// Mobile menu toggle
const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.getElementById("mobileMenu");

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.textContent = isOpen ? "CLOSE" : "MENU";
  });

  // Close menu after tapping a link
  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.textContent = "MENU";
    });
  });
}

// Playful cursor-follow tilt & magnetic effect for interactive elements
const magneticElements = document.querySelectorAll(".work__item, .contact__button, .eyebrow, .hero__scroll, .site-header__mark, .facts__label, .blog-list__item");

magneticElements.forEach((item) => {
  item.addEventListener("mousemove", (e) => {
    const rect = item.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Magnetic pull and tilt
    const tiltX = (y / rect.height) * 8;
    const tiltY = (x / rect.width) * -8;
    // Translate slightly towards the cursor for a magnetic effect
    const transX = x * 0.15;
    const transY = y * 0.15;
    item.style.transform = `perspective(600px) translate3d(${transX}px, ${transY}px, 0) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
  });

  item.addEventListener("mouseleave", () => {
    item.style.transform = "none";
    item.style.transition = "transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)";
  });
  
  item.addEventListener("mouseenter", () => {
    item.style.transition = "transform 0.1s ease-out";
  });
});

// Wavy cursor distortion on .fullbleed sections
(function() {
  const fullbleedSections = document.querySelectorAll('.fullbleed, .bigline');
  if (fullbleedSections.length === 0) return;

  // Create SVG filter dynamically
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.style.position = "absolute";
  svg.style.width = "0";
  svg.style.height = "0";
  svg.style.pointerEvents = "none";
  
  const filter = document.createElementNS(svgNS, "filter");
  filter.setAttribute("id", "wavy-cursor-filter");
  
  const turbulence = document.createElementNS(svgNS, "feTurbulence");
  turbulence.setAttribute("type", "fractalNoise");
  // Subtler frequency for a liquid, non-glitchy wave
  turbulence.setAttribute("baseFrequency", "0.01 0.02");
  turbulence.setAttribute("numOctaves", "2");
  turbulence.setAttribute("result", "noise");
  
  const displacement = document.createElementNS(svgNS, "feDisplacementMap");
  displacement.setAttribute("in", "SourceGraphic");
  displacement.setAttribute("in2", "noise");
  displacement.setAttribute("scale", "0");
  displacement.setAttribute("xChannelSelector", "R");
  displacement.setAttribute("yChannelSelector", "G");
  
  filter.appendChild(turbulence);
  filter.appendChild(displacement);
  svg.appendChild(filter);
  document.body.appendChild(svg);

  // Apply filter to paragraphs in the section
  fullbleedSections.forEach(section => {
    const p = section.querySelector('p');
    if (p) {
      p.style.filter = "url(#wavy-cursor-filter)";
      // Fix clipping on large displacements
      p.style.padding = "20px";
      p.style.margin = "-20px"; 
    }
  });

  let targetScale = 0;
  let currentScale = 0;
  let seed = 0;
  let lastX = 0;
  let lastY = 0;
  let moveSpeed = 0;
  
  document.addEventListener('mousemove', (e) => {
    let isHovering = false;
    
    fullbleedSections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top - 50 && e.clientY <= rect.bottom + 50) {
        isHovering = true;
      }
    });

    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    const speed = Math.sqrt(dx*dx + dy*dy);
    
    if (isHovering && speed > 0) {
      targetScale = Math.min(speed * 2, 35);
      moveSpeed = speed;
    }
    
    lastX = e.clientX;
    lastY = e.clientY;
  });
  
  function animateWave() {
    currentScale += (targetScale - currentScale) * 0.1;
    
    if (moveSpeed > 0.1) {
      seed += moveSpeed * 0.05;
      turbulence.setAttribute("seed", Math.floor(seed));
      const freq1 = 0.01 + Math.sin(seed * 0.1) * 0.005;
      const freq2 = 0.02 + Math.cos(seed * 0.1) * 0.005;
      turbulence.setAttribute("baseFrequency", `${freq1} ${freq2}`);
    }

    if (currentScale > 0.1) {
      displacement.setAttribute("scale", currentScale.toFixed(2));
    } else {
      displacement.setAttribute("scale", "0");
    }
    
    // Decay the target scale and movement speed so it stops when mouse stops
    targetScale *= 0.9;
    moveSpeed *= 0.9;
    
    requestAnimationFrame(animateWave);
  }
  
  requestAnimationFrame(animateWave);
})();

// Opposite-Direction Scroll Gallery Logic
(function() {
  const gallery = document.querySelector(".gallery-section");
  const columns = document.querySelectorAll(".gallery__column");
  if (!gallery || columns.length === 0) return;

  // We only want the effect to run on desktop, or we can run it everywhere. Let run it everywhere but subtly.
  window.addEventListener("scroll", () => {
    // Check if gallery is in viewport
    const rect = gallery.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    if (rect.top <= viewportHeight && rect.bottom >= 0) {
      // Calculate scroll progress through the section
      const progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
      
      columns.forEach(col => {
        const direction = parseFloat(col.getAttribute("data-direction") || "1");
        // Move columns based on direction and scroll progress
        // When progress goes from 0 to 1, we want translation to go from -150px to 150px approx
        const yOffset = (progress - 0.5) * 300 * direction; 
        col.style.transform = `translate3d(0, ${yOffset}px, 0)`;
      });
    }
  });
})();

// ============================================================
// INK BLEED — vanilla JS port of the InkBleed React component.
// Targets #inkHeadline only; no-ops if that element isn't on the
// page. Typography is left entirely to the existing .hero__headline
// CSS — this script only builds the layered DOM structure and
// drives the cursor-follow animation.
// ============================================================
(function () {
  const headline = document.getElementById("inkHeadline");
  if (!headline) return;

  // ---- configured parameters (ported 1:1 from the React component) ----
  const SECONDARY_RADIUS = 35;
  const BLUR_AMOUNT = 10;
  const FRINGE = 5;
  const LEFT_CHOKER_OFFSET = -10;
  const RIGHT_CHOKER_OFFSET = 10;
  const GOO_BLUR = 6;
  const THRESHOLD = 40;
  const CUTOFF = -15;
  const FOLLOW = 0.3;
  const INTENSITY_FOLLOW = 0.25;
  const SETTLE_EPSILON = 0.4;
  const INTENSITY = 25; // configured "intensity" prop
  const intensityFactor = Math.max(0, Math.min(100, INTENSITY)) / 16.67;

  const uid = "inkbleed-" + Math.random().toString(36).slice(2, 9);
  const filterGooId = "ink-goo-" + uid;
  const filterFringeId = "ink-fringe-" + uid;

  // ---- inject the SVG filter defs once (goo pipeline + fringe) ----
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("aria-hidden", "true");
  svg.style.position = "absolute";
  svg.style.width = "0";
  svg.style.height = "0";
  svg.style.pointerEvents = "none";
  svg.innerHTML =
    '<defs>' +
    '<filter id="' + filterGooId + '">' +
    '<feGaussianBlur in="SourceGraphic" stdDeviation="' + GOO_BLUR + '" result="blur"/>' +
    '<feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ' + THRESHOLD + ' ' + CUTOFF + '" result="goo"/>' +
    '<feComposite in="SourceGraphic" in2="goo" operator="atop"/>' +
    '</filter>' +
    '<filter id="' + filterFringeId + '" x="-50%" y="-50%" width="200%" height="200%">' +
    '<feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="rOnly"/>' +
    '<feOffset in="rOnly" dx="' + -FRINGE + '" dy="0" result="rShift"/>' +
    '<feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="gOnly"/>' +
    '<feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="bOnly"/>' +
    '<feOffset in="bOnly" dx="' + FRINGE + '" dy="0" result="bShift"/>' +
    '<feBlend in="rShift" in2="gOnly" mode="screen" result="rg"/>' +
    '<feBlend in="rg" in2="bShift" mode="screen" result="rgb"/>' +
    '</filter>' +
    '</defs>';
  document.body.appendChild(svg);

  // ---- parse the heading's existing text into lines (splits on <br>) ----
  const rawHTML = headline.innerHTML;
  const lines = rawHTML
    .split(/<br\s*\/?>/i)
    .map((line) => line.replace(/^\s+|\s+$/g, ""));

  // ---- build the goo container + per-character layered spans ----
  const gooEl = document.createElement("span");
  gooEl.className = "ink-bleed__goo";
  gooEl.style.filter = "url(#" + filterGooId + ")";

  const wrapEls = [];
  const leftEls = [];
  const rightEls = [];

  function buildChar(ch) {
    const wrap = document.createElement("span");
    wrap.className = "ink-bleed__char";

    const sharp = document.createElement("span");
    sharp.className = "ink-bleed__layer ink-bleed__sharp";
    sharp.textContent = ch === " " ? "\u00A0" : ch;

    const blur = document.createElement("span");
    blur.className = "ink-bleed__layer ink-bleed__blur";
    blur.setAttribute("aria-hidden", "true");
    blur.textContent = ch === " " ? "\u00A0" : ch;

    const left = document.createElement("span");
    left.className = "ink-bleed__layer ink-bleed__choker-left";
    left.setAttribute("aria-hidden", "true");
    left.textContent = ch === " " ? "\u00A0" : ch;

    const right = document.createElement("span");
    right.className = "ink-bleed__layer ink-bleed__choker-right";
    right.setAttribute("aria-hidden", "true");
    right.textContent = ch === " " ? "\u00A0" : ch;

    wrap.appendChild(sharp);
    wrap.appendChild(blur);
    wrap.appendChild(left);
    wrap.appendChild(right);

    wrapEls.push(wrap);
    leftEls.push(left);
    rightEls.push(right);

    return wrap;
  }

  lines.forEach((line, lineIndex) => {
    Array.from(line).forEach((ch) => {
      gooEl.appendChild(buildChar(ch));
    });
    if (lineIndex < lines.length - 1) {
      const brk = document.createElement("span");
      brk.className = "ink-bleed__break";
      gooEl.appendChild(brk);
    }
  });

  headline.innerHTML = "";
  headline.appendChild(gooEl);

  // ---- measure each character's viewport-relative bounding box ----
  let metrics = [];

  function measure() {
    metrics = wrapEls.map((el) => {
      const r = el.getBoundingClientRect();
      return { left: r.left, top: r.top, w: r.width, h: r.height };
    });
  }

  measure();
  const ro = new ResizeObserver(measure);
  ro.observe(gooEl);
  window.addEventListener("scroll", measure, { passive: true });
  window.addEventListener("resize", measure);

  // ---- cursor smoothing + animation loop (ported 1:1) ----
  const target = { x: -9999, y: -9999, on: 0 };
  const smooth = { x: -9999, y: -9999, on: 0 };
  let rafId = null;

  function render() {
    gooEl.style.setProperty("--spot-on", (smooth.on * intensityFactor).toFixed(3));

    for (let i = 0; i < metrics.length; i++) {
      const m = metrics[i];
      if (!m || m.w === 0) continue;

      const wrap = wrapEls[i];
      const leftEl = leftEls[i];
      const rightEl = rightEls[i];

      const mxBase = smooth.x - m.left;
      const myActual = smooth.y - m.top;

      wrap.style.setProperty("--mx", mxBase.toFixed(1) + "px");
      wrap.style.setProperty("--my", myActual.toFixed(1) + "px");

      leftEl.style.setProperty("--mx", (mxBase - LEFT_CHOKER_OFFSET).toFixed(1) + "px");
      leftEl.style.setProperty("--my", myActual.toFixed(1) + "px");

      rightEl.style.setProperty("--mx", (mxBase - RIGHT_CHOKER_OFFSET).toFixed(1) + "px");
      rightEl.style.setProperty("--my", myActual.toFixed(1) + "px");
    }
  }

  function tick() {
    smooth.x += (target.x - smooth.x) * FOLLOW;
    smooth.y += (target.y - smooth.y) * FOLLOW;
    smooth.on += (target.on - smooth.on) * INTENSITY_FOLLOW;
    render();

    const settled =
      Math.abs(target.x - smooth.x) < SETTLE_EPSILON &&
      Math.abs(target.y - smooth.y) < SETTLE_EPSILON &&
      Math.abs(target.on - smooth.on) < 0.005;

    if (settled && target.on === 0) {
      smooth.on = 0;
      render();
      rafId = null;
      return;
    }
    rafId = requestAnimationFrame(tick);
  }

  function startLoop() {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(tick);
  }

  gooEl.addEventListener("mousemove", (e) => {
    if (target.on === 0) {
      smooth.x = e.clientX;
      smooth.y = e.clientY;
    }
    target.x = e.clientX;
    target.y = e.clientY;
    target.on = 1;
    startLoop();
  });

  gooEl.addEventListener("mouseleave", () => {
    target.on = 0;
    startLoop();
  });
})();
