### MOTIVACION

A lo largo de los anos ha ido aumentando la cantidad de libros en formato pdf que me sirven de guia para los proyectos actuales y han permitido tener el habito de leer todos los dias.

Lo que he hecho hasta el momento es realizar el seguimiento de la lectura a traves de un archivo .txt y a medida que voy terminando de leer un libro, lo muevo a alguna carpeta que mas o menos describa la categoria de este.

En otro archivo .txt escribo lo que me parecio el libro para saber si vale la pena releerlo en algun momento (creyendo que algun dia tenga el tiempo para releer).

Con esta aplicacion quiero llevar el seguimiento de forma automatica, ademas de poder leer donde me quede desde cualquier dispositivo conectado a la LAN, sirviendo el contenido desde un solo equipo evitando tener que copiar el o los archivos en el telefono y la laptop, por ejemplo.

### Funcionamiento

En la carpeta __server__ tengo un script de nodeJs que sirve el contenido. Uso [pdf.js](https://mozilla.github.io/pdf.js/) para mostrar el contenido de los libros que los ubico en una carpeta llamada __ebooks__. Dentro de esta carpeta creo subcarpetas que vienen a ser las categorias donde guardo los libros que ya he leido.

Esta es la disposicion de las carpetas

```
│   .gitignore
│   .jshintrc
│   LICENSE
│   package.json
│   README.md
│
├───ebooks
│   │   Android_Application_Security_Essentials.pdf
│   │   Android_NDK_Beginner’s_Guide.pdf
│   │   Android_NDK_Game_Development_Cookbook.pdf
│   │   Arduino_Home_Automation_Projects.pdf
│   │   asn1_book.PDF
|   ...lista de archivos y carpetas
│   │
│   └───WebRTC
│           Getting_started_with_WebRTC.pdf
│           Real_Time_Communication_with_WebRTC.pdf
│
├───lib
│       book.js
│       list.js
│
├───public
│   │   favicon.ico
│   │   index.html
│   │   index.js
│   │
│   ├───build
│   │       pdf.js
│   │       pdf.worker.js
│   │
│   └───web
│       │   compatibility.js
│       │   compressed.tracemonkey-pldi-09.pdf
│       │   debugger.js
│       │   l10n.js
│       │   viewer.css
│       │   viewer.html
│       │   viewer.js
│       │
│       ├───cmaps
│       │       78-EUC-H.bcmap
│       ... mas archivos que ni idea
│       │       V.bcmap
│       │       WP-Symbol.bcmap
│       │
│       ├───images
│       │       annotation-check.svg
│       ...muchas images de pdf.js
│       │       annotation-help.svg
│       │       treeitem-expanded@2x.png
│       │
│       └───locale
│           │   locale.properties
│           │
│           ├───ach
│           │       viewer.properties
│           │
│           ... una cantidad enorme de carpetas
│           │
│           └───zu
│                   viewer.properties
│
└───server
        index.js
        reading.json
```

Aqui en Github excluyo las carpetas __ebooks__ por lo que contienen. Cuando no existe esta carpeta, la aplicacion la crea.

Debes tener instalado [Node](https://nodejs.org/en/).

En la carpeta del proyecto, simplemente ejecutas `server.bat` o `node server\index.js` en Windows o `node server/index.js` en Linux o Mac desde un terminal.

__Nota:__ uso funciones async/await que en este momento solo estan en Edge y en Chrome Canary (pasando el argumento `--js-flags="--harmony-async-await"`) en el ejecutable. Asi que puede que no "funcione" de una, pero es mientras los navegadores se actualizan al nuevo estandar.