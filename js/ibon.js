// IBON 搶票腳本

// 監聽 Shadow DOM 就緒事件
let shadowDOMContent = null;
document.addEventListener("__ibonShadowDOMReady__", (event) => {
  shadowDOMContent = event.detail.shadowHTML;
  const tempContainer = document.createElement("div");
  tempContainer.innerHTML = shadowDOMContent;
  window.__ibonShadowContainer__ = tempContainer;
});

$(() => {
  chrome.storage.local.get(
    [
      "ibon_quick",
      "ibon_date",
      "ibon_time",
      "ibon_auto",
      "ibon_area",
      "ibon_area2",
      "ibon_area3",
      "ibon_area4",
      "ibon_omg",
      "ibon_nokeep",
      "ibon_autosend",
      "ibon_ticketcount",
    ],
    (result) => {
      // 日期檢查只影響 ActivityInfo 頁面
      const isActivityInfoPage =
        window.location.href.indexOf("ActivityInfo/Details") > 0;
      if (
        isActivityInfoPage &&
        (result.ibon_date == null || result.ibon_date == "")
      ) {
        result.ibon_quick = false;
      }

      if (!result.ibon_quick) return;

      let areaSelectionStarted = false;

      // 輪詢機制偵測頁面狀態
      let pageDetectionInterval = setInterval(() => {
        const stepGridText = $("div[class='step-grid active']").text();
        const isSelectArea = stepGridText.indexOf("選擇票區") > 0;

        if (
          isSelectArea &&
          !areaSelectionStarted &&
          window.__ibonShadowContainer__
        ) {
          clearInterval(pageDetectionInterval);
          areaSelectionStarted = true;
          startAreaSelection(result);
        }
      }, 300);

      // 選擇票區邏輯
      function startAreaSelection(result) {
        let checkmap = setInterval(() => {
          if (result.ibon_auto == "human") {
            $("#ctl00_ContentPlaceHolder1_BUY_TYPE_1").click();
          }

          let arealist = [
            result.ibon_area,
            result.ibon_area2,
            result.ibon_area3,
            result.ibon_area4,
          ];
          let findout = false;
          let seatwrap;

          if (window.__ibonShadowContainer__) {
            let tableInContainer =
              window.__ibonShadowContainer__.querySelector("table");
            if (tableInContainer) {
              seatwrap = $(tableInContainer).find("tbody tr");
            }
          }

          if (!seatwrap || seatwrap.length === 0) return;

          // 按優先順序選擇座位
          for (let i = 0; i < 4; i++) {
            if (findout) break;
            if (arealist[i] && arealist[i] != "") {
              seatwrap.each((k, e) => {
                if ($(e).find("td[class=action]").length > 0) {
                  let getnum = parseInt(
                    $(e).find("td[class=action]").find("span").text()
                  );
                  if (isNaN(getnum) || getnum >= result.ibon_ticketcount) {
                    const rowText = $(e).text().replaceAll(" ", "");
                    const searchText = arealist[i].replaceAll(" ", "");

                    if (
                      rowText.includes(searchText) ||
                      rowText
                        .replaceAll("區", "")
                        .includes(searchText.replaceAll("區", ""))
                    ) {
                      const clickEvent = new CustomEvent("__ibonClickSeat__", {
                        detail: { seatId: $(e).attr("id") },
                      });
                      document.dispatchEvent(clickEvent);
                      findout = true;
                      clearInterval(checkmap);
                      return false;
                    }
                  }
                }
              });
            }
          }

          // 只求有票模式
          if (result.ibon_omg && !findout) {
            seatwrap.each((k, e) => {
              if ($(e).find("td[class=action]").length > 0) {
                let getnum = parseInt(
                  $(e).find("td[class=action]").find("span").text()
                );
                if (isNaN(getnum) || getnum >= result.ibon_ticketcount) {
                  const clickEvent = new CustomEvent("__ibonClickSeat__", {
                    detail: { seatId: $(e).attr("id") },
                  });
                  document.dispatchEvent(clickEvent);
                  findout = true;
                  clearInterval(checkmap);
                  return false;
                }
              }
            });
          }
        }, 500);
      }

      // 活動資訊頁面 - 自動選場次
      if (window.location.href.indexOf("ActivityInfo/Details") > 0) {
        let tryget = setInterval(function () {
          let showlist = $("#GameInfoList").children("div");
          if (showlist.length > 0) {
            showlist.each((k, e) => {
              if (
                $(e)
                  .text()
                  .replaceAll("-", "/")
                  .includes(result.ibon_date.replaceAll("-", "/")) &&
                $(e).text().includes(result.ibon_time)
              ) {
                if ($(e).find("button").length > 0) {
                  let element = $(e).find("button")[0];
                  if ("createEvent" in document) {
                    var evt = document.createEvent("HTMLEvents");
                    evt.initEvent("click", false, true);
                    element && element.dispatchEvent(evt);
                  } else {
                    element.fireEvent("click");
                  }
                  clearInterval(tryget);
                } else {
                  RefreshActivityInfo();
                }
              }
            });
          } else {
            RefreshActivityInfo();
          }
        }, 500);
      }
      // 選擇票區頁面
      else if (
        $("div[class='step-grid active']").text().indexOf("選擇票區") > 0
      ) {
        let checkmap = setInterval(() => {
          if (result.ibon_auto == "human") {
            $("#ctl00_ContentPlaceHolder1_BUY_TYPE_1").click();
          }

          let arealist = [
            result.ibon_area,
            result.ibon_area2,
            result.ibon_area3,
            result.ibon_area4,
          ];
          let findout = false;
          let seatwrap;

          if (window.__ibonShadowContainer__) {
            let tableInContainer =
              window.__ibonShadowContainer__.querySelector("table");
            if (tableInContainer) {
              seatwrap = $(tableInContainer).find("tbody tr");
            }
          }

          if (!seatwrap || seatwrap.length === 0) return;

          for (let i = 0; i < 4; i++) {
            if (findout) break;
            if (arealist[i] != "") {
              seatwrap.each((k, e) => {
                if ($(e).find("td[class=action]").length > 0) {
                  let getnum = parseInt(
                    $(e).find("td[class=action]").find("span").text()
                  );
                  if (
                    isNaN(getnum) ? true : getnum >= result.ibon_ticketcount
                  ) {
                    const rowText = $(e).text().replaceAll(" ", "");
                    const searchText = arealist[i].replaceAll(" ", "");

                    if (
                      ($(e).text().includes("區") &&
                        arealist[i].includes("區") &&
                        rowText.includes(searchText)) ||
                      rowText
                        .replaceAll("區", "")
                        .includes(searchText.replaceAll("區", ""))
                    ) {
                      const clickEvent = new CustomEvent("__ibonClickSeat__", {
                        detail: { seatId: $(e).attr("id") },
                      });
                      document.dispatchEvent(clickEvent);
                      findout = true;
                      clearInterval(checkmap);
                    }
                  }
                }
              });
            }
          }

          if (result.ibon_omg && !findout) {
            seatwrap.each((k, e) => {
              if ($(e).find("td[class=action]").length > 0) {
                let getnum = parseInt(
                  $(e).find("td[class=action]").find("span").text()
                );
                if (isNaN(getnum) ? true : getnum >= result.ibon_ticketcount) {
                  let element = document.getElementById($(e).attr("id"));
                  if ("createEvent" in document) {
                    var evt = document.createEvent("HTMLEvents");
                    evt.initEvent("click", false, true);
                    element && element.dispatchEvent(evt);
                    findout = true;
                    clearInterval(checkmap);
                  } else {
                    element.fireEvent("click");
                    findout = true;
                    clearInterval(checkmap);
                  }
                }
              }
            });
          }
        }, 1000);
      }
      // 座位/數量頁面
      else if (
        $("div[class='step-grid active']").text().indexOf("座位/數量") > 0
      ) {
        if (result.ibon_nokeep) {
          $("#ctl00_ContentPlaceHolder1_notConsecutive").click();
        }
        if (result.ibon_auto != "human") {
          let maxcount =
            $($("#ctl00_ContentPlaceHolder1_DataGrid").find("select")[0]).find(
              "option"
            ).length - 1;
          if (maxcount >= result.ibon_ticketcount) {
            $("#ctl00_ContentPlaceHolder1_DataGrid_ctl02_AMOUNT_DDL").val(
              result.ibon_ticketcount
            );
          } else {
            $("#ctl00_ContentPlaceHolder1_DataGrid_ctl02_AMOUNT_DDL").val(
              maxcount
            );
          }
          if (result.ibon_autosend) {
            if ($("i[class='fas fa-user']").length > 0) {
              alert("未登入，請自行送出");
            } else {
              var theForm = document.forms["aspnetForm"];
              if (!theForm) theForm = document.aspnetForm;
              let element = $("#content").find(
                "a[onclick='showProcess();']"
              )[0];
              if ("createEvent" in document) {
                var evt = document.createEvent("HTMLEvents");
                evt.initEvent("click");
                element && element.dispatchEvent(evt);
              } else {
                element.fireEvent("click");
              }
              if (
                element &&
                (!theForm.onsubmit || theForm.onsubmit() != false)
              ) {
                theForm.__EVENTTARGET.value = element.href
                  .match(/(\(')(.*)(',)/g)[0]
                  .split("'")[1];
                theForm.__EVENTARGUMENT.value = "";
                theForm.submit();
              }
            }
          }
        }
      }
      // 選擇活動/商品頁面
      else if (
        $("div[class='step-grid active']").text().indexOf("選擇活動/商品") > 0
      ) {
        if (result.ibon_auto != "human") {
          let maxcount =
            $($("#ctl00_ContentPlaceHolder1_DataGrid").find("select")[0]).find(
              "option"
            ).length - 1;
          if (maxcount >= result.ibon_ticketcount) {
            $("#ctl00_ContentPlaceHolder1_DataGrid_ctl02_AMOUNT_DDL").val(
              result.ibon_ticketcount
            );
          } else {
            $("#ctl00_ContentPlaceHolder1_DataGrid_ctl02_AMOUNT_DDL").val(
              maxcount
            );
          }
          if (result.ibon_autosend) {
            if ($("i[class='fas fa-user']").length > 0) {
              alert("未登入，請自行送出");
            } else {
              var theForm = document.forms["aspnetForm"];
              if (!theForm) theForm = document.aspnetForm;
              let element = $("#content").find(
                "a[onclick='showProcess();']"
              )[0];
              if ("createEvent" in document) {
                var evt = document.createEvent("HTMLEvents");
                evt.initEvent("click");
                element && element.dispatchEvent(evt);
              } else {
                element.fireEvent("click");
              }
              if (
                element &&
                (!theForm.onsubmit || theForm.onsubmit() != false)
              ) {
                theForm.__EVENTTARGET.value = element.href
                  .match(/(\(')(.*)(',)/g)[0]
                  .split("'")[1];
                theForm.__EVENTARGUMENT.value = "";
                theForm.submit();
              }
            }
          }
        }
      }
    }
  );
});
