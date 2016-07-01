var canvas;
var canvasWidth;
var ctx;
var x;
var y;
var download;
var data;
var fileInput;
var img;


window.onload = function() {
  prepareExample();
};

function prepareExample() {


  img = document.getElementById('sample-image');

  var deviceWidth = window.innerWidth;
  canvasWidth = Math.min(600, deviceWidth - 20);
  canvasHeight = Math.min(480, deviceWidth - 20);
  // JIC jQuery Selector by type does not work.
  //canvas = $('canvas');
  canvas = document.getElementById('memeSpace');


  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  ctx = canvas.getContext('2d');

  x = canvas.width / 2 - img.width / 2;
  y = canvas.height / 2 - img.height / 2;

  ctx.drawImage(img, x, y);

  ctx.textAlign = 'center';
  ctx.lineWidth = 4;
  ctx.font = '24pt impact';
  ctx.strokeStyle = 'black';
  ctx.fillStyle = 'white';
  doTransform();


  fileInput = document.getElementById('fileInput');

  fileInput.addEventListener('change', function(e) {

    var reader = new FileReader();
    reader.onload = function(event) {

      img.onload = function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        document.getElementById('scale').value = 1;
        document.getElementById('rotate').value = 0;
        x = canvas.width / 2 - img.width / 2;
        y = canvas.height / 2 - img.height / 2;
        ctx.drawImage(img, x, y);
        //imgTransform();
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(fileInput.files[0]);

  }, false);

  var controls = document.getElementById('controls');
  var save = document.getElementById('save');
  save.addEventListener('click', function(e) {
    controls.style.display = 'none';
    document.getElementById('spinner-div').style.display = 'inline';
    var data = canvas.toDataURL();

    request = $.ajax({
      url: "/meme/save",
      type: "post",
      data: data
    });

    // callback handler that will be called on success
    request.done(function(response, textStatus, jqXHR) {
      // log a message to the console
      window.location.href = '/meme/view/' + response;
    });

  }, false);

  //**********************************//
  //*  Start Of Image filter section *//
  //*  Uses A Service worker         *//

  var original;
  var imageWorker = new Worker('js/worker.js');

  // greys out the buttons while manipulation is happening
  // un-greys out the buttons when the manipulation is done
  function toggleButtonsAbledness() {
    var buttons = document.querySelectorAll('button');
    for (var i = 0; i < buttons.length; i++) {
      if (buttons[i].hasAttribute('disabled')) {
        buttons[i].removeAttribute('disabled');
      } else {
        buttons[i].setAttribute('disabled', null);
      }
    }
  }

  function manipulateImage(type) {
    var a, b, g, i, imageData, j, length, pixel, r, ref;
    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    toggleButtonsAbledness();
    imageWorker.postMessage({
        'imageData': imageData, 'type': type
    });

    imageWorker.onmessage = function(e) {
    toggleButtonsAbledness();
    var image = e.data;
    if (image) return ctx.putImageData(e.data, 0, 0);
    console.log("No ManipulatedImage Returned");
    Materialize.toast('Image Un-Touched', 6000);
    };

    imageWorker.onerror = function(error) {
        function WorkerException(message) {
            this.name = 'WorkerException';
            this.message = message;
        }
        throw new WorkerException('Worker ERRORED!');
    };

    return ctx.putImageData(imageData, 0, 0);
  }

  function revertImage() {
    return ctx.putImageData(original, 0, 0);
  }

  document.querySelector('#invert').onclick = function() {
    manipulateImage("invert");
  };
  document.querySelector('#chroma').onclick = function() {
    manipulateImage("chroma");
  };
  document.querySelector('#greyscale').onclick = function() {
    manipulateImage("greyscale");
  };
  document.querySelector('#vibrant').onclick = function() {
    manipulateImage("vibrant");
  };
  document.querySelector('#revert').onclick = function() {
    revertImage();
  };



  scale = document.getElementById('scale');
  scale.addEventListener('change', doTransform, false);

  rotate = document.getElementById('rotate');
  rotate.addEventListener('change', doTransform, false);

  download = document.getElementById('img-download');
  download.addEventListener('click', prepareDownload, false);

  ctx.textAlign = 'center';
  ctx.lineWidth = 4;
  ctx.font = '24pt impact';
  ctx.strokeStyle = 'black';
  ctx.fillStyle = 'white';

}

function doTransform() {
  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Translate to center so transformations will apply around this point
  ctx.translate(canvas.width / 2, canvas.height / 2);

  // Perform scale
  var val = document.getElementById('scale').value;
  ctx.scale(val, val);

  // Perform rotation
  val = document.getElementById('rotate').value;
  ctx.rotate(val * Math.PI / 180);

  // Reverse the earlier translation
  ctx.translate(-canvas.width / 2, -canvas.height / 2);

  // Finally, draw the image
  ctx.drawImage(img, x, y);

  ctx.restore();

  var inputTop = document.getElementById('topLineText').value;
  var inputBottom = document.getElementById('bottomLineText').value;

  inputTop = inputTop.toUpperCase();
  inputBottom = inputBottom.toUpperCase();

  //ctx.strokeText(text, canvas.width/2 , canvas.height - canvas.height/4 );
  //ctx.fillText(text, canvas.width/2 , canvas.height - canvas.height/4 );
  wrapTextTop(ctx, inputTop, canvas.width / 2, canvas.height - canvas.height / 1.125, canvasWidth - canvasWidth / 3, 30);
  wrapTextBottom(ctx, inputBottom, canvas.width / 2, canvas.height - canvas.height / 8.125, canvasWidth - canvasWidth / 3, 30);
  // var length = ctx.measureText(text);
  // x = canvas.width/2;// - length/2;
  // y = canvas.height - canvas.height/4.5;
  // ctx.strokeText(text, x, y);
  // ctx.fillText(text, x, y);
}


function prepareDownload() {
  var data = canvas.toDataURL();
  download.href = data;
}

// Modified from http://www.html5canvastutorials.com/tutorials/html5-canvas-wrap-text-tutorial/
function wrapTextTop(ctx, inputTop, x, y, maxWidth, lineHeight) {
  var words = inputTop.split(' ');
  var line = '';

  for (var n = 0; n < words.length; n++) {
    var testLine = line + words[n] + ' ';
    var metrics = ctx.measureText(testLine);
    var testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.strokeText(line, x, y);
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.strokeText(line, x, y);
  ctx.fillText(line, x, y);
}

function wrapTextBottom(ctx, inputBottom, x, y, maxWidth, lineHeight) {
  var words = inputBottom.split(' ');
  var line = '';

  for (var n = 0; n < words.length; n++) {
    var testLine = line + words[n] + ' ';
    var metrics = ctx.measureText(testLine);
    var testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.strokeText(line, x, y);
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.strokeText(line, x, y);
  ctx.fillText(line, x, y);
}
