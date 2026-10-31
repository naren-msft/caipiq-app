"use strict";

document.querySelectorAll("video[data-status]").forEach((video) => {
  const status = document.getElementById(video.dataset.status);
  const duration = video.dataset.duration;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let visible = false;
  let manuallyPaused = false;
  let automaticPause = false;

  const eligible = () => visible && !document.hidden && !reducedMotion.matches && !manuallyPaused;
  const pauseAutomatically = () => {
    if (!video.paused) {
      automaticPause = true;
      video.pause();
    }
  };
  const synchronize = () => {
    if (!visible || document.hidden || reducedMotion.matches) {
      pauseAutomatically();
      if (reducedMotion.matches) {
        status.textContent = `Reduced motion is enabled. Press Play to watch the silent, ${duration}-second film.`;
      }
      return;
    }
    if (eligible() && !video.error) {
      video.play().catch((error) => {
        if (error.name === "AbortError" && !eligible()) return;
        status.textContent = "Automatic playback is unavailable. Press Play to watch the film.";
      });
    }
  };

  video.addEventListener("pause", () => {
    if (automaticPause) automaticPause = false;
    else manuallyPaused = true;
  });
  video.addEventListener("play", () => {
    manuallyPaused = false;
    status.textContent = `Silent, ${duration}-second film. Use the player controls to play or pause.`;
  });
  video.addEventListener("error", () => {
    status.textContent = "The film could not load. Please reload the page, or try a current browser.";
  });
  document.addEventListener("visibilitychange", synchronize);
  reducedMotion.addEventListener("change", synchronize);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.intersectionRatio >= 0.25;
      synchronize();
    }, { threshold: [0, 0.25] }).observe(video);
  } else {
    status.textContent = `Press Play to watch the silent, ${duration}-second film.`;
  }
});
