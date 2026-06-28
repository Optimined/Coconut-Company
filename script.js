/* =========================================================
   Golden Coconut Shell — interactions
   ========================================================= */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- Year ---------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Sticky nav + scroll progress ---------- */
  const nav = $("#nav");
  const progress = $("#scrollProgress");

  function onScroll() {
    const y = window.scrollY || window.pageYOffset;
    if (nav) nav.classList.toggle("is-stuck", y > 24);

    if (progress) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const pct = h > 0 ? (y / h) * 100 : 0;
      progress.style.width = pct + "%";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const toggle = $("#navToggle");
  const links = $("#navLinks");
  if (toggle && links) {
    const setOpen = (open) => {
      links.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    };
    toggle.addEventListener("click", () =>
      setOpen(toggle.getAttribute("aria-expanded") !== "true")
    );
    links.addEventListener("click", (e) => {
      if (e.target.closest("a")) setOpen(false);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window && !prefersReduced) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Animated number counters ---------- */
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  function animateCount(el) {
    const target = parseFloat(el.dataset.count || "0");
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const decimals = (el.dataset.count || "").includes(".") ? 1 : 0;
    const duration = 1400;
    let start = null;

    if (prefersReduced) {
      el.textContent = prefix + target.toFixed(decimals) + suffix;
      return;
    }

    function frame(ts) {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const val = target * easeOutCubic(p);
      el.textContent = prefix + val.toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = prefix + target.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(frame);
  }

  const numEls = $$(".num[data-count]");
  if ("IntersectionObserver" in window) {
    const numIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            numIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    numEls.forEach((el) => numIO.observe(el));
  } else {
    numEls.forEach((el) => animateCount(el));
  }

  /* ---------- Spec rings ---------- */
  const rings = $$(".spec__ring");
  if ("IntersectionObserver" in window) {
    const ringIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const ring = entry.target;
          const value = parseFloat(ring.dataset.value || "0");
          const max = parseFloat(ring.dataset.max || "100");
          const bar = ring.querySelector(".bar");
          const circumference = 327; // 2πr, r=52
          const fraction = Math.min(value / max, 1);
          if (bar) {
            requestAnimationFrame(() => {
              bar.style.strokeDashoffset = String(circumference * (1 - fraction));
            });
          }
          ringIO.unobserve(ring);
        });
      },
      { threshold: 0.5 }
    );
    rings.forEach((r) => ringIO.observe(r));
  } else {
    rings.forEach((ring) => {
      const value = parseFloat(ring.dataset.value || "0");
      const max = parseFloat(ring.dataset.max || "100");
      const bar = ring.querySelector(".bar");
      if (bar) bar.style.strokeDashoffset = String(327 * (1 - Math.min(value / max, 1)));
    });
  }

  /* ---------- Optional background images (graceful) ---------- */
  // If a real photo exists at the data-img path, use it; otherwise keep the fallback.
  $$("[data-img]").forEach((el) => {
    const src = el.getAttribute("data-img");
    if (!src) return;
    const img = new Image();
    img.onload = () => {
      el.style.backgroundImage =
        `linear-gradient(160deg, rgba(11,18,34,.15), rgba(11,18,34,.55)), url("${src}")`;
      el.classList.add("has-img");
      const fb = el.querySelector(".split__media-fallback");
      if (fb) fb.style.display = "none";
    };
    img.src = src;
  });

  /* ---------- Hero particle field (carbon dust) ---------- */
  const canvas = $("#heroCanvas");
  if (canvas && !prefersReduced) {
    const ctx = canvas.getContext("2d");
    let w, h, dpr, particles, raf;
    const COUNT = window.innerWidth < 720 ? 36 : 70;
    const LINK_DIST = 130;
    const mouse = { x: -9999, y: -9999 };

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const PALETTE = ["246, 211, 101", "37, 211, 192", "255, 157, 104"]; // gold, lagoon, mango
    function makeParticles() {
      particles = Array.from({ length: COUNT }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.8 + 0.6,
        c: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      }));
    }

    function step() {
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        // gentle attraction to cursor
        const dxm = mouse.x - p.x;
        const dym = mouse.y - p.y;
        const dm = Math.hypot(dxm, dym);
        if (dm < 160) {
          p.x += dxm * 0.0009 * (160 - dm) / 160;
          p.y += dym * 0.0009 * (160 - dm) / 160;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.c}, 0.6)`;
        ctx.fill();
      }

      // links
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK_DIST) {
            const alpha = (1 - dist / LINK_DIST) * 0.2;
            ctx.strokeStyle = `rgba(110, 200, 180, ${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(step);
    }

    function start() {
      resize();
      makeParticles();
      cancelAnimationFrame(raf);
      step();
    }

    window.addEventListener("resize", () => {
      cancelAnimationFrame(raf);
      start();
    });
    canvas.addEventListener("pointermove", (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    canvas.addEventListener("pointerleave", () => {
      mouse.x = -9999;
      mouse.y = -9999;
    });

    // Pause when hero off-screen for performance
    const hero = $(".hero");
    if (hero && "IntersectionObserver" in window) {
      const heroIO = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) step();
          else cancelAnimationFrame(raf);
        });
      }, { threshold: 0 });
      heroIO.observe(hero);
    }

    start();
  }

  /* ---------- Active nav link highlight + side-rail dots ---------- */
  const sections = $$("main section[id]");
  const navAnchors = $$(".nav__links a");
  const railAnchors = $$("#rail a");
  if (sections.length && "IntersectionObserver" in window) {
    const navMap = new Map(navAnchors.map((a) => [a.getAttribute("href"), a]));
    const railMap = new Map(railAnchors.map((a) => [a.getAttribute("href"), a]));
    const spyIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const href = "#" + entry.target.id;
            navAnchors.forEach((a) => a.classList.remove("is-active"));
            const navLink = navMap.get(href);
            if (navLink) navLink.classList.add("is-active");

            railAnchors.forEach((a) => a.classList.remove("is-active"));
            const railLink = railMap.get(href);
            if (railLink) railLink.classList.add("is-active");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => spyIO.observe(s));
    // also observe the hero (#home) for the rail
    const home = $("#home");
    if (home) spyIO.observe(home);
  }

  /* ---------- Preloader ---------- */
  const preloader = $("#preloader");
  if (preloader) {
    const dismiss = () => preloader.classList.add("is-done");
    window.addEventListener("load", () => setTimeout(dismiss, 1500));
    // safety: never trap the user behind the loader
    setTimeout(dismiss, 3500);
  }

  /* ---------- Side-rail show after hero ---------- */
  const rail = $("#rail");
  const toTop = $("#toTop");
  function onScrollUI() {
    const y = window.scrollY || window.pageYOffset;
    if (rail) rail.classList.toggle("is-on", y > window.innerHeight * 0.6);
    if (toTop) toTop.classList.toggle("is-on", y > window.innerHeight * 0.9);
  }
  window.addEventListener("scroll", onScrollUI, { passive: true });
  onScrollUI();

  if (toTop) {
    toTop.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" })
    );
  }

  /* ---------- Custom cursor ---------- */
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const cursor = $("#cursor");
  const cursorDot = $("#cursorDot");
  if (cursor && cursorDot && finePointer && !prefersReduced) {
    document.documentElement.classList.add("has-cursor");
    let cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    let dx = cx, dy = cy;

    window.addEventListener("pointermove", (e) => {
      cx = e.clientX; cy = e.clientY;
      cursorDot.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    }, { passive: true });

    (function ring() {
      dx += (cx - dx) * 0.18;
      dy += (cy - dy) * 0.18;
      cursor.style.transform = `translate(${dx}px, ${dy}px) translate(-50%, -50%)`;
      requestAnimationFrame(ring);
    })();

    const hot = "a, button, [data-tilt], .app, .feature, .spec, .partner, input, textarea";
    document.addEventListener("pointerover", (e) => {
      if (e.target.closest(hot)) cursor.classList.add("is-hot");
    });
    document.addEventListener("pointerout", (e) => {
      if (e.target.closest(hot)) cursor.classList.remove("is-hot");
    });
    document.addEventListener("pointerdown", () => cursor.classList.add("is-hot"));
    document.addEventListener("pointerup", () => cursor.classList.remove("is-hot"));
  }

  /* ---------- 3D tilt on cards ---------- */
  if (finePointer && !prefersReduced) {
    const tiltSelector = ".entity-card, .app, .pillar, .partner, .spec, .step__card, .contact__card";
    const tiltEls = $$(tiltSelector);
    const MAX = 7; // degrees
    tiltEls.forEach((el) => {
      el.setAttribute("data-tilt", "");
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform =
          `perspective(900px) rotateX(${(-py * MAX).toFixed(2)}deg) rotateY(${(px * MAX).toFixed(2)}deg) translateY(-6px)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
  }

  /* ---------- Magnetic buttons ---------- */
  if (finePointer && !prefersReduced) {
    $$(".btn, .nav__cta, .to-top").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        const mx = e.clientX - r.left - r.width / 2;
        const my = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${mx * 0.25}px, ${my * 0.35}px)`;
      });
      btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
    });
  }

  /* ---------- Parallax (palms / decorations) ---------- */
  const parallaxEls = $$("[data-parallax]");
  if (parallaxEls.length && !prefersReduced) {
    let ticking = false;
    const update = () => {
      const vy = window.scrollY || window.pageYOffset;
      parallaxEls.forEach((el) => {
        const speed = parseFloat(el.dataset.parallax) || 0;
        const base = el.dataset.baseTransform || "";
        el.style.transform = `${base} translate3d(0, ${(-vy * speed).toFixed(1)}px, 0)`;
      });
      ticking = false;
    };
    // preserve any rotation set via inline style/class
    parallaxEls.forEach((el) => {
      const t = getComputedStyle(el).transform;
      el.dataset.baseTransform = t && t !== "none" ? t : "";
    });
    window.addEventListener("scroll", () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }
})();
