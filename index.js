// require("dotenv").config();
// console.log(process.env.mongo_uri);

const path = require("path");
const express = require("express");
const app = express();
const userRoute = require("./routes/userRoute");
const mongoose = require("mongoose");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.set("view engine", "ejs");
app.get("/", (req, res) => res.render("room"));

//API
app.use(userRoute);

//404
app.get("*", (req, res) => {
  res.redirect("/");
});

const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = process.env.PORT || 3001;
const dbUri = "mongodb+srv://lien0103:a12345678@chatroom.f2mhj.mongodb.net/chatroom?retryWrites=true&w=majority";

const User = require("./models/userModel");
const Chat = require("./models/chatModel");
var onlineUsers = {};
var onlineCount = 0;

mongoose
  .connect(dbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) => {
    console.log("connected to DB");

    io.on("connection", async (socket) => {
      console.log("a user connected");
      // socket.on("getAlluser", () => {
      //   io.emit("getAlluser", { onlineUsers });
      // });

      let historyMsg = await Chat.find();

      socket.emit("initInfo", { onlineUsers, historyMsg });

      socket.on("login", async (obj) => {
        let usersDoc = await User.find();
        let usersDocNames = usersDoc.map((obj) => obj.name);
        socket.name = obj.userid;
        switch (obj.mode) {
          case "LOGIN": {
            let msg = null;
            if (!usersDocNames.includes(obj.username)) {
              msg = "名稱尚未註冊";
            }
            if (onlineUsers[obj.userid]) {
              msg = "名稱已被登入";
            }

            if (msg) {
              io.emit("loginFail", {
                onlineUsers,
                onlineCount,
                user: obj,
                msg,
              });
              return false;
            }

            if (!msg) {
              onlineUsers[obj.userid] = obj.username;
              onlineCount++;
              io.emit("login", {
                onlineUsers,
                onlineCount,
                user: obj,
              });
            }

            break;
          }
          case "SIGNUP": {
            if (usersDocNames.includes(obj.username)) {
              io.emit("loginFail", {
                onlineUsers,
                onlineCount,
                user: obj,
                msg: "使用者名稱已註冊",
              });
              return false;
            }

            let userDoc = new User({
              name: obj.username,
            });

            userDoc
              .save()
              .then((result) => {
                console.log(obj.username + "進入聊天室");
                onlineUsers[obj.userid] = obj.username;
                onlineCount++;
                io.emit("login", {
                  onlineUsers,
                  onlineCount,
                  user: obj,
                  mongoResult: result,
                });
              })
              .catch((err) => {
                console.log(err);
              });

            break;
          }
        }
      });

      socket.on("disconnect", () => {
        console.log("a user disconnected");
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
        console.log(obj);

        let chatDoc = new Chat({
          name: obj.username,
          msg: obj.msg,
        });

        chatDoc
          .save()
          .then(() => {
            io.emit("message", obj);
          })
          .catch((err) => {
            console.log(err);
          });
      });
    });

    http.listen(port, () => {
      console.log(`chatroom socket server is listening at${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
