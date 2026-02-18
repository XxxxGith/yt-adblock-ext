/**
 * YT Ad Cleaner - Content Script
 * Runs on youtube.com pages, removes all ad elements.
 */

(function () {
  "use strict";

  // Check license and start
  function checkAndStart() {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(["licenseActive"], (result) => {
        if (!result.licenseActive) return;
        init();
      });
      chrome.storage.onChanged.addListener((changes) => {
        if (changes.licenseActive) {
          if (changes.licenseActive.newValue) {
            init();
          } else {
            destroy();
          }
        }
      });
    }
  }

  // Start after DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", checkAndStart);
  } else {
    checkAndStart();
  }

  let interval = null;
  let observer = null;

  function init() {
    if (interval) return; // already running
    interval = setInterval(removeAds, 300);
    observer = new MutationObserver(() => removeAds());
    observer.observe(document.body, { childList: true, subtree: true });
    removeAds();
  }

  function destroy() {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  function removeAds() {
    handleVideoAds();
    removeDOMAdElements();
    dismissPopups();
  }

  /** Skip / fast-forward video ads */
  function handleVideoAds() {
    const player = document.querySelector("#movie_player");
    const video = document.querySelector("video");

    if (!player) return;

    const adShowing =
      player.classList.contains("ad-showing") ||
      player.classList.contains("ad-interrupting");

    if (adShowing && video) {
      video.currentTime = video.duration || 9999;
      video.playbackRate = 16;
    }

    // Click skip button
    const skipSelectors = [
      ".ytp-skip-ad-button",
      ".ytp-ad-skip-button",
      ".ytp-ad-skip-button-modern",
      "button.ytp-ad-skip-button",
      ".ytp-ad-skip-button-slot button",
      '[id^="skip-button"]',
    ];
    for (const sel of skipSelectors) {
      const btn = document.querySelector(sel);
      if (btn && btn.offsetParent !== null) {
        btn.click();
        return;
      }
    }
  }

  /** Remove ad DOM elements */
  function removeDOMAdElements() {
    const adSelectors = [
      // Player overlay ads
      ".ytp-ad-player-overlay",
      ".ytp-ad-player-overlay-layout",
      ".ytp-ad-player-overlay-layout__player-card-container",
      ".ytp-ad-image-overlay",
      ".ytp-ad-overlay-container",
      ".ytp-ad-text-overlay",
      ".ytp-ad-overlay-close-button",
      ".ytp-ad-overlay-slot",
      ".ytp-ad-module",
      ".ytp-ad-action-interstitial",
      ".ytp-ad-overlay-ad-info-button-container",
      ".ytp-paid-content-overlay",
      // Companion ads (sidebar)
      "ytd-companion-slot-renderer",
      "#companion",
      // Player ads container
      "ytd-player-legacy-desktop-watch-ads-renderer",
      "#player-ads",
      // Feed ads
      "ytd-ad-slot-renderer",
      "ad-slot-renderer",
      "ytd-banner-promo-renderer",
      "ytd-statement-banner-renderer",
      "ytd-in-feed-ad-layout-renderer",
      "ytd-promoted-sparkles-web-renderer",
      "ytd-display-ad-renderer",
      "ytd-promoted-video-renderer",
      "ytd-action-companion-ad-renderer",
      "ytd-compact-promoted-video-renderer",
      "#masthead-ad",
      // Sidebar engagement panels
      '#panels > ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-ads"]',
      "#related ytd-item-section-renderer:has(ytd-ad-slot-renderer)",
      "#related ytd-item-section-renderer:has(ad-slot-renderer)",
      // Premium nag dialogs
      "ytd-popup-container tp-yt-paper-dialog:has(yt-mealbar-promo-renderer)",
      "tp-yt-paper-dialog:has(.ytd-enforcement-message-view-model)",
      "ytd-enforcement-message-view-model",
    ];

    for (const sel of adSelectors) {
      try {
        document.querySelectorAll(sel).forEach((el) => el.remove());
      } catch (e) {
        // :has() may not be supported in older browsers, ignore
      }
    }
  }

  /** Dismiss Premium promo popups */
  function dismissPopups() {
    const btns = document.querySelectorAll(
      "tp-yt-paper-dialog .dismiss-button, " +
        "tp-yt-paper-dialog #dismiss-button, " +
        "#dismiss-button"
    );
    btns.forEach((btn) => {
      try {
        btn.click();
      } catch (e) {}
    });
  }
})();
