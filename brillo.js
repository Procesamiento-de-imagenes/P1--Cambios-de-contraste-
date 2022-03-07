var img = new Image();
img.src = "./descarga.png";
img.onload = function () {
  draw(this);
};

function draw(img) {
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  img.style.display = "none";

  var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  var data = imageData.data;

  var brillo = function (k) {
    var ColorActual = 0;
    for (var i = 0; i < data.height; i++) {
      for (var j = 0; j < data.width; j++) {
      a = (ColorActual >> 24) & 0xff;
      r = (ColorActual >> 16) & 0xff;
      g = (ColorActual >> 8) & 0xff;
      b = ColorActual & 0xff;
      r=188;
      if (r > 255){
        r = 255;
      }
      if (r < 0){
          r = 0;
      }
      g=g+k;
      if (g > 255){
          g = 255;
      }
      if (g < 0){
          g = 0;
      }
      
      b=b+k;
      if (b > 255){
          b = 255;
      }
      if (b < 0){
          b = 0;
      }
      data[i] = 100;
      data[i + 1] = 100;
      data[i + 2] = 100;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  };

  var invert = function () {
    for (var i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i]; // red
      data[i + 1] = 255 - data[i + 1]; // green
      data[i + 2] = 255 - data[i + 2]; // blue
    }
    ctx.putImageData(imageData, 0, 0);
  };

  var grayscale = function () {
    for (var i = 0; i < data.length; i += 4) {
      var avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = avg; // red
      data[i + 1] = avg; // green
      data[i + 2] = avg; // blue
    }
    ctx.putImageData(imageData, 0, 0);
  };


  var btnbrightness = document.getElementById('btn-brightness');
  btnbrightness.addEventListener('click', brillo)

  var btnNegative = document.getElementById('btn-negative');
  btnNegative.addEventListener('click', invert)

  var btnAverageContrast = document.getElementById('btn-average-contrast');
  btnAverageContrast.addEventListener('click', grayscale)

}
