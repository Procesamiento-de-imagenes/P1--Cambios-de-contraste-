import histogram from "./histograma.js";
var btnDownload = document.getElementById('btnDownload');



// Kernel size
var btnKernel3x3 = document.getElementById('btnKernel3x3');
var btnKernel5x5 = document.getElementById('btnKernel5x5');
var btnKernel7x7 = document.getElementById('btnKernel7x7');



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
img.src = "./img/image.jpg";
img.onload = function () {
  draw(this);
};
var isGrayScale= false;
var auxBrrllo = 0;


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
  var convolute = function(pixels, weights) {
    var side = Math.round(Math.sqrt(weights.length));
    var halfSide = Math.floor(side/2);
    var src = pixels.data;
    var sw = pixels.width;
    var sh = pixels.height;
    // pad output by the convolution matrix
    var w = sw;
    var h = sh;
    var dst = copyImageData.data;
    // go through the destination image pixels
    for (var y=0; y<h; y++) {
      for (var x=0; x<w; x++) {
        var sy = y;
        var sx = x;
        var dstOff = (y*w+x)*4;
        // calculate the weighed sum of the source image pixels that
        // fall under the convolution matrix
        var r=0, g=0, b=0, a=0;
        for (var cy=0; cy<side; cy++) {
          for (var cx=0; cx<side; cx++) {
            var scy = sy + cy - halfSide;
            var scx = sx + cx - halfSide;
            if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
              var srcOff = (scy*sw+scx)*4;
              var wt = weights[cy*side+cx];
              r += src[srcOff] * wt;
              g += src[srcOff+1] * wt;
              b += src[srcOff+2] * wt;
            }
          }
        }
        dst[dstOff] = r;
        dst[dstOff+1] = g;
        dst[dstOff+2] = b;
      }
    }
    ctxModify.putImageData(copyImageData, 0, 0);
    histogram(getColourFrequencies(dst), 'modImg', isGrayScale);
    btnDownload.href = modify.toDataURL();
    return dst;
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
    if(btnKernel3x3.checked){
      var kernel = 
                [  1/9, 1/9,  1/9,
                   1/9, 1/9,  1/9,
                   1/9, 1/9,  1/9 
                  ];
    }else if(btnKernel5x5.checked){
      var kernel = 
                [  1/25, 1/25,  1/25, 1/25, 1/25,
                   1/25, 1/25,  1/25, 1/25, 1/25,
                   1/25, 1/25,  1/25, 1/25, 1/25,
                   1/25, 1/25,  1/25, 1/25, 1/25,
                   1/25, 1/25,  1/25,  1/25, 1/25
                  ];
    }else{
      var kernel = 
      [  1/49, 1/49,  1/49, 1/49, 1/49, 1/49, 1/49,
         1/49, 1/49,  1/49, 1/49, 1/49, 1/49, 1/49,
         1/49, 1/49,  1/49, 1/49, 1/49, 1/49, 1/49,
         1/49, 1/49,  1/49, 1/49, 1/49, 1/49, 1/49,
         1/49, 1/49,  1/49, 1/49, 1/49, 1/49, 1/49,
         1/49, 1/49,  1/49, 1/49, 1/49, 1/49, 1/49,
         1/49, 1/49,  1/49,  1/49, 1/49, 1/49, 1/49
        ];
    }
    convolute(imageData, kernel)
  }

  var pasaAltos = function(){
    if(btnKernel3x3.checked){
      var kernel = 
                [-1,-1,-1,
                  -1, 9,-1,
                  -1,-1,-1
                ];
    }else if(btnKernel5x5.checked){
      var kernel = 
                [  -1, -1,  -1, -1, -1,
                   -1, -1,  -1, -1, -1,
                   -1, -1,  25, -1, -1,
                   -1, -1,  -1, -1, -1,
                   -1, -1,  -1,  -1, -1
                  ];
    }else{
      var kernel = 
                [ -1, -1,  -1,  -1,  -1,  -1,  -1,
                  -1, -1,  -1,  -1,  -1,  -1,  -1,
                  -1, -1,  -1,  -1,  -1,  -1,  -1,
                  -1, -1,  -1,  49,  -1,  -1,  -1,
                  -1, -1,  -1,  -1,  -1,  -1,  -1,
                  -1, -1,  -1,  -1,  -1,  -1,  -1,
                  -1, -1,  -1,  -1,  -1  ,-1,  -1
                  ];
    }
    convolute(imageData, kernel)
  }

  var pasaBanda = function(a){
    if(btnKernel3x3.checked){
      var kernel = 
                [ 1,  -a,   1,
                  -a,  a*a, -a,
                  1,  -a,   1
                ];
    }else if(btnKernel5x5.checked){
      var kernel = 
                [ -a,  1,  -a,  1,  -a,
                  1,  -a,  1,  -a,  1,
                  -a, 1, a*a, 1,  -a,
                  1,  -a,  1,  -a,  1,
                  -a,  1,  -a,  1,  -a,
                ];
    }else{
      var kernel = 
                [ 1, -a,  1,  -a,  1,  -a,  1,
                  -a, 1,  -a,  1,  -a,  1,  -a,
                  1, -a,  1,  -a,  1,  -a,  1,
                  -a, 1,  -a, a*a,  -a,  1,  -a,
                  1, -a,  1,  -a,  1,  -a,  1,
                  -a, 1,  -a,  1,  -a,  1,  -a,
                  1, -a,  1,  -a,  1  ,-a,  1
                  ];
    }
    kernel = kernel.map(x => x*(Math.pow(1/a+2, 2)))
    convolute(imageData, kernel)
  }

  var highBoost = function(a){
    let kernel = [1,1,1,
      1,1,1,
      1,1,1];
    // convolute(imageData, kernel)
  }
  var highBoostPasaBajos = function(a){
    let kernel = [1,1,1,
      1,1,1,
      1,1,1];
    // convolute(imageData, kernel)
  }
  var highBoostPasaAltos = function(a){
    let kernel = [1,1,1,
      1,1,1,
      1,1,1];
    // convolute(imageData, kernel)
  }

  // range input
  var inputAverageContrast = document.getElementById("averageContrast");
  var averageContrastInp = document.getElementById("averageContrastInp");
  averageContrastInp.oninput = (e) => {
    averageContrast(inputAverageContrast.value);
  };
  inputAverageContrast.oninput = (e) => {
    averageContrast(inputAverageContrast.value);
  };

  var inputRaizN = document.getElementById("raiz");
  var raizInp = document.getElementById("raizInp");
  raizInp.onchange = (e) => {
    raizNEsima(inputRaizN.value);
  };
  inputRaizN.onchange = (e) => {
    raizNEsima(inputRaizN.value);
  };

  var brilloInp = document.getElementById("brilloInp");
  var inputBrillo = document.getElementById("brillo");
  brilloInp.onchange = (e) => {
    brillo(inputBrillo.value);
  };
  inputBrillo.oninput = (e) => {
    brillo(inputBrillo.value);
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

  // convolutions
  var pasaBajosBtn = document.getElementById("pasaBajos");
  var pasaAltosBtn = document.getElementById("pasaAltos");

  pasaBajosBtn.addEventListener("click",(e)=>{pasaBajos();})
  pasaAltosBtn.addEventListener("click",(e)=>{pasaAltos();;})

  var pasaBandasRange = document.getElementById("pasaBandasRange");
  var pasaBandasNumber = document.getElementById("pasaBandasNumber");

  pasaBandasRange.oninput = (e) => {
    pasaBanda(pasaBandasNumber.value)
  }
  pasaBandasNumber.oninput = (e) => {
    pasaBanda(pasaBandasNumber.value)
  }

  // High boost
  var HighBoostRange = document.getElementById("HighBoostRange");
  var HighBoostNumber = document.getElementById("HighBoostNumber");

  HighBoostNumber.onchange = (e) => {
    highBoost(HighBoostNumber.value)
  }
  HighBoostRange.onchange = (e) => {
    highBoost(HighBoostNumber.value)
  }

  var HBPasaBajosRange = document.getElementById("HBPasaBajosRange");
  var HBPasaBajosNumber = document.getElementById("HBPasaBajosNumber");

  HBPasaBajosNumber.onchange = (e) => {
    highBoost(HBPasaBajosNumber.value)
  }
  HBPasaBajosRange.onchange = (e) => {
    highBoost(HBPasaBajosNumber.value)
  }


  var HBPasaAltosRange = document.getElementById("HBPasaAltosRange");
  var HBPasaAltosNumber = document.getElementById("HBPasaAltosNumber");

  HBPasaAltosRange.onchange = (e) => {
    highBoost(HBPasaAltosNumber.value)
  }
  HBPasaAltosNumber.onchange = (e) => {
    highBoost(HBPasaAltosNumber.value)
  }




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
  reset()

}
