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
    initStoreShop();
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
    const showSlide = (index) => {
      slideIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, i) =>
        slide.classList.toggle("active", i === slideIndex),
      );
      dots.forEach((dot, i) =>
        dot.classList.toggle("active", i === slideIndex),
      );
    };
    dots.forEach((dot, index) =>
      dot.addEventListener("click", () => showSlide(index)),
    );
    store
      .querySelector("#store-hero-prev")
      ?.addEventListener("click", () => showSlide(slideIndex - 1));
    store
      .querySelector("#store-hero-next")
      ?.addEventListener("click", () => showSlide(slideIndex + 1));
    if (slides.length > 1)
      window.setInterval(() => showSlide(slideIndex + 1), 5500);

    updateProducts();
    renderCart();
  }

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
