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
  
  document.addEventListener('mousemove', (e) => {
    let isHovering = false;
    let speed = 0;

    fullbleedSections.forEach(section => {
      const rect = section.getBoundingClientRect();
      // Add a generous buffer zone around the text area
      if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top - 50 && e.clientY <= rect.bottom + 50) {
        isHovering = true;
        // Calculate distance from center for variable distortion
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dist = Math.sqrt(Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2));
        speed = Math.min(dist * 0.05, 15);
      }
    });
    
    // Scale jumps up based on movement and settles back quickly
    targetScale = isHovering ? 15 + speed : 0;
  });
  
  function animateWave() {
    currentScale += (targetScale - currentScale) * 0.1;
    
    // Animate the noise phase/seed to make it look like a rolling wave
    seed += 0.05;
    turbulence.setAttribute("seed", Math.floor(seed));
    
    // Slightly shift the frequency over time for breathing effect
    const time = performance.now() * 0.0005;
    turbulence.setAttribute("baseFrequency", `${0.01 + Math.sin(time)*0.002} ${0.02 + Math.cos(time)*0.005}`);

    if (currentScale > 0.1) {
      displacement.setAttribute("scale", currentScale.toFixed(2));
    } else {
      displacement.setAttribute("scale", "0");
    }
    
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

