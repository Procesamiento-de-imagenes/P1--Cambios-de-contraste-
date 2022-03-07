import histogram from "./histograma.js";

var img = new Image();
img.crossOrigin = "Anonymous";
img.src = "descarga.png";
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
  var copyImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  var data = imageData.data;
  var copyData = copyImageData.data;

  var getColourFrequencies = function () {
    const startIndex = 0; // StartIndex same as RGB enum: R=0, G=1, B=2

    let maxFrequency = 0;
    const r = Array(256).fill(0);
    const g = Array(256).fill(0);
    const b = Array(256).fill(0);

    for (let i = startIndex, len = data.length; i < len; i += 4) {
      r[data[i]]++;
      g[data[i+1]]++;
      b[data[i+2]]++;

      if (r[data[i]] > maxFrequency) {
        maxFrequency++;
      }
    }

    const result = {
      r,
      g, 
      b,
      maxFrequency,
    };

    return result;
  };

  var invert = function () {
    for (var i = 0; i < copyData.length; i += 4) {
      copyData[i] = 255 - copyData[i]; // red
      copyData[i + 1] = 255 - copyData[i + 1]; // green
      copyData[i + 2] = 255 - copyData[i + 2]; // blue
    }
    ctxModify.putImageData(copyImageData, 0, 0);
  };

  var grayscale = function () {
    for (var i = 0; i < copyData.length; i += 4) {
      var avg = (copyData[i] + copyData[i + 1] + copyData[i + 2]) / 3;
      copyData[i] = avg; // red
      copyData[i + 1] = avg; // green
      copyData[i + 2] = avg; // blue
    }
    ctxModify.putImageData(copyImageData, 0, 0);
  };
  var automaticContrast = function () {
    for (var i = 0; i < data.length; i += 4) {

      var r = (data[i] = ((data[i] - 0) * 255) / (255 - 0)); // red
      data[i + 1] = ((data[i + 1] - 0) * 255) / (255 - 0); // green
      data[i + 2] = ((data[i + 2] - 0) * 255) / (255 - 0); // blue
    }
    ctxModify.putImageData(imageData, 0, 0);
  };
  var brillo = function (k) {
    var brightness = k || 100
    for (var i = 0; i < copyData.length; i += 4) {
      if (copyData[i]<k){
        copyData[i] = data[i] + brightness
        copyData[i + 1] = data[i + 1] + brightness
        copyData[i + 2] = data[i + 2] + brightness
        }

      if (copyData[i]>k){
        copyData[i] =data[i] - brightness
        copyData[i + 1] = data[i + 1] - brightness
        copyData[i + 2] = data[i + 2] - brightness
      }

      if (copyData[i] > 255) {
        copyData[i] = 255;
      }
      if (copyData[i + 1] > 255) {
        copyData[i + 1] = 255;
      }
      if (copyData[i + 2] > 255) {
        copyData[i + 2] = 255;
      }

      if (copyData[i] < 0) {
        copyData[i] = 0;
      }
      if (copyData[i + 1] < 0) {
        copyData[i + 1] = 0;
      }
      if (copyData[i + 2] < 0) {
        copyData[i + 2] = 0;
      }
    }
    console.log(data,copyData)

    ctxModify.putImageData(copyImageData, 0, 0);
  };
  var averageContrast = function (k_) {
    // copyData = data;

    let k = k_ || 0;
    let promedio = copyData.reduce((prev, curr) => curr += prev);
        promedio = promedio/copyData.length;

    for (var i = 0; i < copyData.length; i += 4) {
      copyData[i]     = (k *(data[i]     - promedio) + promedio); // red
      copyData[i + 1] = (k *(data[i + 1] - promedio) + promedio); // green
      copyData[i + 2] = (k *(data[i + 2] - promedio) + promedio); // blue

      if(copyData[i]> 255) copyData[i] = 255;
      if(copyData[i + 1]> 255) copyData[i + 1] = 255;
      if(copyData[i + 2]> 255) copyData[i + 2] = 255;

      if(copyData[i]    <0) copyData[i] = 0;
      if(copyData[i + 1]<0) copyData[i + 1] = 0;
      if(copyData[i + 2]<0) copyData[i + 2] = 0;
    }
    ctxModify.putImageData(copyImageData, 0, 0);

  };
  var raizNEsima = function (k_) {
    // copyData = data;
    let k = k_ || 0;

    for (var i = 0; i < copyData.length; i += 4) {
      copyData[i]     = Math.floor(Math.sqrt(copyData[i],     k));
      copyData[i + 1] = Math.floor(Math.sqrt(copyData[i + 1], k));
      copyData[i + 2] = Math.floor(Math.sqrt(copyData[i + 2], k));

      console.log(Math.floor(Math.sqrt(copyData[i],     k)));

      if(copyData[i]> 255) copyData[i] = 255;
      if(copyData[i + 1]> 255) copyData[i + 1] = 255;
      if(copyData[i + 2]> 255) copyData[i + 2] = 255;

      if(copyData[i]    <0) copyData[i] = 0;
      if(copyData[i + 1]<0) copyData[i + 1] = 0;
      if(copyData[i + 2]<0) copyData[i + 2] = 0;
    }
    ctxModify.putImageData(copyImageData, 0, 0);

  };

  var btnNegative = document.getElementById("btn-negative");
  btnNegative.addEventListener("click", invert);

  var inputAverageContrast = document.getElementById("average-contrast");
  inputAverageContrast.oninput = (e)=>{
    averageContrast(inputAverageContrast.value)
  }
  var inputRaizN = document.getElementById("raiz-n-esima");
  inputRaizN.oninput = (e)=>{
    raizNEsima(inputRaizN.value)
  }
  var inputBrillo = document.getElementById("brillo");
  inputBrillo.oninput = (e)=>{
    brillo(inputBrillo.value)
  }


  var btnAverageContrast = document.getElementById("btn-gray");
  btnAverageContrast.addEventListener("click", grayscale);

  histogram(getColourFrequencies());
}
