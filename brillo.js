var img = new Image();
img.src = "./descarga.png";
img.onload = function () {
  draw(this);
};

function draw(img) {
  var canvas = document.getElementById("original");
  var modify = document.getElementById("modify");
  var ctx = canvas.getContext("2d");
  var ctxModify = modify.getContext("2d");

  ctx.drawImage(img, 0, 0);
  ctxModify.drawImage(img, 0, 0);

  img.style.display = "none";

  var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  var data = imageData.data;

  var iMax = function(data){
    var iMaxRed =0, iMaxGreen =0, iMaxBlue =0;
    for (var i = 0; i < data.length; i += 4) {
      if(iMaxRed    != 0) {iMaxRed    = data[i]   + data[i +3];}
      if(iMaxGreen  != 0) {iMaxGreen  = data[i+2] + data[i +4];}
      if(iMaxBlue   != 0) {iMaxBlue   = data[i+3] + data[i +5];}
      
    }
  }

  var invert = function () {
    for (var i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i]; // red
      data[i + 1] = 255 - data[i + 1]; // green
      data[i + 2] = 255 - data[i + 2]; // blue
    }
    ctxModify.putImageData(imageData, 0, 0);
  };

  var grayscale = function () {
    for (var i = 0; i < data.length; i += 4) {
      var avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = avg; // red
      data[i + 1] = avg; // green
      data[i + 2] = avg; // blue
    }
    ctxModify.putImageData(imageData, 0, 0);
  };
  var averageContrast = function () {
    for (var i = 0; i < data.length; i += 4) {
      var r = 
      data[i] = ((data[i]-0)*255)/(255-0) ; // red
      data[i + 1] = ((data[i + 1]-0)*255)/(255-0) ; // green
      data[i + 2] = ((data[i + 2]-0)*255)/(255-0) ; // blue
    }
    ctxModify.putImageData(imageData, 0, 0);
  };

  var btnNegative = document.getElementById('btn-negative');
  btnNegative.addEventListener('click', invert)

  var btnAverageContrast = document.getElementById('btn-average-contrast');
  btnAverageContrast.addEventListener('click', averageContrast)

}
