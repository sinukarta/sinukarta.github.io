/* ============================================================
   SINUKARTA PORTFOLIO — Interactions & Animations
   Dyan Raditya Sinukarta — sinukarta.github.io
   ============================================================ */

(function () {
  'use strict';

  // ─── Page Loader ───
  window.addEventListener('load', () => {
    const loader = document.querySelector('.page-loader');
    setTimeout(() => {
      loader.classList.add('loaded');
    }, 1600);
  });

  // ─── Particle Canvas ───
  class ParticleField {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.particles = [];
      this.mouse = { x: -1000, y: -1000 };
      this.particleCount = window.innerWidth < 768 ? 40 : 80;
      this.connectionDistance = 120;
      this.mouseRadius = 150;

      this.resize();
      this.init();
      this.bindEvents();
      this.animate();
    }

    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    init() {
      this.particles = [];
      for (let i = 0; i < this.particleCount; i++) {
        this.particles.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.5 + 0.1,
        });
      }
    }

    bindEvents() {
      window.addEventListener('resize', () => {
        this.resize();
        this.init();
      });

      document.addEventListener('mousemove', (e) => {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
      });

      document.addEventListener('mouseleave', () => {
        this.mouse.x = -1000;
        this.mouse.y = -1000;
      });
    }

    animate() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Boundaries
        if (p.x < 0) p.x = this.canvas.width;
        if (p.x > this.canvas.width) p.x = 0;
        if (p.y < 0) p.y = this.canvas.height;
        if (p.y > this.canvas.height) p.y = 0;

        // Mouse interaction
        const dx = this.mouse.x - p.x;
        const dy = this.mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.mouseRadius) {
          const force = (this.mouseRadius - dist) / this.mouseRadius;
          p.x -= dx * force * 0.02;
          p.y -= dy * force * 0.02;
        }

        // Draw particle
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(0, 212, 170, ${p.opacity})`;
        this.ctx.fill();

        // Connect particles
        for (let j = i + 1; j < this.particles.length; j++) {
          const p2 = this.particles[j];
          const cx = p.x - p2.x;
          const cy = p.y - p2.y;
          const cdist = Math.sqrt(cx * cx + cy * cy);

          if (cdist < this.connectionDistance) {
            const alpha = (1 - cdist / this.connectionDistance) * 0.15;
            this.ctx.beginPath();
            this.ctx.moveTo(p.x, p.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.strokeStyle = `rgba(0, 212, 170, ${alpha})`;
            this.ctx.lineWidth = 0.5;
            this.ctx.stroke();
          }
        }
      }

      requestAnimationFrame(() => this.animate());
    }
  }

  // ─── Custom Cursor ───
  class CustomCursor {
    constructor() {
      if (window.innerWidth < 768) return;

      this.dot = document.querySelector('.cursor-dot');
      this.ring = document.querySelector('.cursor-ring');
      if (!this.dot || !this.ring) return;

      this.pos = { x: 0, y: 0 };
      this.target = { x: 0, y: 0 };

      document.addEventListener('mousemove', (e) => {
        this.target.x = e.clientX;
        this.target.y = e.clientY;
      });

      // Hover detection
      const hoverElements = document.querySelectorAll('a, button, .project-card, .expertise-card, .tech-item');
      hoverElements.forEach((el) => {
        el.addEventListener('mouseenter', () => this.ring.classList.add('hovering'));
        el.addEventListener('mouseleave', () => this.ring.classList.remove('hovering'));
      });

      this.render();
    }

    render() {
      this.pos.x += (this.target.x - this.pos.x) * 0.15;
      this.pos.y += (this.target.y - this.pos.y) * 0.15;

      if (this.dot) {
        this.dot.style.left = `${this.target.x}px`;
        this.dot.style.top = `${this.target.y}px`;
      }
      if (this.ring) {
        this.ring.style.left = `${this.pos.x}px`;
        this.ring.style.top = `${this.pos.y}px`;
      }

      requestAnimationFrame(() => this.render());
    }
  }

  // ─── Scroll Reveal Observer ───
  class ScrollReveal {
    constructor() {
      this.elements = document.querySelectorAll('.reveal, .reveal-left');

      const options = {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.15,
      };

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            this.observer.unobserve(entry.target);
          }
        });
      }, options);

      this.elements.forEach((el) => this.observer.observe(el));
    }
  }

  // ─── Floating Nav Controller ───
  class FloatingNav {
    constructor() {
      this.nav = document.querySelector('.floating-nav');
      this.links = document.querySelectorAll('.nav-link');
      this.sections = document.querySelectorAll('.section[id]');
      this.lastScrollY = window.scrollY;
      this.ticking = false;

      window.addEventListener('scroll', () => {
        if (!this.ticking) {
          requestAnimationFrame(() => {
            this.onScroll();
            this.ticking = false;
          });
          this.ticking = true;
        }
      });

      // Smooth scroll
      this.links.forEach((link) => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const targetId = link.getAttribute('href').replace('#', '');
          const targetSection = document.getElementById(targetId);
          if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      });
    }

    onScroll() {
      const currentScrollY = window.scrollY;

      // Show/hide nav
      if (currentScrollY < 100) {
        this.nav.classList.remove('hidden');
      } else if (currentScrollY > this.lastScrollY + 5) {
        this.nav.classList.add('hidden');
      } else if (currentScrollY < this.lastScrollY - 5) {
        this.nav.classList.remove('hidden');
      }

      this.lastScrollY = currentScrollY;

      // Active section detection
      let currentSection = '';
      this.sections.forEach((section) => {
        const sectionTop = section.offsetTop - 200;
        if (currentScrollY >= sectionTop) {
          currentSection = section.getAttribute('id');
        }
      });

      this.links.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
          link.classList.add('active');
        }
      });
    }
  }

  // ─── Count-Up Animation ───
  class CountUp {
    constructor() {
      this.elements = document.querySelectorAll('[data-count]');

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.animateCount(entry.target);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );

      this.elements.forEach((el) => observer.observe(el));
    }

    animateCount(el) {
      const target = parseInt(el.getAttribute('data-count'));
      const suffix = el.getAttribute('data-suffix') || '';
      const duration = 2000;
      const start = performance.now();

      const update = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4); // ease-out quart
        const current = Math.floor(eased * target);
        el.textContent = current + suffix;
        if (progress < 1) requestAnimationFrame(update);
      };

      requestAnimationFrame(update);
    }
  }

  // ─── Project Card Mouse Tracking ───
  class CardMouseTracking {
    constructor() {
      const cards = document.querySelectorAll('.project-card');
      cards.forEach((card) => {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          card.style.setProperty('--mouse-x', `${x}%`);
          card.style.setProperty('--mouse-y', `${y}%`);
        });
      });
    }
  }

  // ─── Live Time Display ───
  class LiveTime {
    constructor() {
      this.el = document.getElementById('live-time');
      if (!this.el) return;
      this.update();
      setInterval(() => this.update(), 1000);
    }

    update() {
      const now = new Date();
      const options = {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };
      this.el.textContent = now.toLocaleTimeString('en-GB', options) + ' WIB';
    }
  }

  // ─── Initialize Everything ───
  document.addEventListener('DOMContentLoaded', () => {
    // Particle Canvas
    const canvas = document.getElementById('particle-canvas');
    if (canvas) new ParticleField(canvas);

    // Custom Cursor
    new CustomCursor();

    // Scroll Reveal
    new ScrollReveal();

    // Floating Nav
    new FloatingNav();

    // Count Up
    new CountUp();

    // Card Mouse Tracking
    new CardMouseTracking();

    // Live Time
    new LiveTime();
  });
})();
