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

/* ==========================================================
   CODEPEN 3D CAROUSEL LOGIC
   ========================================================== */
(function() {
  const stage = document.getElementById("stage");
  if (!stage) return;
  const dotsContainer = document.getElementById("dots");
  const liveRegion = document.getElementById("live-region");
  const frameLabel = document.getElementById("frame-label");
  const frameCount = document.getElementById("frame-count");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");

  const photos = [
    { src: "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/e60dd7f7-a44f-40a7-df62-095b19cd8700/w=800", title: "WORK 01", place: "BRANDING", no: "01" },
    { src: "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/eec164e9-23f8-4f87-b48a-a208fa806100/w=800", title: "WORK 02", place: "ILLUSTRATION", no: "02" },
    { src: "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/859c75ea-953e-489e-be61-91a03a35d700/w=800", title: "WORK 03", place: "DESIGN", no: "03" },
    { src: "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/933a7615-f4b6-4eae-8ed1-705fa0e24400/w=800", title: "WORK 04", place: "UI/UX", no: "04" },
    { src: "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/7d4d2641-d6a8-4fef-e85c-b12ed100d500/w=800", title: "WORK 05", place: "WEB", no: "05" },
    { src: "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/ed7b1c40-3332-43d8-a9eb-4615ef341b00/w=800", title: "WORK 06", place: "PRINT", no: "06" },
    { src: "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/31afae9c-5ba3-4ec3-2534-ed8198ed1100/w=800", title: "WORK 07", place: "3D", no: "07" },
    { src: "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/bd541261-75be-469c-7dc0-dae0ce81c400/w=800", title: "WORK 08", place: "CONCEPT", no: "08" },
  ];

  let current = 2;
  const drag = { startX: 0, dragging: false };

  function clampIndex(i) {
    return Math.min(photos.length - 1, Math.max(0, i));
  }

  function buildSlides() {
    photos.forEach((photo, i) => {
      const slide = document.createElement("figure");
      slide.className = "slide";
      slide.dataset.index = i;
      slide.setAttribute("role", "group");
      slide.setAttribute("aria-roledescription", "slide");
      slide.setAttribute("aria-label", `${i + 1} of ${photos.length}: ${photo.title}, ${photo.place}`);
      slide.tabIndex = -1;

      const frame = document.createElement("div");
      frame.className = "slide-frame";

      const img = document.createElement("img");
      img.src = photo.src;
      img.alt = photo.title;
      img.draggable = false;
      img.loading = "lazy";

      frame.appendChild(img);

      const caption = document.createElement("figcaption");
      caption.innerHTML = `<span class="title">${photo.title}</span><br><span class="place">${photo.place}</span>`;

      slide.appendChild(frame);
      slide.appendChild(caption);

      slide.addEventListener("click", () => goTo(i));

      stage.appendChild(slide);
    });
  }

  function buildDots() {
    photos.forEach((photo, i) => {
      const btn = document.createElement("button");
      btn.className = "dot-btn";
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-label", `Go to ${photo.title}`);
      btn.dataset.index = i;

      const dot = document.createElement("span");
      dot.className = "dot";
      btn.appendChild(dot);

      btn.addEventListener("click", () => goTo(i));

      dotsContainer.appendChild(btn);
    });
  }

  function render() {
    const CARD_WIDTH = window.innerWidth <= 720 ? 200 : 280;
    
    const slides = stage.querySelectorAll(".slide");
    slides.forEach((slide) => {
      const i = Number(slide.dataset.index);
      const offset = i - current;
      const isCurrent = offset === 0;
      const distance = Math.abs(offset);
      const sign = Math.sign(offset);
      const visible = distance <= 4;

      const x = sign * (CARD_WIDTH * 0.62 + Math.min(distance, 3) * 14);
      const rotateY = sign * -42;
      const scale = isCurrent ? 1 : 1 - Math.min(distance, 3) * 0.08;

      slide.style.transform = `translateX(${x}px) rotateY(${rotateY}deg) scale(${scale})`;
      slide.style.opacity = visible ? "1" : "0";
      slide.style.zIndex = 10 - distance;
      slide.style.pointerEvents = visible ? "auto" : "none";
      slide.classList.toggle("is-current", isCurrent);
      slide.setAttribute("aria-current", isCurrent);
      slide.tabIndex = isCurrent ? 0 : -1;
    });

    dotsContainer.querySelectorAll(".dot-btn").forEach((btn) => {
      const i = Number(btn.dataset.index);
      const isCurrent = i === current;
      btn.classList.toggle("is-active", isCurrent);
      btn.setAttribute("aria-selected", isCurrent);
    });

    const photo = photos[current];
    frameLabel.textContent = `FRAME ${photo.no}`;
    frameCount.textContent = `${String(current + 1).padStart(2, "0")} / ${String(photos.length).padStart(2, "0")}`;
    liveRegion.textContent = `Frame ${current + 1} of ${photos.length}, ${photo.title}, ${photo.place}`;

    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === photos.length - 1;
  }

  function goTo(i) {
    current = clampIndex(i);
    render();
  }

  function prev() {
    goTo(current - 1);
  }

  function next() {
    goTo(current + 1);
  }

  prevBtn.addEventListener("click", prev);
  nextBtn.addEventListener("click", next);

  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  });

  stage.addEventListener("pointerdown", (e) => {
    drag.startX = e.clientX;
    drag.dragging = true;
  });

  stage.addEventListener("pointerup", (e) => {
    if (!drag.dragging) return;
    const delta = e.clientX - drag.startX;
    if (delta > 40) prev();
    else if (delta < -40) next();
    drag.dragging = false;
  });

  window.addEventListener("resize", render);

  buildSlides();
  buildDots();
  render();
})();
/* ==========================================================
   GLOBAL CURSOR TRACKING
   ========================================================== */
document.addEventListener('DOMContentLoaded', () => {
    // Auto-inject the cursor so you don't have to edit all your HTML pages!
    const cursorShadow = document.createElement('div');
    cursorShadow.className = 'cursor-shadow';
    document.body.appendChild(cursorShadow);

    // Update CSS variables on mouse move
    window.addEventListener('mousemove', (e) => {
        document.documentElement.style.setProperty('--cursor-x', `${e.clientX}px`);
        document.documentElement.style.setProperty('--cursor-y', `${e.clientY}px`);
    });
});

/* ==========================================================
   IMAGE REVEAL BACKGROUND (HERO ONLY)
   ========================================================== */
class RevealBackground {
  constructor(canvasElement, config = {}) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    
    this.config = {
      // Put your image link here! (It won't crash anymore)
      imageSrc: config.imageSrc || "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/e4476503-c1e3-4358-3ff6-539deda1f800/w=800",
      revealSize: 120,
      revealSoftness: 24,
      blobCount: 5,
      ...config
    };
    
    this.revealCanvas = document.createElement('canvas');
    this.maskCanvas = document.createElement('canvas');
    
    this.pointer = { x: -9999, y: -9999, inside: false };
    this.blobs = Array.from({ length: this.config.blobCount }, () => ({ x: 0, y: 0 }));
    this.seeded = false;
    
    this.coverRect = { dx: 0, dy: 0, dw: 0, dh: 0 };
    this.alive = true;
    this.raf = null;
    this.img = null;
    this.revealOpacity = 0; 
    
    this.init();
  }

  getSize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const container = this.canvas.parentElement;
    const w = container.clientWidth;
    const h = container.clientHeight;
    return { w, h, dpr };
  }

  placeRect(imgW, imgH, boxW, boxH) {
    const scale = Math.max(boxW / imgW, boxH / imgH);
    const dw = imgW * scale;
    const dh = imgH * scale;
    const dx = (boxW - dw) / 2;
    const dy = (boxH - dh) * 0.5; 
    return { dx, dy, dw, dh };
  }

  ensureLayer(layer) {
    if (layer.width !== this.canvas.width || layer.height !== this.canvas.height) {
      layer.width = this.canvas.width;
      layer.height = this.canvas.height;
    }
  }

  updatePhysics() {
    if (this.blobs.length === 0) return;
    const { dpr } = this.getSize();
    
    const tx = this.pointer.x * dpr;
    const ty = this.pointer.y * dpr;
    
    if (!this.seeded && this.pointer.inside) {
      for (const blob of this.blobs) {
        blob.x = tx;
        blob.y = ty;
      }
      this.seeded = true;
    }
    
    if (this.seeded) {
      this.blobs[0].x += (tx - this.blobs[0].x) * 0.35;
      this.blobs[0].y += (ty - this.blobs[0].y) * 0.35;
      
      for (let i = 1; i < this.blobs.length; i++) {
        this.blobs[i].x += (this.blobs[i-1].x - this.blobs[i].x) * 0.35;
        this.blobs[i].y += (this.blobs[i-1].y - this.blobs[i].y) * 0.35;
      }
    }

    if (this.pointer.inside) {
      this.revealOpacity += (1 - this.revealOpacity) * 0.1;
    } else {
      this.revealOpacity += (0 - this.revealOpacity) * 0.05; 
    }
  }

  resize() {
    if (!this.img) return;
    const { w, h, dpr } = this.getSize();
    this.canvas.width = Math.max(1, Math.round(w * dpr));
    this.canvas.height = Math.max(1, Math.round(h * dpr));
    
    this.coverRect = this.placeRect(
      this.img.width, this.img.height,
      this.canvas.width, this.canvas.height
    );
  }

  paint() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    if (!this.img || this.revealOpacity < 0.01) return;
    
    const { dpr } = this.getSize();
    
    this.ensureLayer(this.revealCanvas);
    this.ensureLayer(this.maskCanvas);
    
    const pctx = this.revealCanvas.getContext('2d');
    const mctx = this.maskCanvas.getContext('2d');
    
    pctx.globalCompositeOperation = "source-over";
    pctx.clearRect(0, 0, this.revealCanvas.width, this.revealCanvas.height);
    pctx.drawImage(this.img, this.coverRect.dx, this.coverRect.dy, this.coverRect.dw, this.coverRect.dh);
    
    mctx.clearRect(0, 0, this.maskCanvas.width, this.maskCanvas.height);
    mctx.save();
    mctx.filter = `blur(${(this.config.revealSoftness * dpr).toFixed(1)}px)`;
    mctx.fillStyle = "#FFFFFF";
    
    for (let i = 0; i < this.blobs.length; i++) {
      const t = this.blobs.length <= 1 ? 0 : i / (this.blobs.length - 1);
      const radius = this.config.revealSize * dpr * (1 - t * 0.5);
      mctx.beginPath();
      mctx.arc(this.blobs[i].x, this.blobs[i].y, radius, 0, Math.PI * 2);
      mctx.fill();
    }
    mctx.restore();
    
    pctx.globalCompositeOperation = "destination-in";
    pctx.drawImage(this.maskCanvas, 0, 0);
    
    this.ctx.globalAlpha = this.revealOpacity;
    this.ctx.globalCompositeOperation = "source-over";
    this.ctx.drawImage(this.revealCanvas, 0, 0);
    this.ctx.globalAlpha = 1.0;
  }

  loop = () => {
    if (!this.alive) return;
    this.updatePhysics();
    this.paint();
    this.raf = requestAnimationFrame(this.loop);
  }

  init() {
    this.img = new Image();
    this.img.src = this.config.imageSrc; // No crossOrigin blocks anymore!
    
    this.img.onload = () => {
      if (!this.alive) return;
      this.resize();
      this.paint();
      this.raf = requestAnimationFrame(this.loop);
    };
    
    window.addEventListener('resize', () => {
      this.resize();
      this.paint();
    });
    
    const container = this.canvas.parentElement;
    
    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      this.pointer.x = e.clientX - rect.left;
      this.pointer.y = e.clientY - rect.top;
      this.pointer.inside = true;
    });
    
    container.addEventListener('mouseout', (e) => {
      if (!container.contains(e.relatedTarget)) {
        this.pointer.inside = false;
        this.seeded = false;
      }
    });
  }
}

// Automatically start the effect when the page loads
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('ascii-bg');
  if (canvas) {
    new RevealBackground(canvas);
  }
});

/* ==========================================================
   SCROLL SPY FOR NAVIGATION LINKS
   ========================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.site-header__nav a, .mobile-menu a');

  const observerOptions = {
    root: null,
    // Triggers when the section passes through the middle of the viewport
    rootMargin: '-50% 0px -50% 0px', 
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        
        // Remove active class from all links
        navLinks.forEach(link => link.classList.remove('active'));
        
        // Add active class to corresponding links
        const activeLinks = document.querySelectorAll(`.site-header__nav a[href="#${id}"], .mobile-menu a[href="#${id}"]`);
        activeLinks.forEach(link => link.classList.add('active'));
      }
    });
  }, observerOptions);

  sections.forEach(section => {
    observer.observe(section);
  });
});
