//SXVisualizer.js
//analyzes audio, converts byte data to animation
//Andrew Hein
//2021/4/12

//credit to https://stackoverflow.com/questions/36581380/audio-level-meter-for-web-rtc-stream/36620646#36620646

//Audio and anaylsis components
var audio;
var audioSource;
var audioGain;
var channelSplitter;
var audioContext;
var audioAnalyser = [];
var frequencyChannels = [];
var audioLevels = [0];

var fftSize = 32;

//Visual components
var canvas;
var renderContext;
var canvasHeight, canvasWidth;
var barWidth, barMaxHeight;
var animation;

window.onload = () => {
  console.log("Loaded script SXVisualizer.js");
  audio = $(".SXV-audiocontainer").get(0);

  //Link to html canvas, get dimensions, and determine rendering context
  canvas = $("#SXV-canvas").get(0);
  renderContext = canvas.getContext("2d");

  canvasWidth = canvas.width;
  canvasHeight = canvas.height;

  barMaxHeight = canvasHeight * .85;

  audio.onplay = ()=>{
    //create the AudioContext, AudioSource, and Analyser
    InitializeAnalyzer();

    animation = requestAnimationFrame(renderFrame);
  };

  audio.onpause = ()=>{
    cancelAnimationFrame(animation);
  }
};

//resets to background color
function clearFrame(sizeX, sizeY, colorHex){
  renderContext.fillStyle = colorHex;
  renderContext.fillRect(0, 0, sizeX, sizeY);
}

//gets frequency value for each range, applies to local display position. Iter: byteFrequencyData length
function renderFrame() {
  CalculateLevels();
  clearFrame(canvasWidth, canvasHeight, "#000000");
  let horiz_cursor = 0;

  for (var i = 0; i < frequencyChannels[0].length; i++) {
    let barHeight = (GetChannelAverageFrequency(i) / 256) * barMaxHeight;

   var r = barHeight / 2;
    var g = 50;
    var b = barHeight;

    renderContext.fillStyle = `rgb(${r}, ${g}, ${b})`;
    renderContext.fillRect(horiz_cursor, canvasHeight, barWidth, barHeight * -1);

    horiz_cursor += barWidth;
  }

  console.log("Frame");
  animation = requestAnimationFrame(renderFrame);
  return animation;
}

//initialize values based on the available media element
function InitializeAnalyzer(){
  if(audioContext!= null) return;
  audioContext = new (AudioContext || window.webkitAudioContext)();
  audioSource = audioContext.createMediaElementSource(audio);
  audioGain = audioContext.createGain();

  channelSplitter = audioContext.createChannelSplitter(audioSource.channelCount);

  audioSource.connect(audioGain);
  audioGain.connect(channelSplitter);
  audioGain.connect(audioContext.destination);

  barWidth = (canvasWidth / (fftSize/2));

  for(let i=0; i<audioSource.channelCount; i++){
    audioAnalyser[i] = audioContext.createAnalyser();
    audioAnalyser[i].minDecibels = -100;
    audioAnalyser[i].maxDecibels = 0;
    audioAnalyser[i].smoothingTimeConstant = 0.8;
    audioAnalyser[i].fftSize = 64;
    frequencyChannels[i] = new Uint8Array(audioAnalyser[i].frequencyBinCount);

    channelSplitter.connect(audioAnalyser[i], i, 0);
  }


  console.log(audioAnalyser);
  console.log(frequencyChannels);
}

function CalculateLevels(){
  for(let channel = 0; channel < audioAnalyser.length; channel++){
    audioAnalyser[channel].getByteFrequencyData(frequencyChannels[channel]);
    let value = 0;

    for(let freqBin = 0; freqBin < audioAnalyser[channel].frequencyBinCount; freqBin++){
      value = Math.max(value, frequencyChannels[channel][freqBin]);
    }
    audioLevels[channel] = value / 256;
  }
}

//get the average of the frequency range across all channels
function GetChannelAverageFrequency(index){
  let numChannels = audioSource.channelCount;
  let sum = 0;

  for(let i=0; i<numChannels; i++){
    sum += frequencyChannels[i][index];
  }

  return sum/numChannels;
}