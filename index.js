

const path = require("path");
const express = require('express');
const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.get("/", (req, res) => res.render("room"));



const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3001;

var onlineUsers = {};
var onlineCount = 0;


io.on("connection", (socket) => {
  console.log('a user connected');

  socket.on("getAlluser",()=>{
    console.log("in getAlluser")
    io.emit("getAlluser",{onlineUsers})
  })

  socket.on("login", (obj) => {
    console.log('a user login');
    console.log("obj", obj);
    socket.name = obj.userid;
    if (!onlineUsers[obj.userid]) {
      onlineUsers[obj.userid] = obj.username;
      onlineCount++;
    }

    io.emit("login", { onlineUsers, onlineCount, user: obj });
    console.log(obj.username + "進入聊天室");
  });

  socket.on("disconnect", () => {
    console.log('a user disconnected');
    if (onlineUsers[socket.name]) {
      let logoutUser = {
        userid: socket.name,
        username: onlineUsers[socket.name],
      };

      delete onlineUsers[socket.name];
      onlineCount--;

      io.emit("logout", { onlineUsers, onlineCount, user: logoutUser });
    }
  });

  socket.on("message", function (obj) {
    console.log(obj)
    io.emit("message", obj);
  });
});

http.listen(port, () => {
  console.log(`chatroom socket server is listening at${port}`);
});
