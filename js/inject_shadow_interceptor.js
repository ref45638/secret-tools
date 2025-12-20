// Shadow DOM 攔截器 - 在頁面上下文中執行，攔截 Shadow DOM 的建立
(function () {
  "use strict";

  const originalAttachShadow = Element.prototype.attachShadow;
  window.__shadowRoots__ = new Map();

  Element.prototype.attachShadow = function (init) {
    const shadowRoot = originalAttachShadow.call(this, init);
    window.__shadowRoots__.set(this, shadowRoot);

    const observer = new MutationObserver(() => {
      // 檢查 AreaTable 內的座位表格
      const areaTable = document.getElementById("AreaTable");
      if (areaTable && areaTable.contains(this)) {
        const table = shadowRoot.querySelector("table");
        if (table) {
          const event = new CustomEvent("__ibonShadowDOMReady__", {
            detail: {
              shadowHTML: shadowRoot.innerHTML,
              hostElement: this.outerHTML,
            },
          });
          document.dispatchEvent(event);
          observer.disconnect();
        }
      }
    });

    observer.observe(shadowRoot, { childList: true, subtree: true });

    // 立即檢查
    setTimeout(() => {
      const areaTable = document.getElementById("AreaTable");
      if (areaTable && areaTable.contains(this)) {
        const table = shadowRoot.querySelector("table");
        if (table) {
          const event = new CustomEvent("__ibonShadowDOMReady__", {
            detail: {
              shadowHTML: shadowRoot.innerHTML,
              hostElement: this.outerHTML,
            },
          });
          document.dispatchEvent(event);
        }
      }
    }, 500);

    return shadowRoot;
  };

  // 監聽座位點擊請求
  document.addEventListener("__ibonClickSeat__", (event) => {
    for (let [host, shadowRoot] of window.__shadowRoots__) {
      const element = shadowRoot.getElementById(event.detail.seatId);
      if (element) {
        element.click();
        return;
      }
    }
  });
})();
