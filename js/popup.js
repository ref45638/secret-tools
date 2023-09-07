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
  document.getElementById("holo_successIcon").style.display = "none";

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
        document.getElementById("holo_successIcon").style.display = "inline";
        if (
          $('input[name="holo_client_name"]').val() == "" ||
          $('input[name="holo_client_phone"]').val() == "" ||
          $('input[name="holo_client_email"]').val() == "" ||
          $('input[name="holo_client_birthday"]').val() == "" ||
          $('select[name="holo_client_gender"]').val() == ""
        ) {
          document.getElementById("holo_successIcon").innerHTML = "&#10003;儲存成功，但預約者資料未填妥，無法自動預約";
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

            $(".holo_data_delete").on("click", (e) => {
              e.stopPropagation();
              e.stopImmediatePropagation();
              e.target.closest(".row").remove();
            });
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

// 羽球運動中心

$("#badminton_court").on("change", (e) => {
  if (e.target.value != "") {
    chrome.storage.local.get(
      [
        //取得瀏覽器擴充本地儲存
        "badminton_court_data",
      ],
      (data) => {
        var court = JSON.parse(data.badminton_court_data)[parseInt(e.target.value)];
        var div = document.getElementById("badminton_qpid_checkbox_div");
        div.innerHTML = "";

        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = "badminton_qpid";
        checkbox.value = "0";
        div.appendChild(checkbox);
        div.append("不指定");

        for (var i = 0; i < court.qpid.length; i++) {
          var checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.name = "badminton_qpid";
          checkbox.value = court.qpid[i].id;
          div.appendChild(checkbox);
          div.append(court.qpid[i].name);
        }

        $("input[name=badminton_qpid]").change((e) => {
          if (e.target.value == "0") {
            if (e.target.checked) {
              $("input[name=badminton_qpid]").map((i, item) => {
                if (item.value != "0") {
                  $(item).prop("checked", "");
                  $(item).attr("disabled", true);
                }
              });
            } else {
              $("input[name=badminton_qpid]").map((i, item) => {
                if (item.value != "0") {
                  $(item).attr("disabled", false);
                }
              });
            }
          }
        });

        document.getElementById("badminton_qpid_div").style.display = "";
      }
    );
  } else {
    document.getElementById("badminton_qpid_div").style.display = "none";
  }
});

$("#badminton_time_add").on("click", () => {
  $("#badminton_time_div").append(
    `
    <div class="row mb-3">
      <div class="col-10">
        <select class="form-select" name="badminton_time">
          <option value="">請選擇</option>
          <option value="6">06:00~07:00</option>
          <option value="7">07:00~08:00</option>
          <option value="8">08:00~09:00</option>
          <option value="9">09:00~10:00</option>
          <option value="10">10:00~11:00</option>
          <option value="11">11:00~12:00</option>
          <option value="12">12:00~13:00</option>
          <option value="13">13:00~14:00</option>
          <option value="14">14:00~15:00</option>
          <option value="15">15:00~16:00</option>
          <option value="16">16:00~17:00</option>
          <option value="17">17:00~18:00</option>
          <option value="18">18:00~19:00</option>
          <option value="19">19:00~20:00</option>
          <option value="20">20:00~21:00</option>
          <option value="21">21:00~22:00</option>
        </select>
      </div>
      <div class="col-1">
        <button type="button" class="btn btn-danger badminton_time_delete"><i class="fa fa-times"></i></button>
      </div>
    </div>
  `
  );

  $(".badminton_time_delete").on("click", (e) => {
    e.stopPropagation();
    e.stopImmediatePropagation();
    console.info("e.target", e.target);
    e.target.closest(".row").remove();
  });
});

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
    ],
    async (data) => {
      var badminton_court_data = [];
      if (data.badminton_court_data == undefined || data.badminton_court_data == "") {
        await $.getJSON("../badminton_court.json", (data) => {
          badminton_court_data = data;
          chrome.storage.local.set({
            badminton_court_data: JSON.stringify(data),
          });
        });
      } else {
        badminton_court_data = JSON.parse(data.badminton_court_data);
      }

      var badminton_court_select = document.getElementById("badminton_court");
      for (var i = 0; i < badminton_court_data.length; i++) {
        var opt = document.createElement("option");
        opt.value = i;
        opt.innerHTML = badminton_court_data[i].court;
        badminton_court_select.appendChild(opt);
      }

      if (data.badminton_status) {
        $("input[name=badminton_status]").prop("checked", "checked");
      }

      if (data.badminton_court != undefined) {
        badminton_court_select.value = data.badminton_court;
        $(badminton_court_select).change();
      }

      if (data.badminton_date != undefined) {
        document.getElementById("badminton_date_input").value = data.badminton_date;
      }
      var min = new Date();
      min.setDate(min.getDate() + 1);
      document.getElementById("badminton_date_input").min = min
        .toLocaleDateString("zh-TW", { year: "numeric", month: "2-digit", day: "2-digit" })
        .replaceAll("/", "-");

      if (data.badminton_times != undefined && data.badminton_times.length > 0) {
        for (var i = 0; i < data.badminton_times.length; i++) {
          if (i == 0) {
            document.getElementById("badminton_time").value = data.badminton_times[i];
          } else {
            $("#badminton_time_div").append(
              `
              <div class="row mb-3">
                <div class="col-10">
                  <select class="form-select" name="badminton_time">
                    <option value="">請選擇</option>
                    <option value="6">06:00~07:00</option>
                    <option value="7">07:00~08:00</option>
                    <option value="8">08:00~09:00</option>
                    <option value="9">09:00~10:00</option>
                    <option value="10">10:00~11:00</option>
                    <option value="11">11:00~12:00</option>
                    <option value="12">12:00~13:00</option>
                    <option value="13">13:00~14:00</option>
                    <option value="14">14:00~15:00</option>
                    <option value="15">15:00~16:00</option>
                    <option value="16">16:00~17:00</option>
                    <option value="17">17:00~18:00</option>
                    <option value="18">18:00~19:00</option>
                    <option value="19">19:00~20:00</option>
                    <option value="20">20:00~21:00</option>
                    <option value="21">21:00~22:00</option>
                  </select>
                </div>
                <div class="col-1">
                  <button type="button" class="btn btn-danger badminton_time_delete"><i class="fa fa-times"></i></button>
                </div>
              </div>
            `
            );

            document.getElementsByName("badminton_time")[i].value = data.badminton_times[i];

            $(".badminton_time_delete").on("click", (e) => {
              e.stopPropagation();
              e.stopImmediatePropagation();
              console.info("e.target", e.target);
              e.target.closest(".row").remove();
            });
          }
        }
      }

      setTimeout(() => {
        if (data.badminton_qpids != undefined && data.badminton_qpids.length > 0) {
          var disabled = false;
          if (data.badminton_qpids[0] == "0") {
            disabled = true;
          }

          for (let i = 0; i < data.badminton_qpids.length; i++) {
            $('input[name="badminton_qpid"]').each((ii, e) => {
              if (disabled && $(e).val() != "0") {
                $(e).attr("disabled", true);
              }
              if ($(e).val() == data.badminton_qpids[i]) {
                $(e).prop("checked", "checked");
              }
            });
          }
        }
      }, 500);
    }
  );
});

$("#badminton_save").on("click", () => {
  document.getElementById("badminton_successIcon").style.display = "none";

  chrome.storage.local.set(
    {
      badminton_status: $("input[name=badminton_status]").prop("checked"),
      badminton_court: document.getElementById("badminton_court").value,
      badminton_date: document.getElementById("badminton_date_input").value,
      badminton_times: $('select[name="badminton_time"]')
        .map((i, e) => {
          if ($(e).val() != "") {
            return $(e).val();
          }
        })
        .get(),
      badminton_qpids: $('input[name="badminton_qpid"]')
        .map((i, e) => {
          if ($(e).prop("checked")) {
            return $(e).val();
          }
        })
        .get(),
      badminton_processing: "",
      badminton_finished: [],
    },
    () => {
      // $("#railway_test").val("儲存完畢");
      setTimeout(() => {
        console.info("儲存成功");
        document.getElementById("badminton_successIcon").style.display = "inline";
        document.getElementById("badminton_successIcon").innerHTML = "&#10003;儲存成功";
      }, 200);
    }
  );
});

// CPBL VOTE

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
        $("input[name=cpbl_status]").prop("checked", "checked");
      }

      $("#cpbl_sp").val(data.cpbl_sp);
      $("#cpbl_rp").val(data.cpbl_rp);
      $("#cpbl_cp").val(data.cpbl_cp);
      $("#cpbl_c").val(data.cpbl_c);
      $("#cpbl_1b").val(data.cpbl_1b);
      $("#cpbl_2b").val(data.cpbl_2b);
      $("#cpbl_3b").val(data.cpbl_3b);
      $("#cpbl_ss").val(data.cpbl_ss);
      $("#cpbl_of").val(data.cpbl_of);
      $("#cpbl_dh").val(data.cpbl_dh);
      $("#cpbl_hr").val(data.cpbl_hr);

      $("#cpbl_of").selectpicker("refresh");
      $("#cpbl_hr").selectpicker("refresh");
    }
  );
});

$("#cpbl_save").on("click", () => {
  document.getElementById("cpbl_successIcon").style.display = "none";

  chrome.storage.local.set(
    {
      cpbl_status: $("input[name=cpbl_status]").prop("checked"),
      cpbl_sp: $("#cpbl_sp").val(),
      cpbl_rp: $("#cpbl_rp").val(),
      cpbl_cp: $("#cpbl_cp").val(),
      cpbl_c: $("#cpbl_c").val(),
      cpbl_1b: $("#cpbl_1b").val(),
      cpbl_2b: $("#cpbl_2b").val(),
      cpbl_3b: $("#cpbl_3b").val(),
      cpbl_ss: $("#cpbl_ss").val(),
      cpbl_of: $("#cpbl_of").val(),
      cpbl_dh: $("#cpbl_dh").val(),
      cpbl_hr: $("#cpbl_hr").val(),
    },
    () => {
      // $("#railway_test").val("儲存完畢");
      setTimeout(() => {
        console.info("儲存成功");
        document.getElementById("cpbl_successIcon").style.display = "inline";

        var message = [];

        if ($("#cpbl_of").val().length < 3 || $("#cpbl_of").val().length > 3) {
          message.push("外野手請選擇三位");
        } else if ($("#cpbl_hr").val().length < 4 || $("#cpbl_hr").val().length > 4) {
          message.push("全壘打大賽請選擇四位");
        }

        document.getElementById("cpbl_successIcon").innerHTML = "&#10003;儲存成功" + (message.length == 0 ? "" : "，須修正: " + message.join("，"));
      }, 200);
    }
  );
});

// 挽肉と米

$("#hikiniku_priority_add").on("click", () => {
  add_hikiniku_priority();
});

add_hikiniku_priority = () => {
  var num = $("#hikiniku_priority_div").children().length;
  $("#hikiniku_priority_div").append(
    `
    <div class="hikiniku_priority" id="hikiniku_priority_` +
      num +
      `" style="margin: 1rem 0; padding: 5%; border: 0.1rem solid">
      <div class="row mb-3">
        <div class="col-10">欲搶順位` +
      (num + 1) +
      `</div>
        <div class="col-1">
          <button type="button" class="btn btn-danger hikiniku_priority_delete"><i class="fa fa-times"></i></button>
        </div>
      </div>
      <div class="row mb-3">
        <select class="form-select" name="hikiniku_week" id="hikiniku_week">
          <option value="">請選擇星期</option>
          <option value="2">星期二</option>
          <option value="3">星期三</option>
          <option value="4">星期四</option>
          <option value="5">星期五</option>
          <option value="6">星期六</option>
          <option value="7">星期日</option>
        </select>
      </div>
      欲搶時段
      <div class="row mb-3">
        <div class="col-12" id="hikiniku_weektime_checkbox_div">
          <input type="checkbox" class="form-check-input" name="hikiniku_weektime" value="0">不指定
          <input type="checkbox" class="form-check-input" name="hikiniku_weektime" value="11:00">11:00
          <input type="checkbox" class="form-check-input" name="hikiniku_weektime" value="11:10">11:10
          <input type="checkbox" class="form-check-input" name="hikiniku_weektime" value="12:00">12:00
          <input type="checkbox" class="form-check-input" name="hikiniku_weektime" value="12:10">12:10
          <input type="checkbox" class="form-check-input" name="hikiniku_weektime" value="13:00">13:00
          <input type="checkbox" class="form-check-input" name="hikiniku_weektime" value="13:15">13:15
          <input type="checkbox" class="form-check-input" name="hikiniku_weektime" value="14:00">14:00
          <input type="checkbox" class="form-check-input" name="hikiniku_weektime" value="14:15">14:15
          <input type="checkbox" class="form-check-input" name="hikiniku_weektime" value="17:00">17:00
          <input type="checkbox" class="form-check-input" name="hikiniku_weektime" value="17:10">17:10
          <input type="checkbox" class="form-check-input" name="hikiniku_weektime" value="18:00">18:00
          <input type="checkbox" class="form-check-input" name="hikiniku_weektime" value="18:10">18:10
          <input type="checkbox" class="form-check-input" name="hikiniku_weektime" value="19:00">19:00
          <input type="checkbox" class="form-check-input" name="hikiniku_weektime" value="19:15">19:15
          <input type="checkbox" class="form-check-input" name="hikiniku_weektime" value="20:00">20:00
          <input type="checkbox" class="form-check-input" name="hikiniku_weektime" value="20:15">20:15
        </div>
      </div>
    </div>
    `
  );

  $(".hikiniku_priority_delete").on("click", (e) => {
    e.stopPropagation();
    e.stopImmediatePropagation();
    e.target.closest(".hikiniku_priority").remove();
  });
};

$("#hikiniku_save").on("click", () => {
  document.getElementById("hikiniku_successIcon").style.display = "none";

  chrome.storage.local.set(
    {
      hikiniku_status: $("input[name=hikiniku_status]").prop("checked"),
      hikiniku_num: $("#hikiniku_num").val(),
      hikiniku_priority: $("#hikiniku_priority_div")
        .children()
        .map((i, e) => {
          return {
            week: $(e).find('select[name="hikiniku_week"]').val(),
            time: $(e)
              .find('input[name="hikiniku_weektime"]')
              .map((i, e) => {
                if ($(e).prop("checked")) {
                  return $(e).val();
                }
              })
              .get(),
          };
        })
        .get(),
    },
    () => {
      setTimeout(() => {
        console.info("儲存成功");
        document.getElementById("hikiniku_successIcon").style.display = "inline";

        document.getElementById("hikiniku_successIcon").innerHTML = "&#10003;儲存成功";
      }, 200);
    }
  );
});

$(() => {
  chrome.storage.local.get(
    [
      //取得瀏覽器擴充本地儲存
      "hikiniku_status",
      "hikiniku_num",
      "hikiniku_priority",
    ],
    (data) => {
      if (data.hikiniku_status) {
        $("input[name=hikiniku_status]").prop("checked", "checked");
      }

      $("#hikiniku_num").val(data.hikiniku_num);

      if ($("#hikiniku_priority_div").children().length < data.hikiniku_priority.length) {
        add_hikiniku_priority();
      }

      data.hikiniku_priority.map((priority, i) => {
        $("#hikiniku_priority_" + i)
          .find('select[name="hikiniku_week"]')
          .val(priority.week);
        priority.time.map((time) => {
          $("#hikiniku_priority_" + i)
            .find('input[name="hikiniku_weektime"]')
            .each((ii, checkbox) => {
              if (time == $(checkbox).val()) $(checkbox).prop("checked", "checked");
            });
        });
      });
    }
  );
});
