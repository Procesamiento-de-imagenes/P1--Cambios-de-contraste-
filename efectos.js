import histogram from "./histograma.js";
var btnDownload = document.getElementById('btnDownload');


function validateFile(inputFile) {
  var route = inputFile.value;

  var availableExtensions = /(.png|.jpeg|.jpg|.PNG|.JPG|.JPEG)$/i;

  if (!availableExtensions.exec(route)) {
    console.log(route, availableExtensions);
    alert("Archivo no valido");
    inputFile.value = "";
    return false;
  } else if (inputFile.files && inputFile.files[0]) {
    var img = new Image();
    img.src = window.URL.createObjectURL(inputFile.files[0]);   
    img.onload = function () {
      draw(this)
    };
    btnDownload.classList.remove('disabled');
    return inputFile.files[0];
  }
}

var img = new Image();
img.crossOrigin = "Anonymous";
img.src = "./image.jpg";
img.onload = function () {
  draw(this);
};


function draw(img) {
  var canvas = document.getElementById("original");
  var modify = document.getElementById("modify");


  var ctx = canvas.getContext("2d");
  var ctxModify = modify.getContext("2d");

  // image fit
  const ratio = img.width / img.height;
  let newWidth = canvas.width;
  let newHeight = newWidth / ratio;
  if (newHeight < canvas.height) {
    newHeight = canvas.height;
    newWidth = newHeight * ratio;
  }
  const xOffset = newWidth > canvas.width ? (canvas.width - newWidth) / 2 : 0;
  const yOffset = newHeight > canvas.height ? (canvas.height - newHeight) / 2 : 0;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctxModify.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(img, xOffset, yOffset, newWidth, newHeight);
  ctxModify.drawImage(img, xOffset, yOffset, newWidth, newHeight);

  img.style.display = "none";

  var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  var copyImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // get pixels
  var data = imageData.data;
  var copyData = copyImageData.data;

  var getColourFrequencies = function (data_) {
    const startIndex = 0; // StartIndex same as RGB enum: R=0, G=1, B=2

    const r = Array(256).fill(0);
    const g = Array(256).fill(0);
    const b = Array(256).fill(0);

    for (let i = startIndex, len = data_.length; i < len; i += 4) {
      r[data_[i]]++;
      g[data_[i + 1]]++;
      b[data_[i + 2]]++;
    }

    const result = {
      r,
      g,
      b,
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
    histogram(getColourFrequencies(copyData), 'modImg');
    btnDownload.href = modify.toDataURL();

  };
  var grayscale = function () {
    for (var i = 0; i < copyData.length; i += 4) {
      var avg = (copyData[i] + copyData[i + 1] + copyData[i + 2]) / 3;
      copyData[i] = avg; // red
      copyData[i + 1] = avg; // green
      copyData[i + 2] = avg; // blue
    }
    ctxModify.putImageData(copyImageData, 0, 0);
    histogram(getColourFrequencies(copyData), 'modImg');
    btnDownload.href = modify.toDataURL();

  };
  var automaticContrast = function () {
    let rMin = 255;
    let gMin = 255;
    let bMin = 255;

    let rMax = 0;
    let gMax = 0;
    let bMax = 0;

    let r = 0,
      g = 0,
      b = 0;

    for (var i = 0; i < data.length; i += 4) {
      if (rMin > data[i]) rMin = data[i];
      if (gMin > data[i + 1]) gMin = data[i + 1];
      if (bMin > data[i + 2]) bMin = data[i + 2];

      if (rMax < data[i]) rMax = data[i];
      if (gMax < data[i + 1]) gMax = data[i + 1];
      if (bMax < data[i + 2]) bMax = data[i + 2];
    }

    for (var i = 0; i < data.length; i += 4) {
      copyData[i] = ((data[i] - rMin) / (rMax - rMin)) * 255; // red
      copyData[i + 1] = ((data[i + 1] - gMin) / (gMax - gMin)) * 255; // green
      copyData[i + 2] = ((data[i + 2] - bMin) / (bMax - bMin)) * 255; // blue

      if (copyData[i] > 255) copyData[i] = 255;
      if (copyData[i + 1] > 255) copyData[i + 1] = 255;
      if (copyData[i + 2] > 255) copyData[i + 2] = 255;

      if (copyData[i] < 0) copyData[i] = 0;
      if (copyData[i + 1] < 0) copyData[i + 1] = 0;
      if (copyData[i + 2] < 0) copyData[i + 2] = 0;
    }
    ctxModify.putImageData(copyImageData, 0, 0);
    histogram(getColourFrequencies(copyData), 'modImg');
    btnDownload.href = modify.toDataURL();

  };
  var brillo = function (k) {
    var brightness = k || 100;
    for (var i = 0; i < copyData.length; i += 4) {
      if (copyData[i] < k) {
        copyData[i]     = data[i] + brightness;
        copyData[i + 1] = data[i + 1] + brightness;
        copyData[i + 2] = data[i + 2] + brightness;
      }

      if (copyData[i] > k) {
        copyData[i]     = data[i] - brightness;
        copyData[i + 1] = data[i + 1] - brightness;
        copyData[i + 2] = data[i + 2] - brightness;
      }

      if (copyData[i]     > 255) copyData[i] = 255;
      if (copyData[i + 1] > 255) copyData[i + 1] = 255;
      if (copyData[i + 2] > 255) copyData[i + 2] = 255;

      if (copyData[i] < 0) copyData[i] = 0;
      if (copyData[i + 1] < 0) copyData[i + 1] = 0;
      if (copyData[i + 2] < 0) copyData[i + 2] = 0;
    }
    ctxModify.putImageData(copyImageData, 0, 0);
    histogram(getColourFrequencies(copyData), 'modImg');
    btnDownload.href = modify.toDataURL();

  };
  var averageContrast = function (k_) {
    let k = k_ || 0;
    let promedio = copyData.reduce((prev, curr) => (curr += prev));
    promedio = promedio / copyData.length;

    for (var i = 0; i < copyData.length; i += 4) {
      copyData[i] = k * (data[i] - promedio) + promedio; // red
      copyData[i + 1] = k * (data[i + 1] - promedio) + promedio; // green
      copyData[i + 2] = k * (data[i + 2] - promedio) + promedio; // blue

      if (copyData[i] > 255) copyData[i] = 255;
      if (copyData[i + 1] > 255) copyData[i + 1] = 255;
      if (copyData[i + 2] > 255) copyData[i + 2] = 255;

      if (copyData[i] < 0) copyData[i] = 0;
      if (copyData[i + 1] < 0) copyData[i + 1] = 0;
      if (copyData[i + 2] < 0) copyData[i + 2] = 0;
    }
    ctxModify.putImageData(copyImageData, 0, 0);
    histogram(getColourFrequencies(copyData), 'modImg');
    btnDownload.href = modify.toDataURL();

  };
  var raizNEsima = function (k_) {
    let k = parseFloat(1 / k_);
    console.log();

    for (var i = 0; i < copyData.length; i += 4) {
      copyData[i] = Math.floor(Math.pow(data[i] / 255, k) * 255);
      copyData[i + 1] = Math.floor(Math.pow(data[i + 1] / 255, k) * 255);
      copyData[i + 2] = Math.floor(Math.pow(data[i + 2] / 255, k) * 255);

      if (copyData[i] > 255) copyData[i] = 255;
      if (copyData[i + 1] > 255) copyData[i + 1] = 255;
      if (copyData[i + 2] > 255) copyData[i + 2] = 255;

      if (copyData[i] < 0) copyData[i] = 0;
      if (copyData[i + 1] < 0) copyData[i + 1] = 0;
      if (copyData[i + 2] < 0) copyData[i + 2] = 0;
    }
    ctxModify.putImageData(copyImageData, 0, 0);
    histogram(getColourFrequencies(copyData), 'modImg');
    btnDownload.href = modify.toDataURL();

  };

  // range input
  var inputAverageContrast = document.getElementById("average-contrast");
  inputAverageContrast.oninput = (e) => {
    averageContrast(inputAverageContrast.value);
  };
  var inputRaizN = document.getElementById("raiz-n-esima");
  inputRaizN.onchange = (e) => {
    raizNEsima(inputRaizN.value);
  };
  var inputBrillo = document.getElementById("brillo");
  inputBrillo.oninput = (e) => {
    brillo(inputBrillo.value);
  };

  // buttons
  var btnNegative = document.getElementById("btn-negative");
  btnNegative.addEventListener("click", invert);

  var btnAverageContrast = document.getElementById("btn-gray");
  btnAverageContrast.addEventListener("click", grayscale);

  var btnAutomaticContrast = document.getElementById("automaticContrast");
  btnAutomaticContrast.addEventListener("click", automaticContrast);

  // Upload Image
  var uploadImage = document.getElementById("uploadImage");
  uploadImage.onchange = (e) => {
    validateFile(uploadImage)
  }
  btnDownload.href = modify.toDataURL();

  // generate histogram
  histogram(getColourFrequencies(data), 'orgImg');
  histogram(getColourFrequencies(copyData), 'modImg');
}
