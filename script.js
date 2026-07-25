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
   CRAYON IMAGE REVEAL (HERO ONLY)
   ========================================================== */
class RevealBackground {
  constructor(canvasElement, config = {}) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    
    this.config = {
      imageSrc: config.imageSrc || "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/e4476503-c1e3-4358-3ff6-539deda1f800/w=800",
      revealSize: 80,       // Size of the crayon brush tip
      stayDuration: 2500,   // How long the stroke stays visible (2.5 seconds)
      fadeDuration: 1000,   // How long it takes to fade out (1 second)
      ...config
    };
    
    this.revealCanvas = document.createElement('canvas');
    this.maskCanvas = document.createElement('canvas');
    
    this.strokes = [];
    this.lastPoint = null;
    
    this.coverRect = { dx: 0, dy: 0, dw: 0, dh: 0 };
    this.alive = true;
    this.img = null;
    this.brush = null;
    
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

  // Generates a custom gritty crayon texture for the brush tip
  createCrayonBrush() {
    const radius = this.config.revealSize * (Math.min(window.devicePixelRatio || 1, 2));
    const c = document.createElement('canvas');
    c.width = radius * 2;
    c.height = radius * 2;
    const ctx = c.getContext('2d');
    
    ctx.fillStyle = '#FFFFFF';
    
    // Draw 400 random gritty particles to form the crayon stamp
    for (let i = 0; i < 400; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = (Math.random() + Math.random()) / 2; // Bias towards center
      const dist = r * radius * 0.95;
      
      const px = radius + Math.cos(angle) * dist;
      const py = radius + Math.sin(angle) * dist;
      
      const size = Math.random() * (radius * 0.1) + 1;
      
      ctx.globalAlpha = Math.random() * 0.7 + 0.1;
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    this.brush = c;
    this.brushRadius = radius;
  }

  addStroke(tx, ty) {
    const now = Date.now();
    
    // Interpolate points between fast mouse movements so the line doesn't break
    if (this.lastPoint) {
      const dx = tx - this.lastPoint.x;
      const dy = ty - this.lastPoint.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const step = (this.config.revealSize * 0.15); // Stamp every 15% of brush size
      
      if (dist > step) {
        const count = Math.floor(dist / step);
        for (let i = 1; i <= count; i++) {
          this.strokes.push({
            x: this.lastPoint.x + dx * (i / count),
            y: this.lastPoint.y + dy * (i / count),
            birth: now
          });
        }
      }
    }
    
    this.strokes.push({ x: tx, y: ty, birth: now });
    this.lastPoint = { x: tx, y: ty };
  }

  resize() {
    if (!this.img) return;
    const { w, h, dpr } = this.getSize();
    this.canvas.width = Math.max(1, Math.round(w * dpr));
    this.canvas.height = Math.max(1, Math.round(h * dpr));
    
    this.createCrayonBrush(); 
    
    this.coverRect = this.placeRect(
      this.img.width, this.img.height,
      this.canvas.width, this.canvas.height
    );
  }

  paint() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    if (!this.img || this.strokes.length === 0) return;
    
    const now = Date.now();
    const maxAge = this.config.stayDuration + this.config.fadeDuration;
    
    // Garbage collect strokes that have fully faded away
    this.strokes = this.strokes.filter(s => (now - s.birth) < maxAge);
    
    if (this.strokes.length === 0) return;

    this.ensureLayer(this.revealCanvas);
    this.ensureLayer(this.maskCanvas);
    
    const pctx = this.revealCanvas.getContext('2d');
    const mctx = this.maskCanvas.getContext('2d');
    
    pctx.globalCompositeOperation = "source-over";
    pctx.clearRect(0, 0, this.revealCanvas.width, this.revealCanvas.height);
    pctx.drawImage(this.img, this.coverRect.dx, this.coverRect.dy, this.coverRect.dw, this.coverRect.dh);
    
    mctx.clearRect(0, 0, this.maskCanvas.width, this.maskCanvas.height);
    
    // Draw all active crayon strokes
    for (const s of this.strokes) {
      const age = now - s.birth;
      let alpha = 1;
      
      // If it's older than stayDuration, start fading it out
      if (age > this.config.stayDuration) {
        alpha = 1 - ((age - this.config.stayDuration) / this.config.fadeDuration);
      }
      
      mctx.globalAlpha = Math.max(0, alpha);
      mctx.drawImage(this.brush, s.x - this.brushRadius, s.y - this.brushRadius);
    }
    
    pctx.globalCompositeOperation = "destination-in";
    pctx.drawImage(this.maskCanvas, 0, 0);
    
    this.ctx.globalAlpha = 1.0;
    this.ctx.globalCompositeOperation = "source-over";
    this.ctx.drawImage(this.revealCanvas, 0, 0);
  }

  loop = () => {
    if (!this.alive) return;
    this.paint();
    requestAnimationFrame(this.loop);
  }

  init() {
    this.img = new Image();
    this.img.src = this.config.imageSrc; 
    
    this.img.onload = () => {
      if (!this.alive) return;
      this.resize();
      this.paint();
      requestAnimationFrame(this.loop);
    };
    
    window.addEventListener('resize', () => {
      this.resize();
    });
    
    const container = this.canvas.parentElement;
    
    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      const { dpr } = this.getSize();
      const tx = (e.clientX - rect.left) * dpr;
      const ty = (e.clientY - rect.top) * dpr;
      this.addStroke(tx, ty);
    });
    
    container.addEventListener('mouseout', (e) => {
      if (!container.contains(e.relatedTarget)) {
        this.lastPoint = null; // Lift the crayon off the page when mouse leaves
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
