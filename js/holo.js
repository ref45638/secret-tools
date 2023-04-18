var interval = new Map();

var storeMap = { 2: "板橋環球店", 5: "台北南西店", 7: "台北華山概念店", 3: "台中中友店", 4: "高雄義享店" };

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
      console.log("HOLO!!!!", data.holo_status ? "ON" : "OFF");

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

  interval.set(
    store_id,
    setInterval(() => {
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
        success: (res) => {
          if (res.next_available_date != null) {
            for (var i = 0; i < res.available_slots.length; i++) {
              var found = false;
              if (res.available_slots[i].start_times.length > 0) {
                for (var j = 0; j < dates.length; j++) {
                  if (res.available_slots[i].date == dates[j]) {
                    for (var k = 0; k < res.available_slots[i].start_times.length; k++) {
                      found = true;
                      doReserve(store_id, product_id, res.available_slots[i].date, res.available_slots[i].start_times[k].substring(0, 5));
                    }
                  }
                }
              }
            }

            if (!found) {
              console.info(storeMap[store_id], dates, "not found");
            }
          } else {
            console.info(storeMap[store_id], dates, "not found");
          }
        },
        error: (err) => {
          console.log("ajax error:" + err.Message);
        },
      });
    }, 5000)
  );
};

var doReserve = (store_id, product_id, date, time) => {
  chrome.storage.local.get(
    [
      //取得瀏覽器擴充本地儲存
      "holo_is_not_self",
      "holo_client_name",
      "holo_client_phone",
      "holo_client_email",
      "holo_client_birthday",
      "holo_client_gender",
    ],
    (data) => {
      $.ajax({
        url: "https://api.holoface.photos/booking",
        method: "post",
        dataType: "json",
        contentType: "application/json",
        data:
          '{"store_id":' +
          store_id +
          ',"opted_products":[{"id":' +
          product_id +
          ',"qty":1}],"date":"' +
          date +
          '","start_time":"' +
          time +
          '","client_name":"' +
          data.holo_client_name +
          '","client_email":"' +
          data.holo_client_email +
          '","client_phone":"' +
          data.holo_client_phone +
          '","client_birthday":"' +
          data.holo_client_birthday +
          '","client_gender":' +
          data.holo_client_gender +
          ',"is_not_self":' +
          data.holo_is_not_self +
          ',"update_profile":false}',
        beforeSend: (xhr) => {
          xhr.setRequestHeader(
            "Authorization",
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMWMxNTRmNWUtZDhkYi0xMWVkLTkxNjctNDIwMGE5ZmUwMTAyIiwiZXhwIjoxNjk1NzgyMzA5LCJzdWIiOiJhY2Nlc3MifQ.lHgSn6AKI2KsMnfeSTLHVh1BDSYqMGyEU91iighUQus"
          );
        },
        success: (res) => {
          console.info("預約成功", storeMap[store_id], product_id, date, time);
          console.info(res);
        },
        error: (err) => {
          console.log("ajax error:" + err.Message);
        },
      });
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
