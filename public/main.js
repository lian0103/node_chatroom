var alluser = null;
var historyMsg = null;
const CHAT = {
  username: null,
  userid: null,
  socket: io(),
  scrollToBottom: function () {
    let pHight = 25 * $(".msgbox p").length;
    let dHight = 45 * $(".msgbox div").length;
    // console.log(pHight,dHight)
    $(".msgbox").scrollTop(pHight + dHight);
  },
  updateMsg: function (data, type) {
    // console.log(data);
    switch (type) {
      case "LOGIN": {
        $(".msgbox").append("<p>" + data.user.username + "連線至聊天室</p>");
        break;
      }
      case "LOGOUT": {
        $(".msgbox").append("<p>" + data.user.username + "離開聊天室</p>");
        break;
      }
      case "GETMSG": {
        let regex = /(<([^>]+)>)/gi;
        let msg = regex.test(data.msg) ? "內容已過濾" : data.msg;
        let isSelf = data.username === CHAT.username;
        let time = moment(data.time).calendar();
        let temp = isSelf
          ? `<div class="flex flex-col my-2 space-y-2 text-xs mx-2 order-1 items-end">
                <div>
                  <span class="text-blue-400 text-sm relative">${time}</span>
                  <span class="px-4 py-2 rounded-lg inline-block rounded-br-none bg-blue-600 text-white text-lg break-all">${msg}</span>
                </div>
            </div>`
          : `
            <div class="flex flex-col my-2 space-y-2 text-xs max-w-xs mx-2 order-2 items-start">
                <div>
                <span class="text-lg text-gray-600 font-bold">${data.username}:</span>
                <span class="px-4 py-2 rounded-lg inline-block bg-gray-300 text-gray-600 text-lg break-all">${msg}</span>
                <span class="text-gray-400 text-sm relative">${time}</span>
                </div>
            </div>`;

        $(".msgbox").append(temp);
        $("#msgInput").val("");
      }
    }
    $(".onlineCount").text(data.onlineCount);
  },
  login: function (mode, nameFromLocal = null) {
    let name = nameFromLocal ? nameFromLocal : $("#userName").val();
    // console.log(nameFromLocal);

    if (!name) {
      $(".errMsg").text("請輸入名稱");
      return false;
    }

    if (alluser && alluser.includes(name)) {
      $(".errMsg").text("使用者名稱已被使用");
      return false;
    }
    localStorage.setItem("chatroom-username", name);
    $("#btnLogout").show();
    $('#spanUser').html(name);
    CHAT.username = name;
    CHAT.userid = uuid.v4();
    CHAT.socket.emit("login", {
      userid: CHAT.userid,
      username: CHAT.username,
      mode, //SIGNUP or LOGIN
    });
  },
  sendMsg: function () {
    let msg = $("#msgInput").val();
    if (!msg) {
      return false;
    }
    let data = {
      userid: CHAT.userid,
      username: CHAT.username,
      msg,
    };
    CHAT.socket.emit("message", data);
  },
  logout: function () {
    CHAT.socket.emit("logout", {
      userid: CHAT.userid,
      username: CHAT.username,
    });
    $("#loginBox").show();
  },
  renderMsgs: function () {
    historyMsg.forEach((obj) => {
      CHAT.updateMsg(
        { username: obj.name, msg: obj.msg, time: obj.updated },
        "GETMSG"
      );
    });
    CHAT.scrollToBottom();
  },
  init: function () {
    this.socket.on("initInfo", function (data) {
      // console.log(data);
      alluser = [...Object.values(data.onlineUsers)];
      $(".onlineCount").text(alluser.length);
      historyMsg = data.historyMsg;
      CHAT.renderMsgs();
    });

    this.socket.on("login", function (data) {
      CHAT.renderMsgs();
      CHAT.updateMsg(data, "LOGIN");
      $("#loginBox").hide();
      CHAT.scrollToBottom();
    });
    this.socket.on("logout", function (data) {
      CHAT.updateMsg(data, "LOGOUT");
      $('#spanUser').html("");
      CHAT.scrollToBottom();
    });
    this.socket.on("message", function (data) {
      // console.log(data);
      CHAT.updateMsg(data, "GETMSG");
      CHAT.scrollToBottom();
    });
    this.socket.on("loginFail", function (data) {
      console.log("~~~", data);
      if (CHAT.userid == data.user.userid) {
        $(".errMsg").text(data.msg);
        $("#userName").val("");
      }

      if (data.msg == "名稱尚未註冊") {
        localStorage.removeItem("chatroom-username");
        $("#loginBox").show();
      }
    });

    let name = localStorage.getItem("chatroom-username");
    if (name) {
      setTimeout(function () {
        CHAT.login("LOGIN", name);
      }, 500);
    } else {
      $("#loginBox").show();
    }
  },
};

$(document).ready(function () {
  CHAT.init();
  $("#btnLogin").click(function () {
    CHAT.login("LOGIN");
  });
  $("#btnLogin_signup").click(function () {
    CHAT.login("SIGNUP");
  });
  $("#btnLogout").click(function () {
    CHAT.logout("SIGNUP");
  });

  $("#sendMsg").click(CHAT.sendMsg);
  $("#msgInput").keyup(function (e) {
    if (e.code === "Enter" || e.code ==='NumpadEnter') {
      CHAT.sendMsg();
    }
    e.preventdefault();
  });
});
