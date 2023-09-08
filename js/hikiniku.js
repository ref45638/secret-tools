$(() => {
  chrome.storage.local.get(
    [
      //取得瀏覽器擴充本地儲存
      "hikiniku_status",
      "hikiniku_num",
      "hikiniku_priority",
      "hikiniku_now_index",
    ],
    async (data) => {
      console.log(data);

      var dash = window.location.href.indexOf("-") !== -1;

      if (data.hikiniku_status) {
        // 流量被限，重整
        if ($("body").html().indexOf("由於網站湧入大量流量") !== -1) {
          setTimeout(() => {
            window.location.reload(true);
          }, 1000);
        }

        if (window.location.href.indexOf("categories/hikiniku-reservation") !== -1) {
          var found = false;
          data.hikiniku_priority.map((priority) => {
            $(".Product-item").each((i, product) => {
              var week = $(product)
                .attr("ga-product")
                .substring($(product).attr("ga-product").indexOf("(") + 1, $(product).attr("ga-product").indexOf(")"));

              // 未售完
              if (week == numToWeek(priority.week) && !$(product).find(".boxify-image").hasClass("out-of-stock")) {
                product.click();
                found = true;
              }
            });
          });
          if (!found) {
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        } else if (window.location.href.indexOf("products/reservation") !== -1) {
          var week =
            parseInt(
              window.location.href.substring(window.location.href.indexOf("products/reservation") + (dash ? 21 : 20)) != ""
                ? window.location.href.substring(window.location.href.indexOf("products/reservation") + (dash ? 21 : 20))
                : "0"
            ) + 2;

          var priority_now = null;
          var priority_index = -1;
          if (data.hikiniku_now_index != undefined && data.hikiniku_now_index > -1 && week == data.hikiniku_priority[data.hikiniku_now_index].week) {
            priority_now = data.hikiniku_priority[data.hikiniku_now_index];
            priority_index = data.hikiniku_now_index;
          }

          console.info("Priority_now: " + priority_now);
          console.info("priority_index: " + priority_index);

          var found = false;
          if (priority_now != null) {
            await new Promise(async (done) => {
              if (week == priority_now.week) {
                var i = 0;
                while (!found && i < priority_now.time.length) {
                  found = await clickTimeLabel(priority_now.time[i++], data.hikiniku_num);
                  console.info("Interval found:", found);
                }
                done();
              }
            });
          } else {
            await new Promise((done) => {
              data.hikiniku_priority.map(async (priority, index) => {
                if (week == priority.week) {
                  priority_index = index;

                  var i = 0;
                  while (!found && i < priority.time.length) {
                    found = await clickTimeLabel(priority.time[i++], data.hikiniku_num);
                    console.info("Interval found:", found);
                  }
                  done();
                }
              });
              done();
            });
          }

          if (!found) {
            priority_index = priority_index >= data.hikiniku_priority.length - 1 ? 0 : priority_index + 1;
            var priority = data.hikiniku_priority[priority_index];

            setTimeout(() => {
              chrome.storage.local.set(
                {
                  hikiniku_now_index: priority_index,
                },
                () => {
                  setTimeout(() => {
                    window.location.href =
                      "https://www.fujintreeshop.com/products/reservation" +
                      (priority.week == "2" ? "" : (dash ? "-" : "") + (parseInt(priority.week) - 2));
                  }, 200);
                }
              );
            }, 500);
          }
        } else if (window.location.href.indexOf("cart") !== -1) {
          if (!$(".btn-checkout").hasClass("disabled")) {
            $(".btn-checkout")[0].click();
          }
        } else if (window.location.href.indexOf("checkout") !== -1) {
          // 幫勾一些該勾ㄉ
          $("input[data-e2e-id=order-delivery-recipient-is-customer_checkbox]").prop("checked", "checked");
          $("input[name=policy]").prop("checked", "checked");

          // focus 最後按鈕
          $("#place-order-recaptcha").focus();

          // 幫拉到最底
          setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 500);
        }
        // 測試用
        // else if (
        //   window.location.href.indexOf(
        //     "/products/%E3%80%90%E5%AF%8C%E9%8C%A6%E6%A8%B9%E5%92%96%E5%95%A1%E3%80%91%E6%BF%BE%E6%8E%9B%E5%8C%85%E7%A6%AE%E7%9B%92-1"
        //   ) !== -1
        // ) {
        //   console.info("ASDASDSADADS");

        //   var found = false;
        //   await new Promise(async (done) => {
        //     var i = 0;
        //     while (!found && i < 1) {
        //       found = await clickTimeLabel("「平衡」濾掛包", 2);
        //       console.info("Interval found:", found);
        //       i++;
        //     }
        //     done();
        //   });
        // }
      }
    }
  );
});

clickTimeLabel = async (target_time, hikiniku_num) => {
  var result = false;
  await new Promise((done) => {
    console.info("start clickTimeLabel", target_time);

    var found = false;
    $(".variation-label").each((ii, label) => {
      if (!found && target_time == label.innerHTML.trim()) {
        found = true;
        // 未售完
        if (!$(label).hasClass("variation-label--out-of-stock")) {
          var interval2 = setInterval(() => {
            label.click();

            // 加入人數按鈕出現
            if ($(".btn-checkout").length > 0) {
              clearInterval(interval2);

              // 加入人數按鈕
              for (let i = 0; i < hikiniku_num - 1; i++) {
                $(".btn-checkout")[1].click();
              }

              if ($(".txt-sold-out").parent().css("display") == "block") {
                result = false;
                done();
              } else {
                // 加入購物車 按三次
                $("button[id=btn-main-checkout]").click();
                var interval3 = setInterval(() => {
                  // 購物車有加進去
                  if ($("#btn-checkout").parent().parent().parent().parent().parent().css("display") == "block") {
                    $("#btn-checkout").click(); // 會跳頁
                    done();
                    result = true;
                    return;
                  } else {
                    // 沒加進 多按幾次試試
                    $("button[id=btn-main-checkout]").click();
                  }
                }, 500);
                setTimeout(() => {
                  clearInterval(interval3);

                  if ($(".txt-sold-out").parent().css("display") == "block") result = false;
                  else result = true;

                  done();
                }, 1000);
              }
            }
          }, 100);
        } else {
          done();
        }
      }
    });
    done();
  });

  return result;
};

numToWeek = (week) => {
  switch (week) {
    case "2":
      return "二";
    case "3":
      return "三";
    case "4":
      return "四";
    case "5":
      return "五";
    case "6":
      return "六";
    case "7":
      return "日";
  }
};
