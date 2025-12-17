/**
 * L-Tike (ローソンチケット) 自動化腳本
 * 用於 WBC 2026 / 東京巨蛋等票券搶購
 * 模擬人類操作行為
 */

$(() => {
  chrome.storage.local.get(
    [
      "ltike_status",
      "ltike_match_button", // 賽事按鈕 ID (ENTRY_DETAIL_BUTTON_0, _3, _4, _6)
      "ltike_event_id", // event000001
      "ltike_select_date", // 20260306_0000
      "ltike_pf_key", // 20251106000002076542
      "ltike_venue_cd", // 39911
      "ltike_seat_type", // 外野指定席レフト
      "ltike_seat_type_cd", // 042
      "ltike_auto_entry", // 是否自動點擊受付按鈕
    ],
    (data) => {
      console.log("🎫 L-Tike 自動搶票:", data.ltike_status ? "ON" : "OFF");

      if (!data.ltike_status) return;

      // 顯示狀態訊息
      showStatusMessage("🎫 L-Tike 自動搶票已啟動");

      // 判斷當前頁面並執行對應操作
      const currentUrl = window.location.href;

      if (currentUrl.indexOf("l-tike.com") > -1) {
        // 檢查是否在 sitetop 頁面
        if (currentUrl.indexOf("sitetop") > -1) {
          // Step 0: 在 sitetop 頁面選擇賽事
          handleMatchSelection(data);
        } else {
          // Step 1: 點擊日期/時間連結 (modal_link calenderLink)
          handleDateTimeSelection(data);
        }
      }
    }
  );
});

/**
 * Step 0: 處理賽事選擇 (sitetop 頁面)
 * 點擊「詳細はこちら」按鈕
 */
const handleMatchSelection = async (data) => {
  const matchButtonId = data.ltike_match_button;

  if (!matchButtonId) {
    showStatusMessage("⚠️ 未設定賽事，請在設定中選擇");
    return;
  }

  showStatusMessage("🏟️ 正在尋找賽事按鈕...");

  // 等待頁面完全載入
  await sleep(humanDelay(300, 500));

  // 尋找對應的按鈕
  const button = document.getElementById(matchButtonId);

  if (button) {
    const matchNames = {
      ENTRY_DETAIL_BUTTON_0: "澳洲 vs 台灣",
      ENTRY_DETAIL_BUTTON_3: "日本 vs 台灣",
      ENTRY_DETAIL_BUTTON_4: "捷克 vs 台灣",
      ENTRY_DETAIL_BUTTON_6: "台灣 vs 日本",
    };

    const matchName = matchNames[matchButtonId] || matchButtonId;
    showStatusMessage(`🎯 找到賽事: ${matchName}`);

    await humanScroll(button);
    await sleep(humanDelay(200, 400));
    await humanClick(button);

    showStatusMessage("✅ 已點擊「詳細はこちら」，等待頁面跳轉...");
  } else {
    showStatusMessage(`❌ 找不到按鈕: ${matchButtonId}`);
  }
};

/**
 * 模擬人類操作的隨機延遲
 * @param {number} min - 最小延遲毫秒
 * @param {number} max - 最大延遲毫秒
 */
const humanDelay = (min = 50, max = 150) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * 模擬人類的滾動行為
 * @param {Element} element - 目標元素
 */
const humanScroll = (element) => {
  return new Promise((resolve) => {
    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    setTimeout(resolve, humanDelay(200, 400));
  });
};

/**
 * 模擬人類點擊 (加入隨機延遲和滑鼠事件)
 * @param {Element} element - 要點擊的元素
 */
const humanClick = async (element) => {
  // 模擬滑鼠移動到元素上
  const mouseoverEvent = new MouseEvent("mouseover", {
    bubbles: true,
    cancelable: true,
    view: window,
  });
  element.dispatchEvent(mouseoverEvent);

  await sleep(humanDelay(30, 80));

  // 模擬 mousedown
  const mousedownEvent = new MouseEvent("mousedown", {
    bubbles: true,
    cancelable: true,
    view: window,
  });
  element.dispatchEvent(mousedownEvent);

  await sleep(humanDelay(50, 100));

  // 實際點擊
  element.click();

  // 模擬 mouseup
  const mouseupEvent = new MouseEvent("mouseup", {
    bubbles: true,
    cancelable: true,
    view: window,
  });
  element.dispatchEvent(mouseupEvent);
};

/**
 * Sleep 函數
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 顯示狀態訊息
 */
const showStatusMessage = (message) => {
  let statusDiv = document.getElementById("ltike-status-message");
  if (!statusDiv) {
    statusDiv = document.createElement("div");
    statusDiv.id = "ltike-status-message";
    statusDiv.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      padding: 15px 25px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-size: 14px;
      font-weight: bold;
      border-radius: 8px;
      z-index: 99999;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(statusDiv);

    // 添加動畫樣式
    const style = document.createElement("style");
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
  statusDiv.textContent = message;
};

/**
 * Step 1: 處理日期/時間選擇
 */
const handleDateTimeSelection = async (data) => {
  // 尋找目標時間連結
  const timeLinks = document.querySelectorAll("a.modal_link.calenderLink");

  for (const link of timeLinks) {
    const eventId = link.getAttribute("data-reveal-id");
    const selectDate = link.getAttribute("data-select-date");
    const pfKey = link.getAttribute("data-select_pf_key");
    const venueCd = link.getAttribute("data-select-base_venue_cd");

    // 條件匹配檢查
    const matchEvent = !data.ltike_event_id || eventId === data.ltike_event_id;
    const matchDate = !data.ltike_select_date || selectDate === data.ltike_select_date;
    const matchPfKey = !data.ltike_pf_key || pfKey === data.ltike_pf_key;
    const matchVenue = !data.ltike_venue_cd || venueCd === data.ltike_venue_cd;

    if (matchEvent && matchDate && matchPfKey && matchVenue) {
      showStatusMessage("🎯 找到目標場次，準備點擊...");

      await humanScroll(link);
      await sleep(humanDelay(100, 200));
      await humanClick(link);

      showStatusMessage("✅ 已點擊場次，等待載入...");

      // 等待 modal 彈出後執行 Step 2
      setTimeout(() => handleSeatSelection(data), humanDelay(800, 1200));
      return;
    }
  }

  showStatusMessage("⚠️ 未找到匹配的場次");
};

/**
 * Step 2: 處理座位類型選擇
 */
const handleSeatSelection = async (data) => {
  showStatusMessage("📋 正在尋找座位類型...");

  // 等待 modal 內容載入
  await sleep(humanDelay(300, 500));

  // 尋找目標座位區塊
  const seatBoxes = document.querySelectorAll(".ticketSalesSelectBox2");

  for (const box of seatBoxes) {
    const seatTypeInput = box.querySelector('input[name="c_SEAT_TYPE_CD_HIDDEN"]');
    const seatTypeCd = seatTypeInput ? seatTypeInput.value : null;

    // 取得座位名稱文字
    const seatNameSpan = box.querySelector("span.bold.mt5.ml50");
    const seatName = seatNameSpan ? seatNameSpan.textContent.trim() : "";

    // 條件匹配
    const matchSeatType = !data.ltike_seat_type || seatName.indexOf(data.ltike_seat_type) > -1;
    const matchSeatTypeCd = !data.ltike_seat_type_cd || seatTypeCd === data.ltike_seat_type_cd;

    if (matchSeatType && matchSeatTypeCd) {
      showStatusMessage(`🎫 找到座位: ${seatName}`);

      // 滾動到該區塊
      await humanScroll(box);
      await sleep(humanDelay(200, 400));

      // 點擊整個區塊或內部的 form
      await humanClick(box);

      showStatusMessage("✅ 已選擇座位，等待下一步...");

      // 等待 500ms 後執行 Step 3（根據設定決定是否自動點擊）
      if (data.ltike_auto_entry) {
        setTimeout(() => handleEntryButton(data), 500);
      } else {
        showStatusMessage("⏸️ 已選擇座位，自動點擊受付按鈕已關閉");
      }
      return;
    }
  }

  showStatusMessage("⚠️ 未找到匹配的座位類型，嘗試自動搜尋...");

  // 如果找不到，嘗試點擊第一個可用的座位
  if (seatBoxes.length > 0) {
    await humanScroll(seatBoxes[0]);
    await sleep(humanDelay(200, 400));
    await humanClick(seatBoxes[0]);
    if (data.ltike_auto_entry) {
      setTimeout(() => handleEntryButton(data), 500);
    } else {
      showStatusMessage("⏸️ 已選擇座位，自動點擊受付按鈕已關閉");
    }
  }
};

/**
 * Step 3: 處理受付按鈕點擊
 */
const handleEntryButton = async (data) => {
  showStatusMessage("🔘 正在尋找受付按鈕...");

  // 尋找受付按鈕 (受付前 或 購入/申込)
  const entryButtons = document.querySelectorAll(".c_SEAT_SEL_ENTRY_BUTTON, .entryStsPlanCntEndSite");

  for (const button of entryButtons) {
    const buttonText = button.textContent.trim();

    // 檢查按鈕狀態
    if (buttonText.indexOf("受付前") > -1 || buttonText.indexOf("購入") > -1 || buttonText.indexOf("申込") > -1 || buttonText.indexOf("先着") > -1) {
      showStatusMessage(`🎯 找到按鈕: ${buttonText}`);

      await humanScroll(button);
      await sleep(humanDelay(100, 200));
      await humanClick(button);

      showStatusMessage("🎉 已點擊受付按鈕！請完成後續操作");
      return;
    }
  }

  // 如果是「受付終了」或「售罄」則顯示警告
  const soldOutButtons = document.querySelectorAll(".btnBox04, .soldout");
  if (soldOutButtons.length > 0) {
    showStatusMessage("❌ 該場次已售罄或受付終了");
    return;
  }

  showStatusMessage("⏳ 按鈕尚未出現，持續等待中...");

  // 如果按鈕還沒出現，持續監控
  setTimeout(() => handleEntryButton(data), 500);
};

/**
 * 監控頁面變化 (用於 SPA 動態載入)
 */
const observePageChanges = () => {
  const observer = new MutationObserver((mutations) => {
    // 當 DOM 有變化時，可以在這裡處理
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
};

// 啟動頁面監控
observePageChanges();
