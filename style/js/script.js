
document.addEventListener("DOMContentLoaded", function () {
  const links = document.querySelectorAll(".top-nav a");

  links.forEach((link) => {
    link.addEventListener("click", function () {
      links.forEach((item) => item.classList.remove("active"));
      this.classList.add("active");
    });
  });

  const topLinks = document.querySelectorAll(".top-nav a");
  const sections = document.querySelectorAll("main .section[id]");

  if (topLinks.length && sections.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const id = entry.target.id;
          topLinks.forEach((link) => {
            if (link.getAttribute("href") === `#${id}`) {
              link.classList.add("active");
            } else {
              link.classList.remove("active");
            }
          });
        });
      },
      { threshold: 0.55 },
    );

    sections.forEach((section) => observer.observe(section));
  }

  const projectCards = document.querySelectorAll(".project-card");
  const lightbox = document.getElementById("lightbox");
  const lbImage = document.querySelector(".lightbox-image");
  const lbCaption = document.querySelector(".lightbox-caption");
  const lbClose = document.querySelector(".lightbox-close");
  const lbPrev = document.querySelector(".lightbox-prev");
  const lbNext = document.querySelector(".lightbox-next");
  const ROTATE_INTERVAL = 3000;

  let currentImages = [];
  let currentIndex = 0;
  let currentTitle = "";

  function updateCaption() {
    lbCaption.textContent =
      currentTitle +
      (currentImages.length > 1
        ? ` (${currentIndex + 1}/${currentImages.length})`
        : "");
  }

  function openLightbox(images, title, startIndex = 0) {
    currentImages = images || [];
    currentIndex = startIndex || 0;
    currentTitle = title || "";

    if (!currentImages.length) {
      lbCaption.textContent = `${currentTitle} - sem imagens disponiveis.`;
      lbImage.style.display = "none";
      lbPrev.style.display = "none";
      lbNext.style.display = "none";
    } else {
      lbImage.src = currentImages[currentIndex];
      lbImage.style.display = "";
      lbPrev.style.display = currentImages.length > 1 ? "" : "none";
      lbNext.style.display = currentImages.length > 1 ? "" : "none";
      updateCaption();
    }

    lightbox.setAttribute("aria-hidden", "false");
  }

  function closeLightbox() {
    lightbox.setAttribute("aria-hidden", "true");
    lbImage.src = "";
    currentImages = [];
    currentIndex = 0;
    currentTitle = "";
  }

  function showIndex(index) {
    if (!currentImages.length) return;

    currentIndex = (index + currentImages.length) % currentImages.length;
    lbImage.src = currentImages[currentIndex];
    updateCaption();
  }

  projectCards.forEach((card) => {
    const imagesAttr = card.getAttribute("data-images") || "";
    const images = imagesAttr
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const thumbImg = card.querySelector(".project-thumb img");
    const title = card.getAttribute("data-title") || "";

    card.addEventListener("click", () => openLightbox(images, title, 0));

    if (!images.length || !thumbImg) return;

    images.forEach((src) => {
      const preload = new Image();
      preload.src = src;
    });

    let idx = 0;
    let timer = null;

    function showNext() {
      if (images.length <= 1) return;

      const next = (idx + 1) % images.length;
      thumbImg.classList.add("fading");

      setTimeout(() => {
        thumbImg.src = images[next];
        idx = next;
        thumbImg.classList.remove("fading");
      }, 420);
    }

    function start() {
      if (timer) clearInterval(timer);
      timer = setInterval(showNext, ROTATE_INTERVAL);
    }

    function stop() {
      if (!timer) return;
      clearInterval(timer);
      timer = null;
    }

    start();

    card.addEventListener("mouseenter", stop);
    card.addEventListener("mouseleave", start);
    card.addEventListener("focusin", stop);
    card.addEventListener("focusout", start);
  });

  lbClose && lbClose.addEventListener("click", closeLightbox);
  lbPrev && lbPrev.addEventListener("click", () => showIndex(currentIndex - 1));
  lbNext && lbNext.addEventListener("click", () => showIndex(currentIndex + 1));

  lightbox &&
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });

  document.addEventListener("keydown", (event) => {
    if (!lightbox || lightbox.getAttribute("aria-hidden") !== "false") return;

    if (event.key === "ArrowLeft") showIndex(currentIndex - 1);
    if (event.key === "ArrowRight") showIndex(currentIndex + 1);
    if (event.key === "Escape") closeLightbox();
  });
});
