const express = require("express");
const process = require("process");
const path = require("path");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", socket => {
  // console.log('a user connected');
  socket.broadcast.emit("hi");

  socket.on("disconnect", () => {
    // console.log('user disconnected');
  });

  socket.on("chat message", msg => {
    io.emit("chat message", msg);
  });
});

app.set("port", process.env.PORT || 3000);

let server = http.listen(app.get("port"), () => {
  console.log("listening on *:%d", server.address().port);
});
