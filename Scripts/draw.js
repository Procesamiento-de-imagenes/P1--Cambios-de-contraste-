import histogram from "./histograma.js";
import Inputs from "./inputs.js";

var btnDownload = document.getElementById('btnDownload');

var inputs = new Inputs()
inputs.generateInputs(3)

// Kernel size
var btnKernel3x3 = document.getElementById('btnKernel3x3');
var btnKernel5x5 = document.getElementById('btnKernel5x5');
var btnKernel7x7 = document.getElementById('btnKernel7x7');


btnKernel3x3.addEventListener('click',(e)=>{
  if(btnKernel3x3.checked) {
    inputs.generateInputs(3)
  }
})
btnKernel5x5.addEventListener('click',(e)=>{
  if(btnKernel5x5.checked) {
    inputs.generateInputs(5)
  }
})
btnKernel7x7.addEventListener('click',(e)=>{
  if(btnKernel7x7.checked) {
    inputs.generateInputs(7)
  }
})


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
  var convolute = function(pixels, kernel, apply) {
    var side = Math.round(Math.sqrt(kernel.length));
    var halfSide = Math.floor(side/2);
    var src = pixels.data;
    var sw = pixels.width;
    var sh = pixels.height;
    // pad output by the convolution matrix
    var w = sw;
    var h = sh;
    // go through the destination image pixels
    let copyPixels = copyData
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
              var wt = kernel[cy*side+cx];
              r += src[srcOff]   * wt;
              g += src[srcOff+1] * wt;
              b += src[srcOff+2] * wt;
            }
          }
        }
        copyPixels[dstOff]    = r;
        copyPixels[dstOff+1]  = g;
        copyPixels[dstOff+2]  = b;
      }
    }
    if(apply){
      copyData = copyPixels
      ctxModify.putImageData(copyImageData, 0, 0);
      histogram(getColourFrequencies(copyData), 'modImg', isGrayScale);
      btnDownload.href = modify.toDataURL();
    }
    return copyPixels;
  }
  var noLinealMinimo = function(pixels, side) {

    let min = 255;

    var halfSide = Math.floor(side/2);
    var src = pixels.data;
    var sw = pixels.width;
    var sh = pixels.height;
    // pad output by the convolution matrix
    var w = sw;
    var h = sh;
    // go through the destination image pixels
    for (var y=0; y<h; y++) {
      for (var x=0; x<w; x++) {
        var sy = y;
        var sx = x;
        var dstOff = (y*w+x)*4;
        // calculate the weighed sum of the source image pixels that
        // fall under the convolution matrix
        for (var cy=0; cy<side; cy++) {
          for (var cx=0; cx<side; cx++) {
            var scy = sy + cy - halfSide;
            var scx = sx + cx - halfSide;
            if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
              var srcOff = (scy*sw+scx)*4;
              min = 255;
              if (min > src[srcOff]  ) min = src[srcOff];
              if (min > src[srcOff+1]) min = src[srcOff+1];
              if (min > src[srcOff+2]) min = src[srcOff+2];
            }
          }
        }
        copyData[dstOff]    = min;
        copyData[dstOff+1]  = min;
        copyData[dstOff+2]  = min;
      }
    }
    ctxModify.putImageData(copyImageData, 0, 0);
    histogram(getColourFrequencies(copyData), 'modImg', isGrayScale);
    btnDownload.href = modify.toDataURL();
    
    return copyData;
  };
  var noLinealMediana = function(pixels, side) {
    let vecindad = new Array();
    let mediana;
    var halfSide = Math.floor(side/2);
    var src = pixels.data;
    var sw = pixels.width;
    var sh = pixels.height;
    // pad output by the convolution matrix
    var w = sw;
    var h = sh;
    // go through the destination image pixels

    for (var y=0; y<h; y++) {
      for (var x=0; x<w; x++) {
        var sy = y;
        var sx = x;
        var dstOff = (y*w+x)*4;
        // calculate the weighed sum of the source image pixels that
        // fall under the convolution matrix
        for (var cy=0; cy<side; cy++) {
          for (var cx=0; cx<side; cx++) {
            vecindad = []
            var scy = sy + cy - halfSide;
            var scx = sx + cx - halfSide;
            if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
              var srcOff = (scy*sw+scx)*4;
              vecindad.push(src[srcOff    ])
              vecindad.push(src[srcOff + 1])
              vecindad.push(src[srcOff + 2])
              mediana = quickselect_median(vecindad)
            }
          }
        }
        copyData[dstOff]    = mediana;
        copyData[dstOff+1]  = mediana;
        copyData[dstOff+2]  = mediana;
      }
    }
    ctxModify.putImageData(copyImageData, 0, 0);
    histogram(getColourFrequencies(copyData), 'modImg', isGrayScale);
    btnDownload.href = modify.toDataURL();
    
    return copyData;
  };
  // Trying some array

  function quickselect_median(arr) {
    const L = arr.length, halfL = L/2;
    if (L % 2 == 1)
        return quickselect(arr, halfL);
    else
        return 0.5 * (quickselect(arr, halfL - 1) + quickselect(arr, halfL));
  }

  function quickselect(arr, k) {
    // Select the kth element in arr
    // arr: List of numerics
    // k: Index
    // return: The kth element (in numerical order) of arr
    if (arr.length == 1)
        return arr[0];
    else {
        const pivot = arr[0];
        const lows = arr.filter((e)=>(e<pivot));
        const highs = arr.filter((e)=>(e>pivot));
        const pivots = arr.filter((e)=>(e==pivot));
        if (k < lows.length) // the pivot is too high
          return quickselect(lows, k);
        else if (k < lows.length + pivots.length)// We got lucky and guessed the median
          return pivot;
        else // the pivot is too low
          return quickselect(highs, k - lows.length - pivots.length);
    }
  }
  
  var noLinealMaximo = function(pixels, side) {

    let max = 0;

    var halfSide = Math.round(side/2);
    var src = pixels.data;
    var sw = pixels.width;
    var sh = pixels.height;
    // pad output by the convolution matrix
    var w = sw;
    var h = sh;
    // go through the destination image pixels
    for (var y=0; y<h; y++) {
      for (var x=0; x<w; x++) {
        var sy = y;
        var sx = x;
        var dstOff = (y*w+x)*4;
        for (var cy=0; cy<side; cy++) {
          for (var cx=0; cx<side; cx++) {
            var scy = sy + cy - halfSide;
            var scx = sx + cx - halfSide;
            if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
              max = 0;
              var srcOff = (scy*sw+scx)*4;
              if (max < src[srcOff]  ) max = src[srcOff];
              if (max < src[srcOff+1]) max = src[srcOff+1];
              if (max < src[srcOff+2]) max = src[srcOff+2];
            }
          }
        }
        copyData[dstOff]    = max;
        copyData[dstOff+1]  = max;
        copyData[dstOff+2]  = max;
      }
    }
    ctxModify.putImageData(copyImageData, 0, 0);
    histogram(getColourFrequencies(copyData), 'modImg', isGrayScale);
    btnDownload.href = modify.toDataURL();
    
    return copyData;
  };
  function calcularFrecuencia(numero, vector){
    var num_veces=0
    for (var pos in vector) {
        if (vector[pos]==numero) {
            num_veces++
        }
    }
    return num_veces
  }
  function obtenerPosMayor(vector_valores){
    var posMayor=0
    var numMayor=vector_valores[0]
    for (var pos in vector_valores){
        if (vector_valores[pos]>numMayor) {
            numMayor=vector_valores[pos]
            posMayor=pos
        }
    }
    return posMayor
  }
  function obtenerModa(vector_valores){
    var frecuencias=new Array(vector_valores.length)
    for (var pos in vector_valores){
         var numero=vector_valores[pos]
         frecuencias[pos]=calcularFrecuencia(numero, vector_valores)
    }
    var posModa=obtenerPosMayor(frecuencias)
    return vector_valores[posModa]

  }
  var noLinealModa = function(pixels, side) {
    let vecindad = new Array();
    let n = new Array();
    let moda;
    var halfSide = Math.floor(side/2);
    var src = pixels.data;
    var sw = pixels.width;
    var sh = pixels.height;
    // pad output by the convolution matrix
    var w = sw;
    var h = sh;
    // go through the destination image pixels

    for (var y=0; y<h; y++) {
      for (var x=0; x<w; x++) {
        var sy = y;
        var sx = x;
        var dstOff = (y*w+x)*4;
        // calculate the weighed sum of the source image pixels that
        // fall under the convolution matrix
        for (var cy=0; cy<side; cy++) {
          for (var cx=0; cx<side; cx++) {
            vecindad = []
            var scy = sy + cy - halfSide;
            var scx = sx + cx - halfSide;
            if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
              var srcOff = (scy*sw+scx)*4;
              vecindad.push(src[srcOff    ])
              vecindad.push(src[srcOff + 1])
              vecindad.push(src[srcOff + 2])
              moda = obtenerModa(vecindad)
              n.push(moda)
            }
          }
        }
        copyData[dstOff]    = moda;
        copyData[dstOff+1]  = moda;
        copyData[dstOff+2]  = moda;
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

  }
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
  var pasaBajos = function(apply){
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
    return convolute(imageData, kernel, apply)
  }
  var pasaAltos = function(apply){
    if(btnKernel3x3.checked){
      var kernel = 
                [-1,-1,-1,
                  -1, 8,-1,
                  -1,-1,-1
                ];
    }else if(btnKernel5x5.checked){
      var kernel = 
                [  -1, -1,  -1, -1, -1,
                   -1, -1,  -1, -1, -1,
                   -1, -1,  23, -1, -1,
                   -1, -1,  -1, -1, -1,
                   -1, -1,  -1, -1, -1
                  ];
    }else{
      var kernel = 
                [ -1, -1,  -1,  -1,  -1,  -1,  -1,
                  -1, -1,  -1,  -1,  -1,  -1,  -1,
                  -1, -1,  -1,  -1,  -1,  -1,  -1,
                  -1, -1,  -1,  48,  -1,  -1,  -1,
                  -1, -1,  -1,  -1,  -1,  -1,  -1,
                  -1, -1,  -1,  -1,  -1,  -1,  -1,
                  -1, -1,  -1,  -1,  -1  ,-1,  -1
                  ];
    }
    return convolute(imageData, kernel, apply)
  }
  var pasaBanda = function(a, apply){
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
    convolute(imageData, kernel, apply)
  }

  var highBoostPasaBajos = function(a){
    let pasaBajosData = pasaBajos(false);

    for (var i = 0; i < copyData.length; i += 4) {

      copyData[i    ] = (a-1)*(data[i    ])   +  data[i    ] - pasaBajosData[i    ]; // red
      copyData[i + 1] = (a-1)*(data[i + 1])   +  data[i + 1] - pasaBajosData[i + 1]; // green
      copyData[i + 2] = (a-1)*(data[i + 2])   +  data[i + 2] - pasaBajosData[i + 2]; // blue

      if (copyData[i] > 255) copyData[i] = 255;
      if (copyData[i] <   0) copyData[i] = 0;
    }
    ctxModify.putImageData(copyImageData, 0, 0);
    histogram(getColourFrequencies(copyData), 'modImg', isGrayScale);
    btnDownload.href = modify.toDataURL();
  }
  var highBoostPasaAltos = function(a){
    let pasaAltosData = pasaAltos(false);

    for (var i = 0; i < copyData.length; i += 4) {

      copyData[i    ] = (a-1)*(data[i    ])+data[i] - pasaAltosData[i    ]; // red
      copyData[i + 1] = (a-1)*(data[i + 1])+data[i + 1] - pasaAltosData[i + 1]; // green
      copyData[i + 2] = (a-1)*(data[i + 2])+data[i + 2] - pasaAltosData[i + 2]; // blue

      if (copyData[i] > 255) copyData[i] = 255;
      if (copyData[i] <   0) copyData[i] = 0;
    }
  
    ctxModify.putImageData(copyImageData, 0, 0);
    histogram(getColourFrequencies(copyData), 'modImg', isGrayScale);
    btnDownload.href = modify.toDataURL();
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
  pasaBajosBtn.addEventListener("click",(e)=>{pasaBajos(true);})

  var pasaAltosBtn = document.getElementById("pasaAltos");
  pasaAltosBtn.addEventListener("click",(e)=>{pasaAltos(true);;})

  var pasaBandasRange = document.getElementById("pasaBandasRange");
  var pasaBandasNumber = document.getElementById("pasaBandasNumber");

  pasaBandasRange.oninput = (e) => {
    pasaBanda(pasaBandasNumber.value, true)
  }
  pasaBandasNumber.oninput = (e) => {
    pasaBanda(pasaBandasNumber.value, true)
  }

  // High boost
  var HBPasaBajosRange = document.getElementById("HBPasaBajosRange");
  var HBPasaBajosNumber = document.getElementById("HBPasaBajosNumber");

  HBPasaBajosNumber.onchange = (e) => {
    highBoostPasaBajos(HBPasaBajosNumber.value)
  }
  HBPasaBajosRange.onchange = (e) => {
    highBoostPasaBajos(HBPasaBajosNumber.value)
  }

  var HBPasaAltosRange = document.getElementById("HBPasaAltosRange");
  var HBPasaAltosNumber = document.getElementById("HBPasaAltosNumber");

  HBPasaAltosRange.onchange = (e) => {
    highBoostPasaAltos(HBPasaAltosNumber.value)
  }
  HBPasaAltosNumber.onchange = (e) => {
    highBoostPasaAltos(HBPasaAltosNumber.value)
  }
// Matriz personalizada 
  var form = document.getElementById('inputMatrixGroup');
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    let matrix = inputs.getInputMatrix();
    return convolute(imageData, matrix, true)
  })
  
// Filtros no lineales 
  var maximo = document.getElementById('maximo')
  var minimo = document.getElementById('minimo')
  var mediana = document.getElementById('mediana')
  var moda= document.getElementById('moda')

  maximo.addEventListener('click', ()=>{
    noLinealMaximo(imageData, 3)
  })
  minimo.addEventListener('click', ()=>{
    noLinealMinimo(imageData, 3)
  })
  mediana.addEventListener('click', ()=>{
    noLinealMediana(imageData, 3)
  })
  moda.addEventListener('click', ()=>{
    noLinealModa(imageData, 3)
  })



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
