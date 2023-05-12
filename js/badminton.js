var interval = new Map();

var storeMap = { 2: "板橋環球店", 5: "台北南西店", 7: "台北華山概念店", 3: "台中中友店", 4: "高雄義享店" };

$(() => {
  chrome.storage.local.get(
    [
      //取得瀏覽器擴充本地儲存
      "badminton_court_data",
      "badminton_status",
      "badminton_court",
      "badminton_date",
      "badminton_times",
      "badminton_qpids",
      "badminton_processing",
      "badminton_finished",
    ],
    async (data) => {
      // 啟動
      console.log("badminton!!!!", data.badminton_status ? "ON" : "OFF");

      var success_qpid = "";
      var badminton_finished = data.badminton_finished;
      if (window.location.href.indexOf("StepFlag=3") > -1) {
        // 預約結果頁面
        if (window.location.href.indexOf("&X=2&Y=0") > -1) {
          // fail
        } else if (window.location.href.indexOf("&X=1&Y=") > -1) {
          // success
          console.info("data.badminton_processing", data.badminton_processing);
          console.info("data.badminton_finished", data.badminton_finished);
          if (data.badminton_processing != undefined && data.badminton_processing != "" && data.badminton_processing.split("$$").length == 2) {
            success_qpid = data.badminton_processing.split("$$")[0];
            var success_time = data.badminton_processing.split("$$")[1];

            console.info("success_qpid", success_qpid);
            console.info("success_time", success_time);

            data.badminton_processing = "";
            badminton_finished = badminton_finished.concat(success_time);

            await chrome.storage.local.set({
              badminton_processing: "",
              badminton_finished: badminton_finished,
            });
          }

          if (data.badminton_times.length <= badminton_finished.length && data.badminton_court_data != undefined) {
            var badminton_court_data = JSON.parse(data.badminton_court_data);
          }
        }
      }

      if (
        window.location.href.indexOf("StepFlag=25") == -1 && // 預約API
        data.badminton_status &&
        data.badminton_court_data != undefined &&
        data.badminton_court != undefined &&
        data.badminton_date != undefined &&
        data.badminton_times != undefined &&
        data.badminton_times.length > 0
      ) {
        var badminton_court_data = JSON.parse(data.badminton_court_data);

        console.info("AAAAAAAAAAAAAAAAAA");

        if (window.location.href.indexOf("&X=1&Y=") > -1 && data.badminton_times.length <= badminton_finished.length) {
          window.location.href = badminton_court_data[parseInt(data.badminton_court)].baseUrl + "?module=member&files=orderx_mt";
        } else if (window.location.href.indexOf(badminton_court_data[parseInt(data.badminton_court)].baseUrl) > -1) {
          // 訊息DIV
          let messageDiv = document.createElement("div");
          $(messageDiv).attr("style", "display: flex; position: fixed; color: red; top: 0; font-size: 32px; font-weight: bold;");
          $("body").append(messageDiv);

          if ($("#member_login").html().indexOf("登入") > -1) {
            $(messageDiv).text("提醒: 請先登入");
          } else {
            console.info("BBBBBBBBBBBBBBBB");
            var interval = setInterval(() => {
              var diff = get_timeDifference(data.badminton_date, badminton_court_data[parseInt(data.badminton_court)].addDay);
              if (diff == "") {
                clearInterval(interval);
                $(messageDiv).text("");
                doReservation(badminton_court_data[parseInt(data.badminton_court)], data, success_qpid, badminton_finished);
              } else {
                $(messageDiv).text("倒數:" + diff);
              }
            }, 100);
          }
        }
      }
    }
  );
});

let doReservation = (badminton_court_data, data, success_qpid, badminton_finished) => {
  console.info("CCCCCCCCCCCCCCCCCCC");

  let qpid = success_qpid;
  if (qpid == "") {
    if (data.badminton_qpids.length > 0 && data.badminton_qpids[0] == "0") {
      // 不指定場地
      qpid = badminton_court_data.qpid[Math.floor(Math.random() * badminton_court_data.qpid.length)].id;
    } else {
    }
  }

  console.info("data.badminton_times", data.badminton_times);
  console.info("data.badminton_finished", badminton_finished);

  if (data.badminton_times.length <= badminton_finished.length && window.location.href.indexOf("orderx_mt") == -1) {
  } else {
    var time = "";
    for (var i = 0; i < data.badminton_times.length; i++) {
      if (badminton_finished.length > 0) {
        if (!badminton_finished.includes(data.badminton_times[i])) {
          time = data.badminton_times[i];
          break;
        }
      } else {
        time = data.badminton_times[i];
        break;
      }
    }

    if (qpid != "" && time != "") {
      chrome.storage.local.set(
        {
          badminton_processing: qpid + "$$" + time,
        },
        () => {
          window.location =
            badminton_court_data.baseUrl +
            "?module=net_booking&files=booking_place&StepFlag=25&QPid=" +
            qpid +
            "&QTime=" +
            time +
            "&PT=1&D=" +
            data.badminton_date.replaceAll("-", "/");
        }
      );
    }
  }
};

let get_timeDifference = (strtdatetime, addDay) => {
  var datetime = new Date(strtdatetime).setHours(0);
  var now = new Date().setDate(new Date().getDate() + addDay);

  if (isNaN(datetime)) {
    return "";
  }

  //console.log(datetime + " " + now);

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
