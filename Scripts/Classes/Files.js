export default class Files{

    validateFile(inputFile) {
        var route = inputFile.value;
        var btnDownload = document.getElementById('btnDownload');
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
    
}