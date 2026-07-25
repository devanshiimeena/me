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
   HORIZONTAL SCALING CAROUSEL LOGIC
   ========================================================== */
(function() {
  const track = document.getElementById("carouselTrack");
  if (!track) return;

  const originalItems = Array.from(track.querySelectorAll(".carousel-item"));
  if (originalItems.length === 0) return;

  // Clone the images twice so they loop infinitely and seamlessly
  originalItems.forEach(item => track.appendChild(item.cloneNode(true)));
  originalItems.forEach(item => track.appendChild(item.cloneNode(true)));

  const allItems = Array.from(track.querySelectorAll(".carousel-item"));
  let currentX = 0;
  const speed = 1.2; // You can adjust this to make it pan faster or slower!

  function animateCarousel() {
    currentX -= speed;

    // Measure the exact width of a single set of images to loop seamlessly
    const itemWidth = originalItems[0].offsetWidth;
    const gap = parseFloat(window.getComputedStyle(track).gap) || 0;
    const singleSetWidth = (itemWidth + gap) * originalItems.length;

    // Snap back instantly when we reach the end of the first set
    if (Math.abs(currentX) >= singleSetWidth) {
      currentX += singleSetWidth;
    }

    track.style.transform = `translate3d(${currentX}px, 0, 0)`;

    // Calculate scaling logic based on screen center
    const viewportCenter = window.innerWidth / 2;
    
    allItems.forEach(item => {
      const rect = item.getBoundingClientRect();
      const itemCenter = rect.left + rect.width / 2;
      const distanceFromCenter = Math.abs(viewportCenter - itemCenter);
      
      const maxDistance = window.innerWidth / 1.5; 
      
      // Images grow to 1.15 scale when in the middle, and shrink to 0.85 when on the sides
      let scale = 1.15 - (distanceFromCenter / maxDistance) * 0.35;
      scale = Math.max(0.85, Math.min(1.15, scale));
      
      // Images fade out slightly on the edges for a cinematic vignette effect
      let opacity = 1 - (distanceFromCenter / maxDistance) * 0.5;
      opacity = Math.max(0.3, Math.min(1, opacity));

      item.style.transform = `scale(${scale})`;
      item.style.opacity = opacity;
    });

    requestAnimationFrame(animateCarousel);
  }

  // Kick off the loop
  requestAnimationFrame(animateCarousel);
})();

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
