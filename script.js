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

      slide.style.transform = `translate(-50%, -50%) translateX(${x}px) rotateY(${rotateY}deg) scale(${scale})`;
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
    const cursorShadow = document.createElement('div');
    cursorShadow.className = 'cursor-shadow';
    document.body.appendChild(cursorShadow);

    window.addEventListener('mousemove', (e) => {
        document.documentElement.style.setProperty('--cursor-x', `${e.clientX}px`);
        document.documentElement.style.setProperty('--cursor-y', `${e.clientY}px`);
    });
});

/* ==========================================================
   PARALLAX ORBITING TAGS (NEW HERO)
   ========================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const tags = document.querySelectorAll('.tag');
    
    // We attach the mousemove listener to the entire document/window 
    // so the tags track perfectly wherever your mouse goes on the hero background!
    document.addEventListener('mousemove', (e) => {
        const xAxis = (window.innerWidth / 2 - e.clientX) / 50;
        const yAxis = (window.innerHeight / 2 - e.clientY) / 50;
        
        tags.forEach((tag, index) => {
            const speed = (index + 1) * 0.4;
            tag.style.transform = `translate(${xAxis * speed}px, ${yAxis * speed}px)`;
        });
    });
});

/* ==========================================================
   SCROLL SPY FOR NAVIGATION LINKS
   ========================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.site-header__nav a, .mobile-menu a');

  const observerOptions = {
    root: null,
    rootMargin: '-50% 0px -50% 0px', 
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        
        navLinks.forEach(link => link.classList.remove('active'));
        
        const activeLinks = document.querySelectorAll(`.site-header__nav a[href="#${id}"], .mobile-menu a[href="#${id}"]`);
        activeLinks.forEach(link => link.classList.add('active'));
      }
    });
  }, observerOptions);

  sections.forEach(section => {
    observer.observe(section);
  });
});

