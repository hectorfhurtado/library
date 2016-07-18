### MOTIVACION

A lo largo de los años ha ido aumentando la cantidad de libros en formato pdf que me sirven de guía para los proyectos actuales y han permitido tener el hábito de leer todos los días.

Lo que he hecho hasta el momento es realizar el seguimiento de la lectura a través de un archivo .txt y a medida que voy terminando de leer un libro, lo muevo a alguna carpeta que mas o menos describa la categoría de este.

En otro archivo .txt escribo lo que me pareció el libro para saber si vale la pena releerlo en algún momento (creyendo que algún día tenga el tiempo para releer).

Con esta aplicación quiero llevar el seguimiento de forma automática, además de poder leer donde me quedé desde cualquier dispositivo conectado a la LAN, sirviendo el contenido desde un solo equipo evitando tener que copiar el o los archivos en el teléfono y la laptop, por ejemplo.

### Funcionamiento

En la carpeta __server__ tengo un script de nodeJs que sirve el contenido. Uso [pdf.js](https://mozilla.github.io/pdf.js/) para mostrar el contenido de los libros que los ubico en una carpeta llamada __ebooks__. Dentro de esta carpeta creo subcarpetas que vienen a ser las categorías donde guardo los libros que ya he leído.

Esta es la disposición de las carpetas

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

Aquí en Github excluyo las carpetas __ebooks__ por lo que contienen. Cuando no existe esta carpeta, la aplicación la crea.

Debes tener instalado [Node](https://nodejs.org/en/).

En la carpeta del proyecto, simplemente ejecutas `inicio.bat` en Windows o `./inicio` en Linux o Mac desde un terminal.
En la terminal aparecerá la IP a la que te puedes conectar si quieres acceder a la aplicación desde otro punto de la LAN.