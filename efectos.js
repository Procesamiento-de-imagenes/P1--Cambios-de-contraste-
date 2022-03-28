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
var isGrayScale= false;
var auxBrrllo = 0;
var auxContrast = 0;
var auxRaiz = 0;


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

  var imageData     = ctx.getImageData(0, 0, canvas.width, canvas.height);
  var copyImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // get pixels
  var data      = imageData.data;
  var copyData  = copyImageData.data;

  var getColourFrequencies = function (data_) {
    const startIndex = 0; // StartIndex same as RGB enum: R=0, G=1, B=2

    const r = Array(256).fill(0);
    const g = Array(256).fill(0);
    const b = Array(256).fill(0);


    for (let i = startIndex, len = data_.length; i < len; i += 4) {
      r[data_[i     ]]++;
      g[data_[i + 1 ]]++;
      b[data_[i + 2 ]]++;
    }

    const result = {
      r,
      g,
      b,
    };

    return result;
  };

  var colourFrequencies = getColourFrequencies(data)
  var copyColourFrequencies = getColourFrequencies(data)

  var getMaxAndMin = function(){
    let rMin = 255;
    let gMin = 255;
    let bMin = 255;

    let rMax = 0;
    let gMax = 0;
    let bMax = 0;

    for (var i = 0; i < data.length; i += 4) {
      if (rMin > data[i]) rMin = data[i];
      if (gMin > data[i + 1]) gMin = data[i + 1];
      if (bMin > data[i + 2]) bMin = data[i + 2];

      if (rMax < data[i]) rMax = data[i];
      if (gMax < data[i + 1]) gMax = data[i + 1];
      if (bMax < data[i + 2]) bMax = data[i + 2];
    }

    return {rMin, gMin, bMin, rMax, gMax, bMax};
  }
  var getCumulativeDistribution = function(n, colorFrequency){
    let  c=0;
    for (let i = 0; i < n; i++) {
      c = colorFrequency[i] + c;
    }
    return c;
  }
  var equalization = function (){
    let  cR=0, cG=0, cB=0;
    let limits = getMaxAndMin();

    if(isGrayScale){
      for (let i = 0; i < copyData.length; i += 4) {
        cR = getCumulativeDistribution (copyData[i    ], colourFrequencies.r)
  
        copyData[i    ] = Math.round(Math.abs(((cR-limits.rMin)/(data.length/4-limits.rMin))*255));
        copyData[i + 1] = Math.round(Math.abs(((cR-limits.gMin)/(data.length/4-limits.gMin))*255));
        copyData[i + 2] = Math.round(Math.abs(((cR-limits.bMin)/(data.length/4-limits.bMin))*255));
      }
    }else{
      for (let i = 0; i < copyData.length; i += 4) {
        cR = getCumulativeDistribution (copyData[i    ], colourFrequencies.r)
        cG = getCumulativeDistribution (copyData[i + 1], colourFrequencies.g)
        cB = getCumulativeDistribution (copyData[i + 2], colourFrequencies.b)
  
        copyData[i    ] = Math.round(Math.abs(((cR-limits.rMin)/(data.length/4-limits.rMin))*255));
        copyData[i + 1] = Math.round(Math.abs(((cG-limits.gMin)/(data.length/4-limits.gMin))*255));
        copyData[i + 2] = Math.round(Math.abs(((cB-limits.bMin)/(data.length/4-limits.bMin))*255));
      }
    }
    ctxModify.putImageData(copyImageData, 0, 0);
    histogram(getColourFrequencies(copyData), 'modImg', isGrayScale);
    btnDownload.href = modify.toDataURL();
  }
 
  var convolution = function (data, copyData, kernel, divisor, offset) {
    let w = newWidth, h = newHeight;
    // get matrix dimensions
    let rowOffset = Math.floor(kernel.length/2);
    let colOffset = Math.floor(kernel[0].length/2);
    
    for (let row = 0; row < h; row++) {
      for (let col = 0; col < w; col++) {
        var result = [0, 0, 0];

        for (let kRow = 0; kRow < kernel.length; kRow++) {
          for (let kCol = 0; kCol < kernel[kRow].length; kCol++) {
            var kVal = kernel[kRow][kCol];

            var pixelRow = row + kRow - rowOffset;
            var pixelCol = col + kCol - colOffset;

            if(pixelRow < 0 || pixelRow >=h || pixelCol <0 || pixelCol >=w) 
              continue
            
            var srcIndex = (pixelRow * w + pixelCol)*4;

            for (let chanel = 0; chanel < 3; chanel++) {
                let pixel = data[srcIndex + chanel];
                result[chanel] += pixel * kVal;
            }

          }
        }
        var dstIndex = (row * w + col)*3;

        for (let chanel = 0; chanel < 3; chanel++) {
            let val = result[chanel]/divisor + offset;    
            copyData [dstIndex + chanel] =val;    
        }
      }
    }
    ctxModify.putImageData(copyImageData, 0, 0);
    histogram(getColourFrequencies(copyData), 'modImg', isGrayScale);
    btnDownload.href = modify.toDataURL();

    return copyData;
  }

  var invert = function () {
    for (var i = 0; i < copyData.length; i += 4) {
      copyData[i    ] = 255 - copyData[i    ]; // red
      copyData[i + 1] = 255 - copyData[i + 1]; // green
      copyData[i + 2] = 255 - copyData[i + 2]; // blue
    }
    ctxModify.putImageData(copyImageData, 0, 0);
    histogram(getColourFrequencies(copyData), 'modImg', isGrayScale);
    btnDownload.href = modify.toDataURL();

  };
  var grayscale = function () {

    for (var i = 0; i < copyData.length; i += 4) {
      var avg = (copyData[i] + copyData[i + 1] + copyData[i + 2]) / 3;
      copyData[i    ] = avg; // red
      copyData[i + 1] = avg; // green
      copyData[i + 2] = avg; // blue
    }
    ctxModify.putImageData(copyImageData, 0, 0);
    histogram(getColourFrequencies(copyData), 'modImg', isGrayScale);
    btnDownload.href = modify.toDataURL();

  };
  
  var automaticContrast = function () {
    
    let limits = getMaxAndMin();

    for (var i = 0; i < copyData.length; i += 4) {
      copyData[i    ] = ((copyData[i]     - limits.rMin) / (limits.rMax - limits.rMin)) * 255; // red
      copyData[i + 1] = ((copyData[i + 1] - limits.gMin) / (limits.gMax - limits.gMin)) * 255; // green
      copyData[i + 2] = ((copyData[i + 2] - limits.bMin) / (limits.bMax - limits.bMin)) * 255; // blue

      if (copyData[i    ] > 255) copyData[i    ] = 255;
      if (copyData[i + 1] > 255) copyData[i + 1] = 255;
      if (copyData[i + 2] > 255) copyData[i + 2] = 255;

      if (copyData[i    ] < 0) copyData[i] = 0;
      if (copyData[i + 1] < 0) copyData[i + 1] = 0;
      if (copyData[i + 2] < 0) copyData[i + 2] = 0;
    }
    ctxModify.putImageData(copyImageData, 0, 0);
    histogram(getColourFrequencies(copyData), 'modImg', isGrayScale);
    btnDownload.href = modify.toDataURL();
  };
  var brillo = function (k) {
    var brightness = k || 100;
    for (var i = 0; i < copyData.length; i += 4) {
      if (copyData[i] < k) {
        copyData[i    ] = data[i    ] + brightness;
        copyData[i + 1] = data[i + 1] + brightness;
        copyData[i + 2] = data[i + 2] + brightness;
      }

      if (copyData[i] > k) {
        copyData[i    ] =data[i    ] - brightness;
        copyData[i + 1] =data[i + 1] - brightness;
        copyData[i + 2] =data[i + 2] - brightness;
      }

      if (copyData[i    ] > 255) copyData[i    ] = 255;
      if (copyData[i + 1] > 255) copyData[i + 1] = 255;
      if (copyData[i + 2] > 255) copyData[i + 2] = 255;

      if (copyData[i    ] < 0) copyData[i     ] = 0;
      if (copyData[i + 1] < 0) copyData[i +  1] = 0;
      if (copyData[i + 2] < 0) copyData[i +  2] = 0;
    }
    auxBrrllo = (k-auxBrrllo) * -1;

    ctxModify.putImageData(copyImageData, 0, 0);
    histogram(getColourFrequencies(copyData), 'modImg', isGrayScale);
    btnDownload.href = modify.toDataURL();

  };
  var averageContrast = function (k_) {
    let k = k_ || 0;
    let promedio = copyData.reduce((prev, curr) => (curr += prev));
    promedio = promedio / copyData.length;

    for (var i = 0; i < copyData.length; i += 4) {
      copyData[i    ] = k * (data[i    ] - promedio) + promedio; // red
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
    histogram(getColourFrequencies(copyData), 'modImg', isGrayScale);
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
    histogram(getColourFrequencies(copyData), 'modImg', isGrayScale);
    btnDownload.href = modify.toDataURL();

  };



  var pasaBajos = function(){
    let kernel = [[1,1,1],[1,1,1],[1,1,1]];
    convolution(data, copyData, kernel, 1/9, 0)
  }

  var pasaAltos = function(){
    let kernel = [[-1,-1,-1],[-1, 8,-1],[-1,-1,-1]];
    convolution(data, copyData, kernel, 1/9, 0)
  }

  var pasaBanda = function(){
    let kernel = [[1,1,1],[1,1,1],[1,1,1]];
    convolution(data, copyData, kernel, 1/9, 0)
  }

  var highBoost = function(a){
    let kernel = [[1,-a,1],[-a,a^2,-a],[1,-a,1]];
    convolution(data, copyData, kernel, 1/9, 0)
  }



  // range input
  var valueContrast = document.getElementById("valueContrast");
  var inputAverageContrast = document.getElementById("average-contrast");
  inputAverageContrast.oninput = (e) => {
    averageContrast(inputAverageContrast.value);
    valueContrast.innerHTML = inputAverageContrast.value;
  };

  var valueRaiz = document.getElementById("valueRaiz");
  var inputRaizN = document.getElementById("raiz-n-esima");
  inputRaizN.onchange = (e) => {
    raizNEsima(inputRaizN.value);
    valueRaiz.innerHTML = inputRaizN.value;
  };
  var valueBrillo = document.getElementById("valueBrillo");
  var inputBrillo = document.getElementById("brillo");
  inputBrillo.oninput = (e) => {
    brillo(inputBrillo.value);
    valueBrillo.innerHTML = inputBrillo.value;
  };

  

  // buttons
  var btnReset = document.getElementById("btnReset");
  btnReset.onclick = (e) => {reset();};

  var btnNegative = document.getElementById("btn-negative");
  btnNegative.addEventListener("click", invert);

  var checkBoxGrayScale = document.getElementById("btn-gray");
  checkBoxGrayScale.addEventListener("click", (e)=>{
    isGrayScale = checkBoxGrayScale.checked;
    checkBoxGrayScale.checked?grayscale():reset();
  });

  var btnAutomaticContrast = document.getElementById("automaticContrast");
  btnAutomaticContrast.addEventListener("click", automaticContrast);

  var btnEqualization = document.getElementById("btn-equalization");
  btnEqualization.addEventListener("click", equalization);

  // Select
  var convolutionSelect = document.getElementById("convolutionSelect");
  convolutionSelect.addEventListener("change", ()=>{
    switch(convolutionSelect.selectedIndex){
      case 1:
        pasaBajos();
        break;
      case 2:
        pasaAltos();
        break;
      case 3:
        pasaBanda();
        break;
      case 3:
        highBoost();
        break;        
    }
  });

  // Upload Image
  var uploadImage = document.getElementById("uploadImage");
  uploadImage.onchange = (e) => {
    validateFile(uploadImage)
  }
  btnDownload.href = modify.toDataURL();

  // generate histogram
  histogram(colourFrequencies, 'orgImg');
  histogram(copyColourFrequencies, 'modImg', isGrayScale);

  var reset = function(){
    for (let i = 0; i < copyData.length; i++) {
      copyData[i] = imageData.data[i]
    }

    ctxModify.putImageData(copyImageData, 0, 0);
    checkBoxGrayScale.checked = false;
    isGrayScale = checkBoxGrayScale.checked;
    histogram(getColourFrequencies(copyData), 'modImg', isGrayScale);
  }
}
