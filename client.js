const WebSocket = require("ws");
let { ScreenBuffer, TextBuffer, terminal } = require("terminal-kit");

var screen = new ScreenBuffer({ dst: terminal, noFill: false, wrap: true });
var txt = new TextBuffer({ dst: screen });

let inputScreenBufferUp = [];
let inputScreenBufferDown = [];
let inputScreenBufferMiddle = "";
let screenWidthLine1 = "";
let screenWidthLine2 = "|";
let messages = [];
let textInput = "";

initializeScreen();

const ws = new WebSocket("ws://localhost:8080");

ws.on("open", function open() {
  ws.send(JSON.stringify({ type: "username", data: process.argv[2] }));

  setInterval(() => {}, 1000);
});

terminal.grabInput(true);
terminal.on("key", function(name, matches, data) {
  if (name === "CTRL_C") {
    process.exit();
  }

  if (name === "ENTER") {
    ws.send(
      JSON.stringify({
        type: "chat",
        data: textInput
      })
    );

    textInput = "";
    drawScreenInput();
    return;
  }

  if (name === "BACKSPACE") {
    let textInputAux = textInput.split("");
    textInputAux.pop();
    textInput = textInputAux.join("");
    drawScreenInput();
    return;
  }

  textInput += name;
  drawScreenInput();
});

let messageCount = 0;
ws.on("message", function incoming(data) {
  messages.push(data);
  drawScreen();
});

function initializeScreen() {
  for (let i = 0; i < terminal.height; i++) messages.push(" ");
  for (let i = 0; i < terminal.width - 1; i++) screenWidthLine1 += "-";
  for (let i = 0; i < terminal.width - 3; i++) screenWidthLine2 += " ";
  screenWidthLine2 += "|";

  inputScreenBufferUp = [screenWidthLine1, screenWidthLine2];

  inputScreenBufferDown = [screenWidthLine2, screenWidthLine1];

  drawScreenInput();
  drawScreen();
}

function drawScreenInput() {
  inputScreenBufferMiddle = "| " + textInput;
  for (let i = 0; i < terminal.width - 5 - textInput.length; i++)
    inputScreenBufferMiddle += " ";
  inputScreenBufferMiddle += " |";
  drawScreen();
}

function drawScreen() {
  let concatenate = [];

  while (messages.length > terminal.height - 5) messages.shift();

  concatenate = [
    ...messages,
    ...inputScreenBufferUp,
    inputScreenBufferMiddle,
    ...inputScreenBufferDown
  ];

  txt.setText(concatenate.join("\n"));
  txt.draw();
  screen.draw();
}
