const minimizeBtn = document.getElementById("minimizeBtn");
const closeBtn = document.getElementById("closeBtn");
const homeBtn = document.getElementById("homeBtn");
const alwaysOnTopToggle = document.getElementById("alwaysOnTopToggle");
const clickThroughToggle = document.getElementById("clickThroughToggle");
const opacityRange = document.getElementById("opacityRange");
const opacityText = document.getElementById("opacityText");
const backBtn = document.getElementById("backBtn");
const forwardBtn = document.getElementById("forwardBtn");
const statusText = document.getElementById("statusText");
const youtubeTab = document.getElementById("youtubeTab");
const aToolTab = document.getElementById("aToolTab");
const manduTab = document.getElementById("manduTab");
const youtubePanel = document.getElementById("youtubePanel");
const aToolPanel = document.getElementById("aToolPanel");
const manduPanel = document.getElementById("manduPanel");
const youtubeControls = document.getElementById("youtubeControls");
const youtubeHost = document.getElementById("youtubeHost");
const aToolHost = document.getElementById("aToolHost");

const YOUTUBE_HOME = "https://www.youtube.com/";
const ATOOL_HOME = "https://aion2tool.com/";

const TEXT = {
  youtubeTab: "유튜브 탭입니다.",
  atoolTab: "아툴검색 탭입니다.",
  manduTab: "침식 막넴 만두 안내 탭입니다.",
  youtubeLoaded: "유튜브 페이지를 불러왔습니다.",
  youtubeLoading: "유튜브 페이지를 불러오는 중입니다.",
  youtubeFailed: "유튜브 페이지를 불러오지 못했습니다.",
  invalidUrl: "올바른 주소가 아닙니다.",
  atoolLoaded: "아툴 페이지를 불러왔습니다.",
  clickThroughOn: "클릭 통과가 켜졌습니다.",
  clickThroughOff: "클릭 통과가 꺼졌습니다."
};

const ATOOL_HIDE_CSS = `
  header,
  nav,
  aside,
  [role="banner"],
  [class*="header"],
  [class*="gnb"],
  [class*="top-menu"],
  [class*="topmenu"],
  [class*="nav"],
  [class*="menu"],
  [class*="tabs"],
  [class*="tab-list"],
  [class*="category"] {
    display: none !important;
  }

  iframe[src*="ads"],
  iframe[src*="doubleclick"],
  iframe[src*="googlesyndication"],
  ins.adsbygoogle,
  [id*="ad"],
  [class*="ad-"],
  [class^="ad"],
  [class*="ads"],
  [class*="advert"],
  [class*="banner"],
  [class*="popup"],
  [class*="floating"] {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    pointer-events: none !important;
  }

  body {
    overflow-x: hidden !important;
  }
`;

let activeTab = "youtube";
let youtubeView = null;
let aToolView = null;
let youtubeUrl = YOUTUBE_HOME;
let aToolUrl = ATOOL_HOME;

function setStatus(text) {
  statusText.textContent = text;
}

function setYoutubeFullscreenLayout(enabled) {
  document.body.classList.toggle("youtube-web-fullscreen", Boolean(enabled));
}

function createWebview(id, src) {
  const webview = document.createElement("webview");
  webview.id = id;
  webview.src = src;
  webview.setAttribute("allowpopups", "");
  webview.setAttribute("allowfullscreen", "");
  webview.setAttribute("webpreferences", "contextIsolation=yes");
  return webview;
}

function updateYoutubeNavButtons() {
  if (!youtubeView) {
    backBtn.disabled = true;
    forwardBtn.disabled = true;
    return;
  }

  backBtn.disabled = !youtubeView.canGoBack();
  forwardBtn.disabled = !youtubeView.canGoForward();
}

function attachYoutubeView(src = youtubeUrl) {
  if (youtubeView) {
    return youtubeView;
  }

  youtubeView = createWebview("youtubeView", src);
  youtubeHost.replaceChildren(youtubeView);

  youtubeView.addEventListener("dom-ready", () => {
    updateYoutubeNavButtons();
  });

  youtubeView.addEventListener("did-navigate", (event) => {
    youtubeUrl = event.url;
    updateYoutubeNavButtons();
    if (activeTab === "youtube") {
      setStatus(TEXT.youtubeLoaded);
    }
  });

  youtubeView.addEventListener("did-navigate-in-page", (event) => {
    youtubeUrl = event.url;
    updateYoutubeNavButtons();
  });

  youtubeView.addEventListener("did-fail-load", () => {
    updateYoutubeNavButtons();
    if (activeTab === "youtube") {
      setStatus(TEXT.youtubeFailed);
    }
  });

  youtubeView.addEventListener("enter-html-full-screen", (event) => {
    event.preventDefault?.();
    setYoutubeFullscreenLayout(true);
  });

  youtubeView.addEventListener("leave-html-fullscreen", (event) => {
    event.preventDefault?.();
    setYoutubeFullscreenLayout(false);
  });

  return youtubeView;
}

function simplifyAToolView() {
  if (!aToolView) {
    return;
  }

  aToolView.insertCSS(ATOOL_HIDE_CSS).catch(() => {});

  aToolView.executeJavaScript(`
    (() => {
      const hideFixedAds = () => {
        document.querySelectorAll("body *").forEach((element) => {
          const style = window.getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          const text = (element.textContent || "").replace(/\\s+/g, " ").trim();
          const isBottomFixed = style.position === "fixed" && rect.bottom >= window.innerHeight - 2;
          const isWide = rect.width >= window.innerWidth * 0.35;
          const looksLikeAd = /광고|AD|Sponsored/i.test(text) || element.querySelector("iframe");

          if ((isBottomFixed && isWide) || looksLikeAd) {
            element.style.display = "none";
          }
        });
      };

      const hideMainMenus = () => {
        [
          "header",
          "nav",
          "aside",
          '[role="banner"]',
          '[class*="header"]',
          '[class*="gnb"]',
          '[class*="top-menu"]',
          '[class*="topmenu"]',
          '[class*="nav"]',
          '[class*="menu"]',
          '[class*="tabs"]'
        ].forEach((selector) => {
          document.querySelectorAll(selector).forEach((element) => {
            element.style.display = "none";
          });
        });
      };

      hideMainMenus();
      hideFixedAds();
      window.scrollTo(0, 0);

      const observer = new MutationObserver(() => {
        hideMainMenus();
        hideFixedAds();
      });

      observer.observe(document.body, { childList: true, subtree: true });
      return true;
    })();
  `).catch(() => {});
}

function attachAToolView(src = aToolUrl) {
  if (aToolView) {
    return aToolView;
  }

  aToolView = createWebview("aToolView", src);
  aToolHost.replaceChildren(aToolView);

  aToolView.addEventListener("dom-ready", () => {
    simplifyAToolView();

    try {
      aToolView.setZoomFactor(1.05);
    } catch {
      // ignore
    }

    if (activeTab === "atool") {
      setStatus(TEXT.atoolLoaded);
    }
  });

  aToolView.addEventListener("did-navigate", (event) => {
    aToolUrl = event.url;
    simplifyAToolView();
    if (activeTab === "atool") {
      setStatus(TEXT.atoolLoaded);
    }
  });

  aToolView.addEventListener("did-navigate-in-page", (event) => {
    aToolUrl = event.url;
    simplifyAToolView();
  });

  return aToolView;
}

function setActiveTab(tab) {
  activeTab = tab;

  const isYoutube = tab === "youtube";
  const isATool = tab === "atool";
  const isMandu = tab === "mandu";

  document.body.classList.toggle("tab-youtube", isYoutube);
  document.body.classList.toggle("tab-atool", isATool);
  document.body.classList.toggle("tab-mandu", isMandu);

  youtubeTab.classList.toggle("active", isYoutube);
  aToolTab.classList.toggle("active", isATool);
  manduTab.classList.toggle("active", isMandu);

  youtubePanel.classList.toggle("active", isYoutube);
  aToolPanel.classList.toggle("active", isATool);
  manduPanel.classList.toggle("active", isMandu);
  youtubeControls.classList.toggle("active", isYoutube);

  if (isYoutube) {
    attachYoutubeView(youtubeUrl);
    updateYoutubeNavButtons();
    setStatus(TEXT.youtubeTab);
    return;
  }

  if (isATool) {
    attachAToolView(aToolUrl);
    setStatus(TEXT.atoolTab);
    return;
  }

  setStatus(TEXT.manduTab);
}

function navigateYoutube(url) {
  const trimmed = url.trim();
  if (!trimmed) {
    return;
  }

  const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    new URL(normalized);
    youtubeUrl = normalized;
    attachYoutubeView(youtubeUrl).src = youtubeUrl;
    setStatus(TEXT.youtubeLoading);
  } catch {
    setStatus(TEXT.invalidUrl);
  }
}

minimizeBtn.addEventListener("click", () => {
  window.overlayApi.minimize();
});

closeBtn.addEventListener("click", () => {
  window.overlayApi.close();
});

homeBtn.addEventListener("click", () => {
  setActiveTab("youtube");
  navigateYoutube(YOUTUBE_HOME);
});

youtubeTab.addEventListener("click", () => {
  setActiveTab("youtube");
});

aToolTab.addEventListener("click", () => {
  setActiveTab("atool");
});

manduTab.addEventListener("click", () => {
  setActiveTab("mandu");
});

alwaysOnTopToggle.addEventListener("change", () => {
  window.overlayApi.setAlwaysOnTop(alwaysOnTopToggle.checked);
});

clickThroughToggle.addEventListener("change", () => {
  const enabled = clickThroughToggle.checked;
  window.overlayApi.setIgnoreMouse(enabled);
  setStatus(enabled ? TEXT.clickThroughOn : TEXT.clickThroughOff);
});

window.overlayApi.onClickThroughChanged((enabled) => {
  clickThroughToggle.checked = Boolean(enabled);
  setStatus(enabled ? TEXT.clickThroughOn : TEXT.clickThroughOff);
});

opacityRange.addEventListener("input", () => {
  opacityText.textContent = `투명도 ${opacityRange.value}%`;
  window.overlayApi.setOpacity(opacityRange.value);
});

document.querySelectorAll("[data-size]").forEach((button) => {
  button.addEventListener("click", () => {
    const [width, height] = button.dataset.size.split("x").map(Number);
    window.overlayApi.resizeWindow(width, height);
  });
});

backBtn.addEventListener("click", () => {
  if (youtubeView && !backBtn.disabled) {
    youtubeView.goBack();
  }
});

forwardBtn.addEventListener("click", () => {
  if (youtubeView && !forwardBtn.disabled) {
    youtubeView.goForward();
  }
});

attachYoutubeView(youtubeUrl);
setActiveTab("youtube");
updateYoutubeNavButtons();
window.overlayApi.setAlwaysOnTop(true);
window.overlayApi.setOpacity(opacityRange.value);
