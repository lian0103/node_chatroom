var alluser = null;

const CHAT = {
  username: null,
  userid: null,
  socket: io(),
  updateMsg: function (data, type) {
    console.log(data);
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
        let temp = $(".msgbox").html();
        let isSelf = data.username === CHAT.username;
        temp += isSelf
          ? ` <div class="flex flex-col my-2 space-y-2 text-xs mx-2 order-1 items-end">
                <div><span class="px-4 py-2 rounded-lg inline-block rounded-br-none bg-blue-600 text-white text-lg">${data.msg}</span></div>
            </div>`
          : `
            <div class="flex flex-col my-2 space-y-2 text-xs max-w-xs mx-2 order-2 items-start">
                <div><span class="px-4 py-2 rounded-lg inline-block bg-gray-300 text-gray-600 text-lg"><span class="font-bold">${data.username}:</span>${data.msg}</span></div>
            </div>`;

        $(".msgbox").html(temp);
        $("#msgInput").val("");
      }
    }
    $(".onlineCount").text(data.onlineCount);
  },
  gerAlluser: function () {
    this.socket.emit("getAlluser");
  },
  login: function () {
    let name = $("#userName").val();
    console.log(name);

    if (!name) {
      $(".errMsg").text("請輸入名稱");
      return false;
    }

    if (alluser.includes(name)) {
      $(".errMsg").text("使用者名稱已被使用");
      return false;
    }

    CHAT.username = name;
    CHAT.userid = uuid.v4();
    CHAT.socket.emit("login", {
      userid: CHAT.userid,
      username: CHAT.username,
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
  init: function () {
    this.gerAlluser();
    this.socket.on("getAlluser", function (data) {
      console.log(Object.values(data.onlineUsers));
      alluser = [...Object.values(data.onlineUsers)];
      $(".onlineCount").text(alluser.length);
    });

    this.socket.on("login", function (data) {
      console.log("login", data);
      CHAT.updateMsg(data, "LOGIN");

      $("#loginBox").hide();
    });
    this.socket.on("logout", function (data) {
      CHAT.updateMsg(data, "LOGOUT");
    });
    this.socket.on("message", function (data) {
      //TODO
      console.log(data);
      CHAT.updateMsg(data, "GETMSG");
    });
  },
};

$(document).ready(function () {
  CHAT.init();
  $("#btnLogin").click(CHAT.login);
  $("#sendMsg").click(CHAT.sendMsg);
  $("#msgInput").keyup(function (e) {
    if (e.code === "Enter") {
      CHAT.sendMsg();
    }
  });
});
