實作socket io 的簡易聊天功能。使用技術 nodeJS Express tailwindCss Jquery ejs(view engine) MongoDB

線上demo: https://jason-node-chatroom.herokuapp.com/

20211202 被injection攻擊
![](https://i.imgur.com/t81TQw3.jpg)

發生原因:聊天內容沒有過濾掉html tag。所以當訊息再被渲染回網頁後，被加入了iframe並且refresh。
修正:再渲染聊天訊息時過濾掉tag