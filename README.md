# Cambios de contraste - Procesamiento de imágenes

Aplicación web que permite aplicar filtros a una imagen y ver en tiempo real su histograma. 
https://procesamiento-de-imagenes.github.io/P1--Cambios-de-contraste-/
![image](https://user-images.githubusercontent.com/93720978/163727143-0007849d-e1c2-4ec1-ba18-34d2a0c06269.png)


Los filtros se realizan directamente con cada uno de los pixeles del canvas, todas las operaciones matriciales (convoluciones, transpuestas, determinantes, etc..) fueron programadas en JavaScript nativo.

La aplicación web cuenta con 17 filtros aplicables, incluyendo convoluciones, lineales y no lineales y de ajuste de contraste.
![image](https://user-images.githubusercontent.com/93720978/204661071-065f8643-e578-4def-a49b-cd198b87b3c2.png)

El usuario puede ingresar su propia matriz 3x3, 5x5 y 7x7, para aplicar su propio filtro convolucional. 
![image](https://user-images.githubusercontent.com/93720978/204660810-54022298-d311-40f7-802f-da7f7478dd4a.png)
![image](https://user-images.githubusercontent.com/93720978/204660891-b72c19d6-da74-4161-93e2-51fb118d18d8.png)
![image](https://user-images.githubusercontent.com/93720978/204660950-cc78cace-18bc-4941-9a79-2fb3ba208f2c.png)

El usuario puede cargar su propia imagen, aplicarle filtros y descargar el archivo modificado en formato ".png". 
![image](https://user-images.githubusercontent.com/93720978/204661785-99c230ef-6691-4e2a-aec9-fc869ef15b4b.png)


