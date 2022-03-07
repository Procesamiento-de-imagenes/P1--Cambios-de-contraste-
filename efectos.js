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
  var data = imageData.data;

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
      var r = (data[i] = ((data[i] - 0) * 255) / (255 - 0)); // red
      data[i + 1] = ((data[i + 1] - 0) * 255) / (255 - 0); // green
      data[i + 2] = ((data[i + 2] - 0) * 255) / (255 - 0); // blue
    }
    ctxModify.putImageData(imageData, 0, 0);
  };

  var btnNegative = document.getElementById("btn-negative");
  btnNegative.addEventListener("click", invert);

  var btnAverageContrast = document.getElementById("btn-average-contrast");
  btnAverageContrast.addEventListener("click", getColourFrequencies);

  histogram(getColourFrequencies());
}
