(() => {
  "use strict";
  const wrap = document.getElementById("page-wrapper");
  const page = document.getElementById("page");

  // O layout original do PDF tem 1470px de largura. Em telas intermediárias,
  // preservamos a proporção sem criar rolagem horizontal. Abaixo de 780px,
  // o CSS reorganiza as seções para uma leitura confortável no celular.
  function updatePageScale() {
    if (window.innerWidth <= 780) {
      page.style.removeProperty("transform");
      page.style.removeProperty("height");
      page.style.removeProperty("--hero-height");
      page.style.removeProperty("--hero-offset");
      wrap.style.removeProperty("height");
    } else {
      const scale = Math.min(1, document.documentElement.clientWidth / 1470);

      const heroHeight = window.innerHeight / scale;
      const offset = heroHeight - 940;
      const pageHeight = 8152 + offset;

      page.style.setProperty("--hero-height", `${heroHeight}px`);
      page.style.setProperty("--hero-offset", `${offset}px`);

      page.style.height = `${pageHeight}px`;
      page.style.transform = `scale(${scale})`;

      wrap.style.height = `${pageHeight * scale}px`;
    }
  }
  window.addEventListener("resize", updatePageScale, { passive: true });
  updatePageScale();

  const photo = document.getElementById("gallery-image");
  const stage = document.querySelector(".gallery-stage");
  const dotsContainer = document.getElementById("gallery-dots");
  const photos = (window.MANUAL_GALLERY || []).filter((item) => item?.src);
  let index = 0;
  const dots = photos.map((item, i) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "gallery-dot";
    button.setAttribute(
      "aria-label",
      `Mostrar fotografia ${i + 1} de ${photos.length}`
    );
    button.addEventListener("click", () => showPhoto(i));
    dotsContainer.append(button);
    return button;
  });
  function showPhoto(i) {
    if (!photos.length) return;
    index = (i + photos.length) % photos.length;
    photo.src = photos[index].src;
    photo.alt = photos[index].alt || `Fotografia ${index + 1}`;
    dots.forEach((dot, n) => {
      dot.classList.toggle("active", n === index);
      dot.setAttribute("aria-pressed", String(n === index));
    });
    if (!lightbox.hidden && currentGallery === "location") {
      lightboxImage.src = photos[index].src;
      lightboxImage.alt = photos[index].alt || "";
    }
  }
  document
    .getElementById("gallery-prev")
    .addEventListener("click", () => showPhoto(index - 1));
  document
    .getElementById("gallery-next")
    .addEventListener("click", () => showPhoto(index + 1));
  let touchStartX = null;
  stage.addEventListener(
    "touchstart",
    (ev) => {
      touchStartX = ev.changedTouches[0].screenX;
    },
    { passive: true }
  );
  stage.addEventListener(
    "touchend",
    (ev) => {
      if (touchStartX === null) return;
      const distance = ev.changedTouches[0].screenX - touchStartX;
      if (Math.abs(distance) > 40) showPhoto(index + (distance < 0 ? 1 : -1));
      touchStartX = null;
    },
    { passive: true }
  );
  stage.tabIndex = 0;
  stage.addEventListener("keydown", (ev) => {
    if (ev.key === "ArrowRight") {
      ev.preventDefault();
      showPhoto(index + 1);
    }
    if (ev.key === "ArrowLeft") {
      ev.preventDefault();
      showPhoto(index - 1);
    }
  });

  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightbox-image");
  const btnClose = document.getElementById("lightbox-close");
  const btnNext = document.getElementById("lightbox-next");
  const btnPrev = document.getElementById("lightbox-prev");
  let currentGallery = "location";
  let lastFocus = null;
  function openLightbox(src, alt, group = "location") {
    lastFocus = document.activeElement;
    currentGallery = group;
    lightboxImage.src = src;
    lightboxImage.alt = alt || "";
    lightbox.hidden = false;
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("has-lightbox");
    btnNext.hidden = group !== "location" || photos.length < 2;
    btnPrev.hidden = group !== "location" || photos.length < 2;
    btnClose.focus();
  }
  function closeLightbox() {
    lightbox.hidden = true;
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("has-lightbox");
    if (lastFocus?.focus) lastFocus.focus();
  }
  document
    .getElementById("gallery-expand")
    .addEventListener("click", () =>
      openLightbox(photos[index]?.src, photos[index]?.alt)
    );
  document.querySelectorAll(".inspiration-item").forEach((button) => {
    button.addEventListener("click", () =>
      openLightbox(button.dataset.full, button.dataset.alt, "inspiration")
    );
  });
  btnClose.addEventListener("click", closeLightbox);
  btnNext.addEventListener("click", () => showPhoto(index + 1));
  btnPrev.addEventListener("click", () => showPhoto(index - 1));
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  showPhoto(0);
  document.addEventListener("keydown", (event) => {
    if (lightbox.hidden) return;
    if (event.key === "Escape") closeLightbox();
    if (currentGallery === "location" && event.key === "ArrowRight")
      showPhoto(index + 1);
    if (currentGallery === "location" && event.key === "ArrowLeft")
      showPhoto(index - 1);
  });
})();
