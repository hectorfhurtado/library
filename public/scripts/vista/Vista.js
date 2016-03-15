/* global Nando */

( function()
{
    Nando.Vista =
    {
        /**
         * Con la lista de libros que obtenemos del servidor, armamos las categorias que estan guardadas en disco.
         * Las mostramos al usuario a traves de links
         * @param   {Array}               libros Lista con los libros encontrados en disco
         * @returns {Promise<DOMElement>} La lista para ser adicionada al DOM
         */
        muestra( libros )
        {
            return new Promise( function( res )
            {
                const categorias = Object.keys( libros )

                let fragmento = document.createDocumentFragment()

                categorias.forEach( function( categoria )
                {
                    const $ul           = document.createElement( 'ul' )
                    const $strong       = document.createElement( 'strong' )
                    $strong.textContent = categoria

                    $ul.appendChild( $strong )

                    libros[ categoria ].forEach( function( libro )
                    {
                        let $li = document.createElement( 'li' )

                        let $a = document.createElement( 'a' )
                        $a.href = ( categoria == 'Sin leer') ? libro : `${ categoria }/${ libro }`
                        $a.textContent = libro

                        $li.appendChild( $a)
                        $ul.appendChild( $li )
                    })
                    fragmento.appendChild( $ul )
                })

                res( fragmento )
            }.bind( this ))
        },

        /**
         * Si tenemos informacion acerca del ebook, le decimos al visor de pdf que vaya a la pagina que
         * obtucimos y la guardamos para actualizarla luego. Si no, solo mostramos el libro
         * @param {object} data      tiene la categoria pagina de lectura actual, etc
         * @param {string} nombrePdf El nombre del ebook
         */
        cargaViewerCon( data, nombrePdf )
        {
            Nando.Cargador.trae( 'Elementos' )
                .then( Elementos => Elementos.damePorId( 'iframe' ))
                .then( function( $iframe )
                {
                    if ( data )
                    {
                        $iframe.src = `/web/viewer.html?file=${ nombrePdf }#page=${ data.actual }&zoom=page-width`

                        sessionStorage.setItem( 'readingBook', JSON.stringify({
                            nombre: nombrePdf,
                            data  : data,
                        }))
                    }
                    else
                    {
                        $iframe.src = `/web/viewer.html?file=${ nombrePdf }#zoom=page-width`

                        sessionStorage.setItem( 'readingBook', null )
                    }
                })
        },

        /**
         * Leemos los datos del ebook de sessionStorage y enviamos una peticion para actualizar la
         * pagina en la que vamos en caso de que estemos leyendo el ebook
         * @param {string} paginaActual Lo obtenemos del ifram
         */
        actualizaLecturaCon( paginaActual )
        {
            const data = sessionStorage.getItem( 'readingBook' )

            if ( !data ) return

            const infoLibro = JSON.parse( data )

            fetch( 'book.fetch', {
                method: 'POST',
                body: JSON.stringify({ actual: paginaActual, libro: infoLibro.nombre }),
            })
        }
    }
})()
