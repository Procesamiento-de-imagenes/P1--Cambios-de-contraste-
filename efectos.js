import histogram from './histograma.js'

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
  var imageData1 = ctxModify.getImageData(0, 0, canvas.width, canvas.height);
  var data1 = imageData1.data1;
  var data = imageData.data;

  var getColourFrequencies = function () {
    const startIndex = 0; // StartIndex same as RGB enum: R=0, G=1, B=2

    let maxFrequency = 0;
    const colourFrequencies = Array(256).fill(0);

    for (let i = startIndex, len = data.length; i < len; i += 4) {
      colourFrequencies[data[i]]++;

      if (colourFrequencies[data[i]] > maxFrequency) {
        maxFrequency++;
      }
    }

    const result = {
      colourFrequencies: colourFrequencies,
      maxFrequency: maxFrequency,
    };

    histogram(colourFrequencies, maxFrequency)
    return result;
  }

  var brillo = function (k) {
    data1 = data
    var brightness = k || 100
    console.log(data,data1)
    for (var i = 0; i < data1.length; i += 4) {
      data1[i] = data1[i] + brightness
      data1[i + 1] = data1[i + 1] + brightness
      data1[i + 2] = data1[i + 2] + brightness
      
      if (data1[i] > 255) {
        data1[i] = 255;
      }
      if (data1[i + 1] > 255) {
        data1[i + 1] = 255;
      }
      if (data1[i + 2] > 255) {
        data1[i + 2] = 255;
      }

      if (data1[i] < -255) {
        data1[i] = -255;
      }
      if (data1[i + 1] < -255) {
        data1[i + 1] = -255;
      }
      if (data1[i + 2] < -255) {
        data1[i + 2] = -255;
      }
    }
    console.log(data,data1)

    ctxModify.putImageData(imageData1, 0, 0);
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


  var brightness = document.getElementById("brightness");
  brightness.oninput = function () {
    brillo(brightness.value)
  }

  var btnNegative = document.getElementById("btn-negative");
  btnNegative.addEventListener("click", invert);

  var btnAverageContrast = document.getElementById("btn-average-contrast");
  btnAverageContrast.addEventListener("click", getColourFrequencies);
}
