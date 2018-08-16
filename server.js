const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", function connection(ws) {
  let username = "anon" + Math.floor(Math.random() * 100);

  ws.on("message", function incoming(message) {
    let messageObject = JSON.parse(message);

    let { type, data } = messageObject;

    if (type == "username") {
      if (data != undefined) username = data;
      wss.clients.forEach(ws => {
        ws.send(`Usuário ${username} se conectou a sala`);
      });
    }

    if (type == "chat") {
      wss.clients.forEach(ws => {
        ws.send(`${username}: ${data}`);
      });
    }
  });
});
