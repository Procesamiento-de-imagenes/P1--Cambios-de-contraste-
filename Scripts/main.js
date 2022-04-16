























// Upload Image
var uploadImage = document.getElementById("uploadImage");
uploadImage.onchange = (e) => {
    validateFile(uploadImage)
  }
var btnDownload = document.getElementById('btnDownload');
btnDownload.href = modify.toDataURL();