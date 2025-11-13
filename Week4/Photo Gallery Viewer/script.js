const galleryEl = document.getElementById("gallery");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxCaption = document.getElementById("lightboxCaption");
const closeBtn = document.getElementById("closeBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const lightboxCounter = document.getElementById("lightboxCounter");
const thumbnailBar = document.getElementById("thumbnailBar");
const zoomInBtn = document.getElementById("zoomInBtn");
const zoomOutBtn = document.getElementById("zoomOutBtn");
const resetZoomBtn = document.getElementById("resetZoomBtn");
const autoPlayBtn = document.getElementById("autoPlayBtn");
const transitionSelect = document.getElementById("transitionSelect");

let galleryItems = [];
let currentIndex = 0;
let zoomLevel = 1;
let autoplayTimer = null;
let swipeStartX = null;
let thumbnailButtons = [];

const AUTOPLAY_DELAY = 4000;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;
const TRANSITION_CLASSES = ["effect-fade", "effect-slide", "effect-zoom"];

const highlightThumbnail = (activeIndex) => {
  if (!thumbnailButtons.length) {
    return;
  }

  thumbnailButtons.forEach((button, index) => {
    const isActive = index === activeIndex;
    button.classList.toggle("is-active", isActive);
    if (isActive) {
      button.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  });
};

const refreshThumbnails = () => {
  if (!thumbnailBar) {
    return;
  }

  thumbnailBar.innerHTML = "";
  if (!galleryItems.length) {
    thumbnailButtons = [];
    thumbnailBar.classList.add("is-hidden");
    return;
  }

  thumbnailButtons = galleryItems.map((item, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "thumbnail-btn";
    button.dataset.index = index.toString();

    const sourceImg = item.querySelector("img");
    const thumbImg = document.createElement("img");
    thumbImg.src = sourceImg?.src ?? "";
    thumbImg.alt = sourceImg?.alt ?? `Photo ${index + 1}`;

    button.appendChild(thumbImg);
    button.addEventListener("click", () => {
      const targetIndex = Number(button.dataset.index);
      showImage(targetIndex);
    });

    thumbnailBar.appendChild(button);
    return button;
  });

  thumbnailBar.classList.toggle("is-hidden", galleryItems.length < 2);
  highlightThumbnail(currentIndex);
};

const applyTransitionEffect = () => {
  const effect = transitionSelect?.value ?? "fade";
  const effectClass = `effect-${effect}`;
  TRANSITION_CLASSES.forEach((className) => lightboxImg.classList.remove(className));
  lightboxImg.classList.add(effectClass);
  lightboxImg.classList.remove("is-animating");
  // Force reflow so animation restarts
  void lightboxImg.offsetWidth;
  lightboxImg.classList.add("is-animating");
};

const cycleTransition = () => {
  if (!transitionSelect || !transitionSelect.options.length) {
    return;
  }
  const nextIndex = (transitionSelect.selectedIndex + 1) % transitionSelect.options.length;
  transitionSelect.selectedIndex = nextIndex;
  if (!lightbox.classList.contains("hidden")) {
    applyTransitionEffect();
  }
};

const setLightboxImageSource = (src) => {
  const handleLoad = () => {
    applyTransitionEffect();
    lightboxImg.removeEventListener("load", handleLoad);
  };

  lightboxImg.addEventListener("load", handleLoad);
  lightboxImg.src = src;

  if (lightboxImg.complete) {
    requestAnimationFrame(() => {
      applyTransitionEffect();
      lightboxImg.removeEventListener("load", handleLoad);
    });
  }
};

const updateCounter = () => {
  const total = galleryItems.length;
  const displayIndex = total === 0 ? 0 : Math.min(currentIndex + 1, total);
  lightboxCounter.textContent = `${displayIndex} / ${total}`;
};

const updateZoom = () => {
  lightboxImg.style.transform = `scale(${zoomLevel})`;
  if (zoomLevel > 1) {
    lightboxImg.classList.add("is-zoomed");
  } else {
    lightboxImg.classList.remove("is-zoomed");
  }
};

const resetZoom = () => {
  zoomLevel = 1;
  updateZoom();
};

const zoomIn = () => {
  zoomLevel = Math.min(MAX_ZOOM, zoomLevel + ZOOM_STEP);
  updateZoom();
};

const zoomOut = () => {
  zoomLevel = Math.max(MIN_ZOOM, zoomLevel - ZOOM_STEP);
  updateZoom();
};

const stopAutoplay = () => {
  if (autoplayTimer) {
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  }
  autoPlayBtn.textContent = "Start slideshow";
  autoPlayBtn.classList.remove("is-playing");
};

const startAutoplay = () => {
  if (galleryItems.length < 2) {
    return;
  }
  if (!autoplayTimer) {
    autoplayTimer = setInterval(() => {
      if (!lightbox.classList.contains("hidden")) {
        showNext();
      }
    }, AUTOPLAY_DELAY);
  }
  autoPlayBtn.textContent = "Pause slideshow";
  autoPlayBtn.classList.add("is-playing");
};

const showImage = (index) => {
  if (!galleryItems.length) {
    return;
  }

  const item = galleryItems[index];
  if (!item) {
    return;
  }

  const img = item.querySelector("img");
  const source = item.dataset.full || img?.src || "";

  lightboxImg.alt = img?.alt || "";
  lightboxCaption.textContent = item.querySelector("figcaption")?.textContent ?? "";

  lightbox.classList.remove("hidden");
  lightbox.setAttribute("aria-hidden", "false");
  setLightboxImageSource(source);
  currentIndex = index;
  updateCounter();
  resetZoom();
  highlightThumbnail(currentIndex);
};

const hideLightbox = () => {
  lightbox.classList.add("hidden");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImg.removeAttribute("src");
  lightboxImg.removeAttribute("alt");
  stopAutoplay();
  resetZoom();
};

const showNext = () => {
  if (!galleryItems.length) {
    return;
  }
  const nextIndex = (currentIndex + 1) % galleryItems.length;
  showImage(nextIndex);
};

const showPrev = () => {
  if (!galleryItems.length) {
    return;
  }
  const prevIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
  showImage(prevIndex);
};

const registerItem = (item) => {
  if (galleryItems.includes(item)) {
    return;
  }

  const openItem = () => {
    const index = galleryItems.indexOf(item);
    if (index >= 0) {
      showImage(index);
    }
  };

  item.addEventListener("click", openItem);
  item.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openItem();
    }
  });
  item.setAttribute("tabindex", "0");
  galleryItems.push(item);
  updateCounter();
};

document.querySelectorAll(".gallery__item").forEach(registerItem);
refreshThumbnails();

lightboxImg.addEventListener("animationend", () => {
  lightboxImg.classList.remove("is-animating");
});

closeBtn.addEventListener("click", hideLightbox);
nextBtn.addEventListener("click", showNext);
prevBtn.addEventListener("click", showPrev);
shuffleBtn.addEventListener("click", () => {
  if (!galleryItems.length) {
    return;
  }
  const currentItem = galleryItems[currentIndex];
  const shuffled = [...galleryItems].sort(() => Math.random() - 0.5);
  shuffled.forEach((item) => galleryEl.appendChild(item));
  galleryItems = shuffled;
  if (!lightbox.classList.contains("hidden") && currentItem) {
    currentIndex = galleryItems.indexOf(currentItem);
  }
  refreshThumbnails();
  updateCounter();
});

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    hideLightbox();
  }
});

document.addEventListener("keydown", (event) => {
  if (lightbox.classList.contains("hidden")) {
    return;
  }

  const key = event.key;
  const lowerKey = key.toLowerCase();

  if (key === "Escape") {
    event.preventDefault();
    hideLightbox();
  } else if (key === "ArrowRight") {
    event.preventDefault();
    showNext();
  } else if (key === "ArrowLeft") {
    event.preventDefault();
    showPrev();
  } else if (lowerKey === "z" || key === "+" || key === "=") {
    event.preventDefault();
    zoomIn();
  } else if (lowerKey === "x" || key === "-" || key === "_") {
    event.preventDefault();
    zoomOut();
  } else if (key === "0") {
    event.preventDefault();
    resetZoom();
  } else if (lowerKey === "t") {
    event.preventDefault();
    cycleTransition();
  }
});

zoomInBtn.addEventListener("click", zoomIn);
zoomOutBtn.addEventListener("click", zoomOut);

resetZoomBtn.addEventListener("click", resetZoom);

autoPlayBtn.addEventListener("click", () => {
  if (autoplayTimer) {
    stopAutoplay();
  } else {
    startAutoplay();
  }
});

transitionSelect?.addEventListener("change", () => {
  if (!lightbox.classList.contains("hidden")) {
    applyTransitionEffect();
  }
});

lightbox.addEventListener("pointerdown", (event) => {
  if (
    event.target.closest(".lightbox__tools") ||
    event.target.closest(".lightbox__control") ||
    event.target === closeBtn
  ) {
    swipeStartX = null;
    return;
  }
  swipeStartX = event.clientX;
});

["pointerup", "pointercancel"].forEach((eventName) => {
  lightbox.addEventListener(eventName, (event) => {
    if (swipeStartX === null) {
      return;
    }
    const deltaX = event.clientX - swipeStartX;
    if (Math.abs(deltaX) > 60) {
      deltaX < 0 ? showNext() : showPrev();
    }
    swipeStartX = null;
  });
});
