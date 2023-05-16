var interval = setInterval(() => {
  console.info("detect");
  if (new Date().getMinutes() == 0) {
    window.location.reload();
  }
}, 1000 * 60);

$(() => {
  chrome.storage.local.get(
    [
      //取得瀏覽器擴充本地儲存
      "cpbl_status",
      "cpbl_sp",
      "cpbl_rp",
      "cpbl_cp",
      "cpbl_c",
      "cpbl_1b",
      "cpbl_2b",
      "cpbl_3b",
      "cpbl_ss",
      "cpbl_of",
      "cpbl_dh",
      "cpbl_hr",
    ],
    (data) => {
      if (data.cpbl_status) {
        $(".positionPC_WY9fb")
          .find(".tab")
          .each((i, tab) => {
            let value;
            switch (i) {
              case 0:
                value = data.cpbl_sp;
                break;
              case 1:
                value = data.cpbl_rp;
                break;
              case 2:
                value = data.cpbl_cp;
                break;
              case 3:
                value = data.cpbl_c;
                break;
              case 4:
                value = data.cpbl_1b;
                break;
              case 5:
                value = data.cpbl_2b;
                break;
              case 6:
                value = data.cpbl_3b;
                break;
              case 7:
                value = data.cpbl_ss;
                break;
              case 8:
                value = data.cpbl_of;
                break;
              case 9:
                value = data.cpbl_dh;
                break;
              case 10:
                value = data.cpbl_hr;
                break;
            }

            setTimeout(() => {
              tab.click();
              setTimeout(() => {
                if (i != 8 && i != 10) {
                  $(".allvote")
                    .find(".box")
                    .each((j, box) => {
                      if ($(box).find(".nameBox").text() == value) {
                        $(box).find(".vote").click();
                        return false;
                      }
                    });
                } else {
                  for (let j = 0; j < value.length; j++) {
                    $(".allvote")
                      .find(".box")
                      .each((k, box) => {
                        if ($(box).find(".nameBox").text() == value[j]) {
                          $(box).find(".vote").click();
                          return false;
                        }
                      });
                  }
                }
              }, 300);
            }, 1000 * (i + 1));
          });

        //送出
        setTimeout(() => {
          $(".sendBtn").click();
          setTimeout(() => {
            $(".send").click();
          }, 500);
        }, 1000 * ($(".positionPC_WY9fb").find(".tab").length + 1) + 500);
      }
    }
  );
});
