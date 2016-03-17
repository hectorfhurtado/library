/* global Nando */

( function() {

    Nando.Vista = {
        /**
         * Con la lista de libros que obtenemos del servidor, armamos las categorias que estan guardadas en disco.
         * Las mostramos al usuario a traves de links
         * @param   {Array}               libros Lista con los libros encontrados en disco
         * @returns {Promise<DOMElement>} La lista para ser adicionada al DOM
         */
        muestra( libros ) {

            return new Promise( function( res ) {
                const categorias = Object.keys( libros )

                let fragmento = document.createDocumentFragment()

                categorias.forEach( function( categoria ) {
                    const $ul           = document.createElement( 'ul' )
                    const $strong       = document.createElement( 'strong' )
                    $strong.textContent = categoria

                    $ul.appendChild( $strong )

                    libros[ categoria ].forEach( function( libro ) {
                        let $li = document.createElement( 'li' )

                        let $a = document.createElement( 'a' )
                        $a.textContent = libro

                        switch ( categoria ) {

                            case 'Leyendo':
                                if ( /\//.test( libro )) $a.textContent = libro.split( '/' )[ 1 ]
                                // No hay break, continua en el siguiente 'case'

                            case 'Sin leer':
                                $a.href = libro
                                break

                            default:
                                $a.href = `${ categoria }/${ libro }`
                                break
                        }

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
        cargaViewerCon( data, nombrePdf ) {

            Nando.Cargador.trae( 'Elementos' )
                .then( function( Elementos ) {

                    return Promise.all([
                        Elementos.damePorId( 'iframe' ),
                        Elementos.damePorId( 'AddEbook' ),
                    ])
                }).then( function([ $iframe, $addEbook ]) {

                    let separador = nombrePdf.split( '/' )
                    let detalles  = {}

                    if ( separador.length > 2 ) {
                        detalles.categoria  = separador[ 1 ]
                        detalles.nombre     = separador[ 2 ]
                    }
                    else detalles.nombre = separador[ 1 ]

                    if ( data ) {
                        detalles.data = data
                        $iframe.src   = `/web/viewer.html?file=${ nombrePdf }#page=${ data.actual }&zoom=page-width`

                        $addEbook.classList.add('invisible')
                    }
                    else {
                        $iframe.src = `/web/viewer.html?file=${ nombrePdf }#zoom=page-width`

                        $addEbook.classList.remove('invisible')
                    }

                    sessionStorage.setItem( 'readingBook', JSON.stringify( detalles ))
                })
        },

        /**
         * Leemos los datos del ebook de sessionStorage y enviamos una peticion para actualizar la
         * pagina en la que vamos en caso de que estemos leyendo el ebook
         * @param {string} paginaActual Lo obtenemos del ifram
         */
        actualizaLecturaCon( paginaActual ) {
            const data = sessionStorage.getItem( 'readingBook' )

            if ( !data ) return

            let infoLibro = JSON.parse( data )

            if ( !infoLibro.data )         return
            if ( !infoLibro.data.leyendo ) return

            fetch( 'book.fetch', {
                method: 'POST',
                body  : JSON.stringify({ actual: paginaActual, libro: infoLibro.nombre }),
            })

            infoLibro.data.actual = paginaActual

            sessionStorage.setItem( 'readingBook', JSON.stringify( infoLibro ))
        },

        /**
         * Adicionamos una nueva netrada en el archivo .JSON si no existe el libro, si ya existe, solo actualizamos
         * la pagina que esta leyendo el usuario y la bandera que esta leyendo como tal
         * @param {string} paginaActual = 0 La pagina actual, default a 0
         * @param {string} totalPaginas = 0 El numero total de paginas que tiene el libro
         */
        agregaEbook( paginaActual = 0, totalPaginas = 0 ) {
            const libro = this.infoLibro

            if ( !libro ) return null

            let detalles = {
                nombre      : libro.nombre,
                paginas     : totalPaginas.replace('of ', ''),
                actual      : paginaActual,
                calificacion: 0,
                notas       : '',
                categoria   : libro.categoria || '',
                leyendo     : true,
            }

            fetch( 'nuevoebook.fetch', {
                method: 'POST',
                body  : JSON.stringify( Object.assign( {}, detalles ))
            })

            delete detalles.nombre

            this.infoLibro = {
                nombre   : libro.nombre,
                categoria: detalles.categoria,
                data     : detalles,
            }
        },

        /**
         * Cuando queremos dejar de seguir el libro que estabams leyendo, cambiamos el estado del libro,
         * enviamos la solicitud al servidor y eliminamos el link de la lista de libros 'Leyendo'
         * @returns {Promise<null>}
         */
        terminaLibro() {

            Nando.Cargador.trae( 'Elementos' ).then( function( Elementos ) {
                const libro = this.infoLibro

                if ( !libro )      return null
                if ( !libro.data ) return null

                libro.data.leyendo  = false
                libro.data.actual   = '1'
                this.infoLibro      = libro

                if ( libro.data.categoria == '' ) {
                    this.escogeCategoria()
                }

                fetch( 'terminaebook.fetch', {
                    method: 'POST',
                    body  : JSON.stringify({ nombre: libro.nombre })
                })

                return Promise.all([
                    Elementos.damePorId( 'AddEbook' ),
                    Elementos.damePorId( 'EndEbook' ),
                    Elementos.dame( 'section' ),
                ])
            }.bind( this )).then( function([ $addEbook, $endEbook, $section ]) {
                $addEbook.classList.remove( 'invisible' )
                $endEbook.classList.add( 'invisible' )

                const links         = $section.querySelector( 'ul' ).querySelectorAll( 'a' )
                const libro         = this.infoLibro
                const $libroBorrado = [ ...links ].filter( link => link.textContent == libro.nombre )[ 0 ]
                const $li           = $libroBorrado.parentNode

                $li.removeChild( $libroBorrado )
            }.bind( this ))
            .catch( error => console.error( error ))
        },

        /**
         * Trae la informacion del sessionStorage y retorna la informacion encontrada o null si no existe
         * @get
         * @return {object}
         */
        get infoLibro() {
            const libroString = sessionStorage.getItem( 'readingBook' )

            if ( !libroString ) return null

            return JSON.parse( libroString )
        },

        /**
         * Guarda la informacion suministarda en el sessionStorage
         * @param {object} Los detalles del libro o null
         */
        set infoLibro( libro ) {

            if ( libro ) sessionStorage.setItem( 'readingBook', JSON.stringify( libro ))
            else         sessionStorage.setItem( 'readingBook', null )
        },

        /**
         * Muestra el input para asignar una categoria al libro
         * @returns {promise<null>}
         */
        escogeCategoria() {

            return Nando.Cargador.trae( 'Elementos' ).then( function( Elementos ) {
                return Elementos.damePorId( 'CategoriaEbook' )
            }).then( function( $categoria ) {
                $categoria.classList.remove( 'invisible' )
            })
        },
    }
})()
