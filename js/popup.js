var _uuid = () => {
  var s4 = () => {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  };
  return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
};

$("#holo_data_add").on("click", () => {
  $("#holo_date_div").append(
    `
    <div class="row mb-3" id="holo_date_` +
      _uuid() +
      `">
      <div class="col-10">
        <input type="date" class="form-control" id="holo_date_input" name="holo_date_input" />
      </div>
      <div class="col-1">
        <button type="button" class="btn btn-danger holo_data_delete"><i class="fa fa-times"></i></button>
      </div>
    </div>
  `
  );

  $(".holo_data_delete").on("click", (e) => {
    e.stopPropagation();
    e.stopImmediatePropagation();
    e.target.closest(".row").remove();
  });
});

// holo
$("#holo_save").on("click", () => {
  document.getElementById("successIcon").style.display = "none";

  chrome.storage.local.set(
    {
      holo_status: $("input[name=holo_status]").prop("checked"),
      holo_date_input: $('input[name="holo_date_input"]')
        .map((i, e) => {
          return $(e).val();
        })
        .get(),
      holo_store: $('input[name="holo_store"]')
        .map((i, e) => {
          if ($(e).prop("checked")) {
            return $(e).val();
          }
        })
        .get(),
      holo_is_not_self: $('input[name="holo_is_not_self"]').prop("checked"),
      holo_client_name: $('input[name="holo_client_name"]').val(),
      holo_client_phone: $('input[name="holo_client_phone"]').val(),
      holo_client_email: $('input[name="holo_client_email"]').val(),
      holo_client_birthday: $('input[name="holo_client_birthday"]').val(),
      holo_client_gender: $('select[name="holo_client_gender"]').val(),
    },
    () => {
      // $("#railway_test").val("儲存完畢");
      setTimeout(() => {
        console.info("儲存成功");
        document.getElementById("successIcon").style.display = "inline";
        if (
          $('input[name="holo_client_name"]').val() == "" ||
          $('input[name="holo_client_phone"]').val() == "" ||
          $('input[name="holo_client_email"]').val() == "" ||
          $('input[name="holo_client_birthday"]').val() == "" ||
          $('select[name="holo_client_gender"]').val() == ""
        ) {
          document.getElementById("successIcon").innerHTML = "&#10003;儲存成功，但預約者資料未填妥，無法自動預約";
        }
      }, 200);
    }
  );
});

$(() => {
  chrome.storage.local.get(
    [
      //取得瀏覽器擴充本地儲存
      "holo_status",
      "holo_date_input",
      "holo_store",
      "holo_is_not_self",
      "holo_client_name",
      "holo_client_phone",
      "holo_client_email",
      "holo_client_birthday",
      "holo_client_gender",
    ],
    (data) => {
      if (data.holo_status) {
        $("input[name=holo_status]").prop("checked", "checked");
      }

      if (data.holo_date_input != undefined && data.holo_date_input.length > 0) {
        for (let i = 0; i < data.holo_date_input.length; i++) {
          if (i == 0) {
            $("input[name=holo_date_input]").val(data.holo_date_input[i]);
          } else {
            var uuid = _uuid();
            $("#holo_date_div").append(
              `
                <div class="row mb-3" id="holo_date_` +
                uuid +
                `">
                  <div class="col-10">
                    <input type="date" class="form-control" id="holo_date_input" name="holo_date_input" />
                  </div>
                  <div class="col-1">
                    <button type="button" class="btn btn-danger holo_data_delete"><i class="fa fa-times"></i></button>
                  </div>
                </div>
              `
            );

            $("#holo_date_" + uuid)
              .find("input[name=holo_date_input]")
              .val(data.holo_date_input[i]);
          }
        }
      }

      if (data.holo_store != undefined && data.holo_store.length > 0) {
        for (let i = 0; i < data.holo_store.length; i++) {
          $('input[name="holo_store"]').each((i, e) => {
            if ($(e).val() == data.holo_store[i]) $(e).prop("checked", "checked");
          });
        }
      }

      if (data.holo_is_not_self) $('input[name="holo_is_not_self"]').prop("checked", "checked");
      $('input[name="holo_client_name"]').val(data.holo_client_name);
      $('input[name="holo_client_phone"]').val(data.holo_client_phone);
      $('input[name="holo_client_email"]').val(data.holo_client_email);
      $('input[name="holo_client_birthday"]').val(data.holo_client_birthday);
      $('select[name="holo_client_gender"]').val(data.holo_client_gender);
    }
  );
});
