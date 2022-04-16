export default class Draw {
  constructor(img) {
    this.img = img;
  }

  drawImages(img) {
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
    const yOffset =
      newHeight > canvas.height ? (canvas.height - newHeight) / 2 : 0;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctxModify.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(img, xOffset, yOffset, newWidth, newHeight);
    ctxModify.drawImage(img, xOffset, yOffset, newWidth, newHeight);

    img.style.display = "none";

    this.imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    this.copyImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  }
  getPixels() {
    return { imageData, copyImageData };
  }

  getColourFrequencies = function (data_) {
    const startIndex = 0; // StartIndex same as RGB enum: R=0, G=1, B=2

    const r = Array(256).fill(0);
    const g = Array(256).fill(0);
    const b = Array(256).fill(0);

    for (let i = startIndex, len = data_.length; i < len; i += 4) {
      r[data_[i]]++;
      g[data_[i + 1]]++;
      b[data_[i + 2]]++;
    }

    const result = {r, g, b};

    return result;
  };

  getMaxAndMin = function(){
    let data = this.imageData
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

  getCumulativeDistribution = function(n, colorFrequency){
    let  c=0;
    for (let i = 0; i < n; i++) {
      c = colorFrequency[i] + c;
    }
    return c;
  }
  
  equalization = function (){
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
}
