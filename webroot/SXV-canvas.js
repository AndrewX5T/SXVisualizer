/*SXV-canvas.js*/

var canvas;
var render;
var canvasSize;

$(() => {
  console.log("Loaded script SXV-canvas.js");
  canvas = $("#SXV-canvas").get(0);
  render = canvas.getContext("2d");
  canvasSize = { x: $(canvas).attr("width"), y: $(canvas).attr("height") };
});

var frame;

function DrawFrame() {
  frame = requestAnimationFrame(DrawFrame);

  render.fillStyle = "#000000";
  render.fillRect(0, 0, canvasSize.x, canvasSize.y);

  VisualizeAudio(canvasSize.x, canvasSize.y);
}
