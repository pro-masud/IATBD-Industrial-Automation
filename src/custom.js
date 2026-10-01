(() => {
  const root = document.documentElement;
  const savedTheme = localStorage.getItem("iatbd-theme");

  if (
    savedTheme === "dark" ||
    (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    root.classList.add("dark");
  }

  document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
      const updateThemeControl = () => {
        const isDark = root.classList.contains("dark");
        themeToggle.setAttribute("aria-pressed", String(isDark));
        themeToggle.setAttribute(
          "aria-label",
          isDark ? "Switch to light mode" : "Switch to dark mode",
        );
      };

      updateThemeControl();
      themeToggle.addEventListener("click", () => {
        const isDark = root.classList.toggle("dark");
        localStorage.setItem("iatbd-theme", isDark ? "dark" : "light");
        updateThemeControl();
      });
    }

    const menuButton = document.getElementById("mobile-menu-btn");
    const mobileMenu = document.getElementById("mobile-menu");
    const closeMobileMenu = () => {
      if (!menuButton || !mobileMenu) return;
      mobileMenu.classList.add("hidden");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.querySelector("i")?.classList.add("fa-bars");
      menuButton.querySelector("i")?.classList.remove("fa-times");
    };

    if (menuButton && mobileMenu) {
      menuButton.addEventListener("click", () => {
        const isExpanded = menuButton.getAttribute("aria-expanded") !== "true";
        mobileMenu.classList.toggle("hidden", !isExpanded);
        menuButton.setAttribute("aria-expanded", String(isExpanded));
        menuButton.querySelector("i")?.classList.toggle("fa-bars", !isExpanded);
        menuButton.querySelector("i")?.classList.toggle("fa-times", isExpanded);
      });
    }

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;

      link.addEventListener("click", (event) => {
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        closeMobileMenu();
      });
    });

    document.querySelectorAll(".faq-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const item = button.closest(".faq-item");
        const wasOpen = item.classList.contains("open");
        document
          .querySelectorAll(".faq-item")
          .forEach((faqItem) => faqItem.classList.remove("open"));
        if (!wasOpen) item.classList.add("open");
      });
    });

    initHeroSlider({
      containerSelector: ".servo-hero",
      slideSelector: ".servo-slide",
      dotSelector: ".servo-dot",
      dataKey: "i",
      interval: 5000,
      previousSelector: ".hero-arrow.prev",
      nextSelector: ".hero-arrow.next",
    });
    initHeroSlider({
      containerSelector: ".plc-hero-slider",
      slideSelector: ".plc-hero-slide",
      dotSelector: ".plc-hero-dot",
      dataKey: "index",
      interval: 4500,
    });
    initCounters();
    initTestimonials();
  });

  function initHeroSlider({
    containerSelector,
    slideSelector,
    dotSelector,
    dataKey,
    interval,
    previousSelector,
    nextSelector,
  }) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const slides = [...container.querySelectorAll(slideSelector)];
    const dots = [...container.querySelectorAll(dotSelector)];
    if (!slides.length) return;

    let currentIndex = 0;
    let timer;
    const show = (index) => {
      currentIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("active", slideIndex === currentIndex);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("active", dotIndex === currentIndex);
      });
    };
    const stop = () => clearInterval(timer);
    const start = () => {
      stop();
      timer = setInterval(() => show(currentIndex + 1), interval);
    };

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const index = Number(dot.dataset[dataKey]);
        show(Number.isNaN(index) ? 0 : index);
        start();
      });
    });

    const previousButton = previousSelector
      ? document.querySelector(previousSelector)
      : null;
    const nextButton = nextSelector
      ? document.querySelector(nextSelector)
      : null;
    previousButton?.addEventListener("click", () => {
      show(currentIndex - 1);
      start();
    });
    nextButton?.addEventListener("click", () => {
      show(currentIndex + 1);
      start();
    });
    container.addEventListener("mouseenter", stop);
    container.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initCounters() {
    const counters = [...document.querySelectorAll(".counter")];
    const firstCounter = document.querySelector(".count-box");
    if (
      !counters.length ||
      !firstCounter ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }

    let started = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting) || started) return;
        started = true;
        observer.disconnect();
        counters.forEach((counter) => {
          const target = Number(counter.dataset.target);
          const suffix = counter.dataset.suffix || "";
          const startTime = performance.now();
          const duration = 1600;
          const tick = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            counter.textContent = `${Math.floor(eased * target)}${suffix}`;
            if (progress < 1) requestAnimationFrame(tick);
            else counter.textContent = `${target}${suffix}`;
          };
          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.3 },
    );
    observer.observe(firstCounter);
  }

  function initTestimonials() {
    const track = document.getElementById("testimonial-track");
    const dotsWrap = document.getElementById("testimonial-dots");
    if (!track || !dotsWrap) return;

    const total = track.querySelectorAll(".testimonial-card").length;
    const isPlcPage = Boolean(document.querySelector(".plc-hero-slider"));
    let index = 0;
    let timer;
    const perView = () => (window.innerWidth >= 768 ? 3 : 1);
    const maxIndex = () => Math.max(0, total - perView());

    const buildDots = () => {
      dotsWrap.innerHTML = "";
      for (let dotIndex = 0; dotIndex <= maxIndex(); dotIndex += 1) {
        const dot = document.createElement("button");
        dot.setAttribute("aria-label", `Page ${dotIndex + 1}`);
        if (isPlcPage) {
          dot.className =
            "w-2.5 h-2.5 rounded-full transition " +
            (dotIndex === index
              ? "bg-primary-500 scale-125"
              : "bg-slate-300 dark:bg-slate-600");
        } else {
          dot.className =
            "h-2 rounded-full transition-all " +
            (dotIndex === index
              ? "w-6 bg-primary-500"
              : "w-2 bg-slate-300 dark:bg-slate-600");
        }
        dot.addEventListener("click", () => {
          index = dotIndex;
          update();
          start();
        });
        dotsWrap.appendChild(dot);
      }
    };

    const update = () => {
      if (index > maxIndex()) index = 0;
      track.style.transform = `translateX(-${(100 / perView()) * index}%)`;
      buildDots();
    };
    const next = () => {
      index = index >= maxIndex() ? 0 : index + 1;
      update();
    };
    const start = () => {
      clearInterval(timer);
      timer = setInterval(next, 2000);
    };

    window.addEventListener("resize", update);
    update();
    start();

    const viewport = document.getElementById("testimonial-viewport");
    viewport?.addEventListener("mouseenter", () => clearInterval(timer));
    viewport?.addEventListener("mouseleave", start);
  }
})();
