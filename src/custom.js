(() => {
  const root = document.documentElement;
  const THEME_KEY = "iatbd-theme";

  // Default theme is DARK. Light mode only when the visitor chose it
  // with the header toggle (saved in localStorage).
  let savedTheme = null;
  try {
    savedTheme = localStorage.getItem(THEME_KEY);
  } catch {
    savedTheme = null;
  }
  root.classList.toggle("dark", savedTheme !== "light");

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
        try {
          localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
        } catch {
          /* storage unavailable: theme still switches for this visit */
        }
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
      let target = null;
      try {
        target = document.querySelector(href);
      } catch {
        return;
      }
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
        if (!item) return;
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
    initHeroSlider({
      containerSelector: ".repair-hero",
      slideSelector: ".repair-slide",
      dotSelector: ".repair-dot",
      dataKey: "i",
      interval: 5500,
    });
    initHeroSlider({
      containerSelector: ".maintenance-hero",
      slideSelector: ".maintenance-slide",
      dotSelector: ".maintenance-dot",
      dataKey: "i",
      interval: 5500,
    });
    initHeroSlider({
      containerSelector: ".troubleshoot-hero",
      slideSelector: ".troubleshoot-slide",
      dotSelector: ".troubleshoot-dot",
      dataKey: "i",
      interval: 5500,
    });
    initHeroSlider({
      containerSelector: ".vfd-hero",
      slideSelector: ".vfd-slide",
      dotSelector: ".vfd-dot",
      dataKey: "i",
      interval: 5000,
    });
    initHeroSlider({
      containerSelector: ".hmi-hero",
      slideSelector: ".hmi-slide",
      dotSelector: ".hmi-dot",
      dataKey: "slideTo",
      interval: 5000,
    });
    initCounters();
    initTestimonials();
    initStoreShop();
    initBlogPagination();
    initContactForm();
    initBlogSingle();
  });

  function initStoreShop() {
    const store = document.querySelector("[data-store-shop]");
    if (!store) return;

    const products = [...store.querySelectorAll(".store-product-card")];
    const search = store.querySelector("#store-search");
    const categoryButtons = [...store.querySelectorAll(".store-category-btn")];
    const sortSelect = store.querySelector("#store-sort");
    const minPrice = store.querySelector("#store-price-min");
    const maxPrice = store.querySelector("#store-price-max");
    const resultCount = store.querySelector("#store-result-count");
    const cartCount = document.getElementById("store-cart-count");
    const cartItems = document.getElementById("store-cart-items");
    const cartTotal = document.getElementById("store-cart-total");
    const drawer = document.getElementById("store-cart-drawer");
    const overlay = document.getElementById("store-cart-overlay");
    const checkout = document.getElementById("store-checkout");
    const formatPrice = (price) => `৳ ${Number(price).toLocaleString("en-IN")}`;
    let activeCategory = "all";
    let cart = [];

    try {
      const savedCart = JSON.parse(
        localStorage.getItem("iatbd-store-cart") || "[]",
      );
      if (Array.isArray(savedCart))
        cart = savedCart.filter(
          (item) =>
            item &&
            typeof item.id === "string" &&
            Number(item.price) > 0 &&
            Number(item.quantity) > 0,
        );
    } catch {
      cart = [];
    }

    const updateProducts = () => {
      const query = (search?.value || "").trim().toLowerCase();
      const lowerPrice = Number(minPrice?.value || 1000);
      const upperPrice = Number(maxPrice?.value || 200000);
      const visibleProducts = products.filter((product) => {
        const matchesCategory =
          activeCategory === "all" || product.dataset.cat === activeCategory;
        const matchesQuery =
          `${product.dataset.name} ${product.dataset.brand} ${product.dataset.cat}`
            .toLowerCase()
            .includes(query);
        const price = Number(product.dataset.price);
        const matchesPrice = price >= lowerPrice && price <= upperPrice;
        const visible = matchesCategory && matchesQuery && matchesPrice;
        product.classList.toggle("hidden-by-filter", !visible);
        return visible;
      });

      const sort = sortSelect?.value;
      visibleProducts.sort((first, second) => {
        if (sort === "price-asc")
          return Number(first.dataset.price) - Number(second.dataset.price);
        if (sort === "price-desc")
          return Number(second.dataset.price) - Number(first.dataset.price);
        if (sort === "name")
          return first.dataset.name.localeCompare(second.dataset.name);
        return Number(first.dataset.order) - Number(second.dataset.order);
      });
      visibleProducts.forEach((product) =>
        product.parentElement.appendChild(product),
      );
      if (resultCount)
        resultCount.textContent = `${visibleProducts.length} products`;
      store
        .querySelector("#store-empty-state")
        ?.classList.toggle("hidden", visibleProducts.length > 0);
    };

    const renderCart = () => {
      const quantity = cart.reduce((total, item) => total + item.quantity, 0);
      const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      if (cartCount) {
        cartCount.textContent = String(quantity);
        cartCount.classList.toggle("is-visible", quantity > 0);
      }
      if (cartTotal) cartTotal.textContent = formatPrice(total);
      if (cartItems) {
        cartItems.replaceChildren();
        if (!cart.length) {
          const empty = document.createElement("p");
          empty.className =
            "py-10 text-center text-sm text-slate-500 dark:text-slate-400";
          empty.textContent = "Your cart is empty.";
          cartItems.appendChild(empty);
        }
        cart.forEach((item) => {
          const row = document.createElement("div");
          row.className =
            "flex gap-3 border-b border-slate-200 dark:border-slate-700 py-4";
          const image = document.createElement("img");
          image.src = item.image;
          image.alt = "";
          image.className = "w-16 h-16 rounded-lg object-cover bg-slate-100";
          const details = document.createElement("div");
          details.className = "min-w-0 flex-1";
          const title = document.createElement("p");
          title.className =
            "font-semibold text-sm text-slate-900 dark:text-white";
          title.textContent = item.title;
          const price = document.createElement("p");
          price.className =
            "text-sm text-primary-600 dark:text-primary-400 mt-1";
          price.textContent = `${formatPrice(item.price)} · Qty ${item.quantity}`;
          const remove = document.createElement("button");
          remove.type = "button";
          remove.className = "text-xs text-red-600 hover:text-red-700 mt-2";
          remove.dataset.removeCart = item.id;
          remove.textContent = "Remove";
          details.append(title, price, remove);
          row.append(image, details);
          cartItems.appendChild(row);
        });
      }
      if (checkout) {
        const message = cart
          .map(
            (item) =>
              `${item.title} x ${item.quantity} = ${formatPrice(item.price * item.quantity)}`,
          )
          .join("\n");
        checkout.href = `mailto:info@iatbd.com?subject=${encodeURIComponent("IATBD Store Order")}&body=${encodeURIComponent(`${message}\n\nTotal: ${formatPrice(total)}\nPayment: Cash on Delivery`)}`;
        checkout.setAttribute("aria-disabled", String(cart.length === 0));
        checkout.classList.toggle("pointer-events-none", cart.length === 0);
        checkout.classList.toggle("opacity-50", cart.length === 0);
      }
      localStorage.setItem("iatbd-store-cart", JSON.stringify(cart));
    };

    const setCartOpen = (isOpen) => {
      drawer?.classList.toggle("open", isOpen);
      overlay?.classList.toggle("open", isOpen);
      overlay?.setAttribute("aria-hidden", String(!isOpen));
      document.body.classList.toggle("overflow-hidden", isOpen);
    };

    search?.addEventListener("input", updateProducts);
    sortSelect?.addEventListener("change", updateProducts);
    minPrice?.addEventListener("input", () => {
      if (Number(minPrice.value) > Number(maxPrice.value))
        maxPrice.value = minPrice.value;
      store.querySelector("#store-min-label").textContent = formatPrice(
        minPrice.value,
      );
      updateProducts();
    });
    maxPrice?.addEventListener("input", () => {
      if (Number(maxPrice.value) < Number(minPrice.value))
        minPrice.value = maxPrice.value;
      store.querySelector("#store-max-label").textContent = formatPrice(
        maxPrice.value,
      );
      updateProducts();
    });
    categoryButtons.forEach((button) => {
      button.addEventListener("click", () => {
        activeCategory = button.dataset.category;
        categoryButtons.forEach((categoryButton) => {
          const isActive = categoryButton === button;
          categoryButton.classList.toggle("active", isActive);
          categoryButton.setAttribute("aria-pressed", String(isActive));
        });
        updateProducts();
      });
    });
    store.querySelectorAll(".store-add-cart").forEach((button) => {
      button.addEventListener("click", () => {
        const existing = cart.find((item) => item.id === button.dataset.id);
        if (existing) existing.quantity += 1;
        else
          cart.push({
            id: button.dataset.id,
            title: button.dataset.title,
            price: Number(button.dataset.price),
            image: button.dataset.image,
            quantity: 1,
          });
        renderCart();
      });
    });
    cartItems?.addEventListener("click", (event) => {
      const removeButton = event.target.closest("[data-remove-cart]");
      if (!removeButton) return;
      cart = cart.filter((item) => item.id !== removeButton.dataset.removeCart);
      renderCart();
    });
    document
      .getElementById("store-cart-button")
      ?.addEventListener("click", () => setCartOpen(true));
    document
      .getElementById("store-cart-close")
      ?.addEventListener("click", () => setCartOpen(false));
    overlay?.addEventListener("click", () => setCartOpen(false));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setCartOpen(false);
    });

    const slides = [...store.querySelectorAll(".store-hero-slide")];
    const dots = [...store.querySelectorAll(".store-hero-dot")];
    let slideIndex = 0;
    let storeHeroTimer = null;
    const showSlide = (index) => {
      slideIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, i) =>
        slide.classList.toggle("active", i === slideIndex),
      );
      dots.forEach((dot, i) =>
        dot.classList.toggle("active", i === slideIndex),
      );
    };
    const stopStoreHero = () => clearInterval(storeHeroTimer);
    const startStoreHero = () => {
      stopStoreHero();
      if (slides.length > 1) {
        storeHeroTimer = setInterval(() => showSlide(slideIndex + 1), 5500);
      }
    };
    dots.forEach((dot, index) =>
      dot.addEventListener("click", () => {
        showSlide(index);
        startStoreHero();
      }),
    );
    store
      .querySelector("#store-hero-prev")
      ?.addEventListener("click", () => {
        showSlide(slideIndex - 1);
        startStoreHero();
      });
    store
      .querySelector("#store-hero-next")
      ?.addEventListener("click", () => {
        showSlide(slideIndex + 1);
        startStoreHero();
      });

    const storeHeroSection = store.querySelector(".store-hero-slide")?.parentElement;
    if (storeHeroSection) {
      storeHeroSection.addEventListener("mouseenter", stopStoreHero);
      storeHeroSection.addEventListener("mouseleave", startStoreHero);
      let storeTouchStartX = 0;
      storeHeroSection.addEventListener(
        "touchstart",
        (e) => {
          storeTouchStartX = e.changedTouches[0].screenX;
          stopStoreHero();
        },
        { passive: true },
      );
      storeHeroSection.addEventListener(
        "touchend",
        (e) => {
          const storeTouchEndX = e.changedTouches[0].screenX;
          const diff = storeTouchStartX - storeTouchEndX;
          if (Math.abs(diff) > 40) {
            if (diff > 0) showSlide(slideIndex + 1);
            else showSlide(slideIndex - 1);
          }
          startStoreHero();
        },
        { passive: true },
      );
    }
    startStoreHero();

    updateProducts();
    renderCart();
  }

  function initHeroSlider({
    containerSelector,
    slideSelector,
    dotSelector,
    dataKey,
    interval = 5000,
    previousSelector,
    nextSelector,
  }) {
    const containers = document.querySelectorAll(containerSelector);
    if (!containers.length) return;

    containers.forEach((container) => {
      const slides = [...container.querySelectorAll(slideSelector)];
      if (!slides.length) return;

      const dots = [
        ...(container.querySelectorAll(dotSelector).length
          ? container.querySelectorAll(dotSelector)
          : document.querySelectorAll(dotSelector)),
      ];

      let currentIndex = 0;
      let timer = null;
      const show = (index) => {
        currentIndex = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
          const active = slideIndex === currentIndex;
          slide.classList.toggle("active", active);
          slide.setAttribute("aria-hidden", String(!active));
        });
        dots.forEach((dot, dotIndex) => {
          const active = dotIndex === currentIndex;
          dot.classList.toggle("active", active);
          dot.setAttribute("aria-pressed", String(active));
        });
      };
      const stop = () => clearInterval(timer);
      const start = () => {
        stop();
        if (slides.length > 1) {
          timer = setInterval(() => show(currentIndex + 1), interval);
        }
      };

      dots.forEach((dot) => {
        dot.addEventListener("click", () => {
          const raw =
            dot.dataset[dataKey] ??
            dot.dataset.slideTo ??
            dot.dataset.i ??
            dot.dataset.index;
          const index = Number(raw);
          show(Number.isNaN(index) ? 0 : index);
          start();
        });
      });

      const previousButton = previousSelector
        ? container.querySelector(previousSelector) ||
          document.querySelector(previousSelector)
        : null;
      const nextButton = nextSelector
        ? container.querySelector(nextSelector) ||
          document.querySelector(nextSelector)
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
      container.addEventListener("focusin", stop);
      container.addEventListener("focusout", start);

      let touchStartX = 0;
      container.addEventListener(
        "touchstart",
        (e) => {
          touchStartX = e.changedTouches[0].screenX;
          stop();
        },
        { passive: true },
      );
      container.addEventListener(
        "touchend",
        (e) => {
          const touchEndX = e.changedTouches[0].screenX;
          const diff = touchStartX - touchEndX;
          if (Math.abs(diff) > 40) {
            if (diff > 0) show(currentIndex + 1);
            else show(currentIndex - 1);
          }
          start();
        },
        { passive: true },
      );

      show(0);
      start();
    });
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

    const cards = [...track.querySelectorAll(".testimonial-card")];
    const total = cards.length;
    if (!total) return;

    const isPlcPage = Boolean(document.querySelector(".plc-hero-slider"));
    let index = 0;
    let timer = null;

    const perView = () => {
      if (window.innerWidth >= 1024) return 3;
      if (window.innerWidth >= 640) return 2;
      return 1;
    };
    const maxIndex = () => Math.max(0, total - perView());

    let currentPerView = perView();
    let dots = [];

    const buildDots = () => {
      dotsWrap.innerHTML = "";
      dots = [];
      const mIndex = maxIndex();
      for (let dotIndex = 0; dotIndex <= mIndex; dotIndex += 1) {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", `Page ${dotIndex + 1}`);
        if (isPlcPage) {
          dot.className =
            "w-2.5 h-2.5 rounded-full transition-all duration-300 " +
            (dotIndex === index
              ? "bg-primary-500 scale-125"
              : "bg-slate-300 dark:bg-slate-600");
        } else {
          dot.className =
            "h-2 rounded-full transition-all duration-300 " +
            (dotIndex === index
              ? "w-6 bg-primary-500"
              : "w-2 bg-slate-300 dark:bg-slate-600");
        }
        dot.addEventListener("click", () => {
          index = dotIndex;
          update(false);
          start();
        });
        dotsWrap.appendChild(dot);
        dots.push(dot);
      }
    };

    const updateDots = () => {
      dots.forEach((dot, dotIndex) => {
        const isActive = dotIndex === index;
        if (isPlcPage) {
          dot.classList.toggle("bg-primary-500", isActive);
          dot.classList.toggle("scale-125", isActive);
          dot.classList.toggle("bg-slate-300", !isActive);
          dot.classList.toggle("dark:bg-slate-600", !isActive);
        } else {
          dot.classList.toggle("w-6", isActive);
          dot.classList.toggle("bg-primary-500", isActive);
          dot.classList.toggle("w-2", !isActive);
          dot.classList.toggle("bg-slate-300", !isActive);
          dot.classList.toggle("dark:bg-slate-600", !isActive);
        }
      });
    };

    const update = (checkRebuild = true) => {
      const pv = perView();
      if (checkRebuild && pv !== currentPerView) {
        currentPerView = pv;
        buildDots();
      }
      if (index > maxIndex()) index = maxIndex();
      track.style.transform = `translateX(-${(100 / pv) * index}%)`;
      updateDots();
    };

    const next = () => {
      index = index >= maxIndex() ? 0 : index + 1;
      update(false);
    };
    const prev = () => {
      index = index <= 0 ? maxIndex() : index - 1;
      update(false);
    };

    const start = () => {
      clearInterval(timer);
      timer = setInterval(next, 5000);
    };

    buildDots();
    update(false);
    start();

    window.addEventListener("resize", () => update(true));

    const viewport = document.getElementById("testimonial-viewport");
    if (viewport) {
      viewport.addEventListener("mouseenter", () => clearInterval(timer));
      viewport.addEventListener("mouseleave", start);

      let touchStartX = 0;
      viewport.addEventListener(
        "touchstart",
        (e) => {
          touchStartX = e.changedTouches[0].screenX;
          clearInterval(timer);
        },
        { passive: true },
      );
      viewport.addEventListener(
        "touchend",
        (e) => {
          const touchEndX = e.changedTouches[0].screenX;
          const diff = touchStartX - touchEndX;
          if (Math.abs(diff) > 40) {
            if (diff > 0) next();
            else prev();
          }
          start();
        },
        { passive: true },
      );
    }
  }

  function initBlogPagination() {
    document.querySelectorAll(".page-num-btn").forEach((pBtn) => {
      pBtn.addEventListener("click", () => {
        if (pBtn.textContent.trim().includes("Next")) {
          window.scrollTo({ top: 300, behavior: "smooth" });
          return;
        }
        document.querySelectorAll(".page-num-btn").forEach((b) => {
          b.classList.remove(
            "active",
            "bg-primary-600",
            "text-white",
            "shadow-lg",
            "shadow-primary-500/25",
          );
          b.classList.add(
            "bg-white",
            "dark:bg-slate-900",
            "border",
            "border-slate-200",
            "dark:border-slate-800",
            "text-slate-700",
            "dark:text-slate-300",
          );
        });
        pBtn.classList.add(
          "active",
          "bg-primary-600",
          "text-white",
          "shadow-lg",
          "shadow-primary-500/25",
        );
        pBtn.classList.remove(
          "bg-white",
          "dark:bg-slate-900",
          "border",
          "border-slate-200",
          "dark:border-slate-800",
          "text-slate-700",
          "dark:text-slate-300",
        );
        window.scrollTo({ top: 300, behavior: "smooth" });
      });
    });
  }

  function initContactForm() {
    const previewForm = document.getElementById("contact-preview-form");
    previewForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      document
        .getElementById("form-preview-notice")
        ?.classList.remove("hidden");
    });
  }

  const blogDatabase = {
    1: {
      title: "PPC Management Cost for Small Businesses in 2026",
      category: "Digital Marketing & Automation",
      date: "Oct 14, 2026",
      readTime: "6 Min Read",
      img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=80",
      author: "Engr. Masud Alam",
    },
    2: {
      title: "AI vs Human Graphic Designers: Which One Do You Need?",
      category: "AI & Innovation",
      date: "Oct 13, 2026",
      readTime: "5 Min Read",
      img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=80",
      author: "Engr. Masud Alam",
    },
    3: {
      title: "SEO for Real Estate Agents and Brokers: A Complete Guide",
      category: "Search Engine Optimization",
      date: "Oct 10, 2026",
      readTime: "7 Min Read",
      img: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1400&q=80",
      author: "Engr. Masud Alam",
    },
    4: {
      title: "3D Product Modelling vs Product Photography: Which Is Better",
      category: "3D CGI & Product Design",
      date: "Oct 08, 2026",
      readTime: "5 Min Read",
      img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1400&q=80",
      author: "Engr. Masud Alam",
    },
    5: {
      title: "Ecommerce Website Development for Small Businesses",
      category: "Web & Ecommerce Engineering",
      date: "Oct 06, 2026",
      readTime: "8 Min Read",
      img: "https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1400&q=80",
      author: "Engr. Masud Alam",
    },
    6: {
      title: "How to Use Facebook Ads to Generate Leads for a Small Business",
      category: "Meta Advertising",
      date: "Oct 02, 2026",
      readTime: "6 Min Read",
      img: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1400&q=80",
      author: "Engr. Masud Alam",
    },
    7: {
      title: "Background Removal vs Clipping Path: Key Differences (2026)",
      category: "Graphic Production",
      date: "Sep 30, 2026",
      readTime: "4 Min Read",
      img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1400&q=80",
      author: "Engr. Masud Alam",
    },
    8: {
      title: "Video & 3D Services Pricing: 2026 Cost Guide",
      category: "Video & 3D Production",
      date: "Sep 28, 2026",
      readTime: "6 Min Read",
      img: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1400&q=80",
      author: "Engr. Masud Alam",
    },
    9: {
      title: "What Is PPC Management and Is It Worth It for Small Businesses?",
      category: "Paid Search Strategy",
      date: "Sep 25, 2026",
      readTime: "5 Min Read",
      img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80",
      author: "Engr. Masud Alam",
    },
  };

  function initBlogSingle() {
    const articleTitle = document.getElementById("article-main-title");
    if (!articleTitle) return;

    const urlParams = new URLSearchParams(window.location.search);
    const postId = parseInt(urlParams.get("id"), 10) || 1;
    const currentPost = blogDatabase[postId] || blogDatabase[1];

    if (postId !== 1 && blogDatabase[postId]) {
      document.title = `${currentPost.title} | IATBD Blog`;
      const breadcrumb = document.getElementById("breadcrumb-current");
      if (breadcrumb) breadcrumb.textContent = currentPost.title;

      const categoryText = document.getElementById("article-category-text");
      if (categoryText) categoryText.textContent = currentPost.category;

      articleTitle.textContent = currentPost.title;

      const dateText = document.getElementById("article-date-text");
      if (dateText) dateText.textContent = currentPost.date;

      const readTime = document.getElementById("article-read-time");
      if (readTime) readTime.textContent = currentPost.readTime;

      const heroImg = document.getElementById("article-hero-img");
      if (heroImg) {
        heroImg.src = currentPost.img;
        heroImg.alt = currentPost.title;
      }
    }

    const prevId = postId > 1 ? postId - 1 : 9;
    const nextId = postId < 9 ? postId + 1 : 1;
    const prevPost = blogDatabase[prevId];
    const nextPost = blogDatabase[nextId];

    const prevLink = document.getElementById("prev-post-link");
    const prevTitle = document.getElementById("prev-post-title");
    if (prevLink && prevPost) {
      prevLink.href = `blog-single.html?id=${prevId}`;
      if (prevTitle) prevTitle.textContent = prevPost.title;
    }

    const nextLink = document.getElementById("next-post-link");
    const nextTitle = document.getElementById("next-post-title");
    if (nextLink && nextPost) {
      nextLink.href = `blog-single.html?id=${nextId}`;
      if (nextTitle) nextTitle.textContent = nextPost.title;
    }
  }

  function shareArticle(platform) {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    let shareUrl = "";

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        break;
      case "whatsapp":
        shareUrl = `https://api.whatsapp.com/send?text=${title}%20${url}`;
        break;
    }
    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=450");
    }
  }

  function copyArticleLink() {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        const toast = document.getElementById("copy-toast");
        if (!toast) return;
        toast.classList.remove(
          "translate-y-20",
          "opacity-0",
          "pointer-events-none",
        );
        setTimeout(() => {
          toast.classList.add(
            "translate-y-20",
            "opacity-0",
            "pointer-events-none",
          );
        }, 2500);
      })
      .catch(() => {
        alert("Link copied to clipboard: " + window.location.href);
      });
  }

  window.shareArticle = shareArticle;
  window.copyArticleLink = copyArticleLink;
})();

