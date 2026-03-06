// Pequeno script para navegação ativa e comportamento simples
document.addEventListener("DOMContentLoaded", function () {
  const links = document.querySelectorAll(".sidebar-nav a, .top-nav a");
  links.forEach((a) => {
    a.addEventListener("click", function (e) {
      links.forEach((x) => x.classList.remove("active"));
      this.classList.add("active");
    });
  });

  // destaque dinâmico da navegação superior ao rolar
  const topLinks = document.querySelectorAll(".top-nav a");
  const sections = document.querySelectorAll("main .section[id]");

  if (topLinks.length && sections.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            topLinks.forEach((a) => {
              if (a.getAttribute("href") === `#${id}`) {
                a.classList.add("active");
              } else {
                a.classList.remove("active");
              }
            });
          }
        });
      },
      { threshold: 0.55 },
    );

    sections.forEach((s) => observer.observe(s));
  }

  // lightbox para portfolio
  const projectCards = document.querySelectorAll(".project-card");
  const lightbox = document.getElementById("lightbox");
  const lbImage = document.querySelector(".lightbox-image");
  const lbCaption = document.querySelector(".lightbox-caption");
  const lbClose = document.querySelector(".lightbox-close");

  // lightbox behavior with multiple images support
  const lbPrev = document.querySelector(".lightbox-prev");
  const lbNext = document.querySelector(".lightbox-next");
  let currentImages = [];
  let currentIndex = 0;

  function openLightbox(images, title, startIndex = 0) {
    currentImages = images || [];
    currentIndex = startIndex || 0;
    if (!currentImages.length) {
      lbCaption.textContent = title + " — sem imagens disponíveis.";
      lbImage.style.display = "none";
      lbPrev.style.display = "none";
      lbNext.style.display = "none";
    } else {
      lbImage.src = currentImages[currentIndex];
      lbImage.style.display = "";
      lbCaption.textContent =
        title +
        (currentImages.length > 1
          ? ` (${currentIndex + 1}/${currentImages.length})`
          : "");
      lbPrev.style.display = currentImages.length > 1 ? "" : "none";
      lbNext.style.display = currentImages.length > 1 ? "" : "none";
    }
    lightbox.setAttribute("aria-hidden", "false");
  }

  function closeLightbox() {
    lightbox.setAttribute("aria-hidden", "true");
    lbImage.src = "";
    currentImages = [];
    currentIndex = 0;
  }

  function showIndex(i) {
    if (!currentImages.length) return;
    currentIndex = (i + currentImages.length) % currentImages.length;
    lbImage.src = currentImages[currentIndex];
    lbCaption.textContent =
      document
        .querySelector('.project-card[data-images*="' + currentImages[0] + '"]')
        ?.getAttribute("data-title") || "";
    lbCaption.textContent +=
      currentImages.length > 1
        ? ` (${currentIndex + 1}/${currentImages.length})`
        : "";
  }

  projectCards.forEach((card) => {
    card.addEventListener("click", () => {
      const imagesAttr = card.getAttribute("data-images") || "";
      const images = imagesAttr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const title = card.getAttribute("data-title") || "";
      openLightbox(images, title, 0);
    });
  });

  // thumbnail rotator: cycle images on the card thumb automatically
  const rotators = [];
  const ROTATE_INTERVAL = 3000; // ms

  projectCards.forEach((card) => {
    const imagesAttr = card.getAttribute("data-images") || "";
    const images = imagesAttr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const thumbImg = card.querySelector(".project-thumb img");
    if (!images.length || !thumbImg) return;

    // preload images
    images.forEach((src) => {
      const i = new Image();
      i.src = src;
    });

    let idx = 0;
    let timer = null;

    function showNext() {
      if (images.length <= 1) return;
      const next = (idx + 1) % images.length;
      // fade out
      thumbImg.classList.add("fading");
      setTimeout(() => {
        thumbImg.src = images[next];
        idx = next;
        thumbImg.classList.remove("fading");
      }, 420); // slightly longer than CSS transition
    }

    function start() {
      if (timer) clearInterval(timer);
      timer = setInterval(showNext, ROTATE_INTERVAL);
      rotators.push(timer);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    // start rotating
    start();

    // pause on hover / focus
    card.addEventListener("mouseenter", stop);
    card.addEventListener("mouseleave", start);
    card.addEventListener("focusin", stop);
    card.addEventListener("focusout", start);
  });

  lbClose && lbClose.addEventListener("click", closeLightbox);
  lbPrev && lbPrev.addEventListener("click", () => showIndex(currentIndex - 1));
  lbNext && lbNext.addEventListener("click", () => showIndex(currentIndex + 1));
  lightbox &&
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });

  // keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (lightbox && lightbox.getAttribute("aria-hidden") === "false") {
      if (e.key === "ArrowLeft") showIndex(currentIndex - 1);
      if (e.key === "ArrowRight") showIndex(currentIndex + 1);
      if (e.key === "Escape") closeLightbox();
    }
  });
});
