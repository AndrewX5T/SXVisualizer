var renderContext, audioContext, src, canvas, analyser, WIDTH, HEIGHT, barWidth, barHeight, bufferLength, x, y;

window.onload = () => {
  console.log("Loaded script SXVisualizer.js");
  var audio = $(".SXV-audiocontainer").get(0);
  audio.crossOrigin = "anonymous";

  barHeight = (HEIGHT * .85);

  //Link to html canvas, get dimensions, and determine rendering context
  canvas = $("#SXV-canvas").get(0);
  renderContext = canvas.getContext("2d");

  WIDTH = canvas.width;
  HEIGHT = canvas.height;

  audio.onplay = ()=>{
    //create the AudioContext, AudioSource, and Analyser
    audioContext = new AudioContext();
    src = audioContext.createMediaElementSource(audio);
    analyser = audioContext.createAnalyser();

    //connect source to analyzer, then analyser to 
    src.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 256;

    bufferLength = analyser.frequencyBinCount;
    console.log(`Audio context buffer length = ${bufferLength}`);

    barWidth = (WIDTH / bufferLength) * 2.5;

    renderFrame(renderContext, barHeight, bufferLength);
  };
};

function clearFrame(sizeX, sizeY, colorHex){
  renderContext.fillStyle = colorHex;
  renderContext.fillRect(0, 0, sizeX, sizeY);
}

function renderFrame(renderContext, barWidth, barHeight, bufferLength) {
  clearFrame(WIDTH, HEIGHT, "#000000");

  let horiz_cursor = 0;

  dataArray = new Uint8Array(bufferLength)

  analyser.getByteFrequencyData(dataArray);

  for (var i = 0; i < bufferLength; i++) {
    barHeight = dataArray[i];

    var r = barHeight + 25 * (i / bufferLength);
    var g = 250 * (i / bufferLength);
    var b = 50;

    renderContext.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
    renderContext.fillRect(horiz_cursor, HEIGHT - barHeight, barWidth, barHeight);

    horiz_cursor += barWidth + 1;
  }

  requestAnimationFrame(renderFrame);
}