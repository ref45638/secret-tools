$(() => {
  chrome.storage.local.get(
    [
      //取得瀏覽器擴充本地儲存
      "pokemon_status",
      "pokemon_date",
    ],
    (data) => {
      // 啟動
      console.log("pokemon!!!!", data.pokemon_status ? "ON" : "OFF");

      if (data.pokemon_status && data.pokemon_date != "") {
        if (window.location.href == "https://osaka.pokemon-cafe.jp/") {
          $(".agreeChecked").click();
          $(".button-container-agree").find("button").click();
        } else if (window.location.href.indexOf("reserve/auth_confirm") > 0) {
          $("a")[0].click();
        } else if (window.location.href.indexOf("step1") > 0) {
          let messageDiv = document.createElement("div");
          $(messageDiv).attr("style", "display: flex; position: fixed; color: red; top: 0; font-size: 32px; font-weight: bold;");
          $("body").append(messageDiv);

          var interval = setInterval(() => {
            var diff = get_timeDifference(data.pokemon_date + " 17:00:00");
            if (diff == "") {
              clearInterval(interval);
              $(messageDiv).text("");
              doReservation();
            } else {
              $(messageDiv).text("倒數:" + diff);
            }
          }, 100);
        } else if (window.location.href.indexOf("step2") > 0) {
          let timeCell = $(".time-cell")
            .map((i, e) => {
              if ($(e).text().indexOf("A席17:30") > -1) {
                return e;
              }
            });
            timeCell[Math.floor(Math.random() * timeCell.length)].click();
        }
      }
    }
  );
});

var doReservation = () => {
  console.info("doReservation");
  chrome.storage.local.get(
    [
      //取得瀏覽器擴充本地儲存
      "pokemon_date",
      "pokemon_people",
      "pokemon_name",
      "pokemon_phone",
      "pokemon_email",
    ],
    (data) => {
      if ($("select").val() == "0") {
        $("select").val(data.pokemon_people);
        $("form").submit();
      }

      if (new Date(data.pokemon_date).getMonth() != new Date().getMonth()) {
        let interval = setInterval(() => {
          if ($(".calendar-pager").length >= 2) {
            clearInterval(interval);
            setTimeout(() => {
              // 下個月
              $(".calendar-pager")[1].click();

              // 選日期
              $(".calendar-day-cell").map((i, e) => {
                if ($(e).text().indexOf(new Date(data.pokemon_date).getDate()) > -1) {
                  $(e).click();
                }
              });

              $("input[name=commit]").click();
            }, 200);
          }
        }, 100);
      }
    }
  );
};

var formatDate = (date) => {
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();

  if (day < 10) {
    day = "0" + day;
  }

  if (month < 10) {
    month = `0${month}`;
  }

  return `${year}-${month}-${day}`;
};

let get_timeDifference = (strtdatetime) => {
  var datetime = new Date(strtdatetime).setHours(17);
  var now = new Date().setDate(new Date().getDate() + 31);

  if (isNaN(datetime)) {
    return "";
  }

  if (datetime <= now) {
    return "";
  } else {
    var milisec_diff = datetime - now;
  }

  var days = Math.floor(milisec_diff / 1000 / 60 / (60 * 24));

  var msec = milisec_diff;
  var hh = Math.floor(msec / 1000 / 60 / 60);
  msec -= hh * 1000 * 60 * 60;
  var mm = Math.floor(msec / 1000 / 60);
  msec -= mm * 1000 * 60;
  var ss = Math.floor(msec / 1000);
  msec -= ss * 1000;

  var daylabel = "";
  if (days > 0) {
    var hrreset = days * 24;
    hh = hh - hrreset;
    daylabel = days + "天 ";
  }

  //  Format Hours
  var hourtext = "00";
  hourtext = String(hh);
  if (hourtext.length == 1) {
    hourtext = "0" + hourtext;
  }

  //  Format Minutes
  var mintext = "00";
  mintext = String(mm);
  if (mintext.length == 1) {
    mintext = "0" + mintext;
  }

  //  Format Seconds
  var sectext = "00";
  sectext = String(ss);
  if (sectext.length == 1) {
    sectext = "0" + sectext;
  }

  return daylabel + hourtext + ":" + mintext + ":" + sectext;
};
