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
   HERO REVEAL PHYSICS (APPEND TO BOTTOM)
   ========================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const headlines = document.querySelectorAll('.hero__headline');
    
    headlines.forEach(headline => {
        const walker = document.createTreeWalker(headline, NodeFilter.SHOW_TEXT, null, false);
        const textNodes = [];
        while(walker.nextNode()) textNodes.push(walker.currentNode);
        
        textNodes.forEach(node => {
            const text = node.nodeValue;
            const fragment = document.createDocumentFragment();
            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                if (char.trim() === '') {
                    fragment.appendChild(document.createTextNode(char));
                } else {
                    const span = document.createElement('span');
                    span.className = 'char';
                    span.textContent = char;
                    fragment.appendChild(span);
                }
            }
            node.parentNode.replaceChild(fragment, node);
        });
    });

    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let smoothMouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let vel = { x: 0, y: 0 };
    const tension = 0.08;
    const friction = 0.8;

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    let chars = [];
    
    function initChars() {
        const charElements = document.querySelectorAll('.char');
        charElements.forEach(el => el.style.transform = 'none');
        
        chars = [];
        charElements.forEach(charEl => {
            const rect = charEl.getBoundingClientRect();
            const headline = charEl.closest('.hero__headline');
            const layer = headline.dataset.layer || 'base';
            
            let strength = 0.15;
            if (layer === 'mid') strength = 0.35;
            if (layer === 'top') strength = 0.6;
            
            chars.push({
                el: charEl,
                originX: rect.left + rect.width / 2,
                originY: rect.top + rect.height / 2 + window.scrollY,
                x: 0, 
                y: 0,
                velX: 0,
                velY: 0,
                strength: strength
            });
        });
    }

    setTimeout(initChars, 100);
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(initChars, 150);
    });

    const hero = document.querySelector('.hero');

    function animate() {
        vel.x += (mouse.x - smoothMouse.x) * tension;
        vel.y += (mouse.y - smoothMouse.y) * tension;
        vel.x *= friction;
        vel.y *= friction;
        smoothMouse.x += vel.x;
        smoothMouse.y += vel.y;

        if (hero) {
            const heroRect = hero.getBoundingClientRect();
            const maskX = smoothMouse.x - heroRect.left;
            const maskY = smoothMouse.y - heroRect.top;
            document.documentElement.style.setProperty('--mask-x', `${maskX}px`);
            document.documentElement.style.setProperty('--mask-y', `${maskY}px`);
        }

        document.documentElement.style.setProperty('--cursor-x', `${mouse.x}px`);
        document.documentElement.style.setProperty('--cursor-y', `${mouse.y}px`);

        const docMouseY = smoothMouse.y + window.scrollY;
        const maxDistance = 300;
        
        chars.forEach(char => {
            const dx = smoothMouse.x - char.originX;
            const dy = docMouseY - char.originY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            let targetX = 0;
            let targetY = 0;
            
            if (dist < maxDistance) {
                const pull = Math.pow((maxDistance - dist) / maxDistance, 2); 
                targetX = dx * pull * char.strength;
                targetY = dy * pull * char.strength;
            }
            
            char.velX += (targetX - char.x) * 0.15;
            char.velY += (targetY - char.y) * 0.15;
            char.velX *= 0.75;
            char.velY *= 0.75;
            
            char.x += char.velX;
            char.y += char.velY;
            
            char.el.style.transform = `translate3d(${char.x}px, ${char.y}px, 0)`;
        });

        requestAnimationFrame(animate);
    }
    
    animate();
});
