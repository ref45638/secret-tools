console.log("HOLO!!!!");

var interval = new Map();

$(() => {
  chrome.storage.local.get(
    [
      //取得瀏覽器擴充本地儲存
      "holo_status",
      "holo_date_input",
      "holo_store",
    ],
    (data) => {
      // 啟動
      if (data.holo_status && data.holo_date_input.length > 0 && data.holo_date_input[0] != "") {
        if (window.location.href.indexOf("product") > 0) {
          for (var i = 0; i < data.holo_store.length; i += 1) {
            var product_id = window.location.href.substring(
              window.location.href.indexOf("product/") + 8,
              window.location.href.indexOf("product/") + 9
            );

            var doTimeout = (store_id, product_id) => {
              setTimeout(() => {
                createInterval(store_id, product_id, data.holo_date_input);
              }, 1000 * i);
            };

            doTimeout(data.holo_store[i], product_id);
          }
        }
      }
    }
  );
});

var createInterval = (store_id, product_id, dates) => {
  var start_date = formatDate(new Date());
  var end_date = formatDate(new Date(new Date().setMonth(new Date().getMonth() + 1)));

  console.info("createInterval", store_id, product_id);

  interval[store_id] = setInterval(() => {
    $.ajax({
      url: "https://api.holoface.photos/booking/available_slots",
      method: "post",
      dataType: "json",
      contentType: "application/json",
      data:
        '{"available_slots":{"store_id":' +
        store_id +
        ',"opted_products":[{"id":' +
        product_id +
        ',"qty":1}],"start_date":"' +
        start_date +
        '","end_date":"' +
        end_date +
        '","offset":0,"limit":5000}}',
      success: function (res) {
        if (res.next_available_date != null) {
          var message = "";
          for (var i = 0; i < res.available_slots.length; i++) {
            if (res.available_slots[i].start_times.length > 0) {
              for (var j = 0; j < dates.length; j++) {
                if (res.available_slots[i].date == dates[j]) {
                  message += res.available_slots[i].date + " " + res.available_slots[i].start_times + "\n";
                }
              }
            }
          }
          if (message == "") {
            console.info(message);
          } else {
            console.info(store_id, dates, "not found");
          }
        } else {
          console.info(store_id, dates, "not found");
        }
      },
      error: function (err) {
        console.log("ajax error:" + err.Message);
      },
    });
  }, 5000);
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
