var Nando = {

    Cargador: {
        $HEAD  : document.querySelector( 'head' ),
        SCRIPTS: 'scripts/',

        trae( modulo ) {

            return new Promise( function( res ) {

                if ( Nando[ modulo ]) {
                    res( Nando[ modulo ])
                    return
                }
                let script  = document.createElement( 'script' )
                script.type = 'text/javascript'
                script.src  = Nando.Cargador.SCRIPTS + modulo.toLowerCase() + '/' + modulo + '.js';

                Nando.Cargador.$HEAD.appendChild( script );

                script.addEventListener( 'load', alCargar.bind( this ));

                function alCargar() {
                    script.removeEventListener( 'load', alCargar );
                    Nando.Cargador.$HEAD.removeChild( script );

                    script = null;
                    res( Nando[ modulo ]);
                }
            })
        }
    }
}

window.addEventListener( 'DOMContentLoaded', function() {

    sessionStorage.setItem( 'readingBook', null )

    // Traemso la lista de ebooks y la mostramos
    Promise.all([
        Nando.Cargador.trae( 'Elementos' ),
        Nando.Cargador.trae( 'Vista' ),
    ]).then( function([ Elementos, Vista ]) {

        fetch( 'lista.fetch' )
            .then( lista => lista.json() )
            .then( libros => Vista.tomaCategoriasDe( libros ))
            .then( libros => Vista.muestra( libros ))
            .then( function( fragmento ) {

                return Elementos.dame( 'section' )
                    .then( $section => $section.appendChild( fragmento ))
            })
            .catch( err => console.log( err ))

        // Cuando hacemos click en un link para un libro, traemos los datos acerca del libro en
        // caso de que lo estemos leyendo y queramos hacerle seguimiento. Lo pasamos a [Vista] para
        // que a su vez lo pasa al visor de pdfs
        Promise.all([
            Elementos.dame( 'section' ),
            Elementos.dame( 'aside' ),
        ]).then( function([ $section, $aside ]) {

            $section.addEventListener( 'click', function( e ) {

                if ( e.target.pathname ) {
                    e.preventDefault()

                    fetch( `book.fetch?info=${ e.target.pathname }` )
                        .then( data => data.json() )
                        .then( data => Vista.cargaViewerCon( data, e.target.pathname ))

                    $aside.classList.remove( 'invisible' )
                    $section.classList.add( 'invisible' )
                }
            })
        })

        // Cuando hacemos click en el boton de cerrar, actualizamos nuestro progdeso si estamos
        // leyendo este libro. Luego ocultamos el boton de cerrar y mostramos la lista de ebooks
        Promise.all([
            Elementos.dame( 'section' ),
            Elementos.damePorId( 'iframe' ),
            Elementos.dame( 'aside' ),
        ]).then( function([ $section, $iframe, $aside ]) {

            $aside.addEventListener( 'click', function( e ) {

                if ( e.target.id ) {
                    let paginaActual = null

                    switch ( e.target.id ) {

                        case 'CloseEbook':
                            $aside.classList.add( 'invisible' )
                            $section.classList.remove( 'invisible' )

                            paginaActual = $iframe.contentWindow.window.document.getElementById( 'pageNumber' ).value
                            $iframe.src  = ''

							Vista.actualizaLecturaCon( paginaActual )
                            break

                        case 'AddEbook':
                            const totalPaginas  = $iframe.contentWindow.window.document.getElementById( 'numPages' ).textContent
                            paginaActual        = $iframe.contentWindow.window.document.getElementById( 'pageNumber' ).value

                            Vista.agregaEbook( paginaActual, totalPaginas )

                            e.target.classList.add( 'invisible' )
							Nando.Elementos.damePorId( 'AddEbook' ).then( $addEbook => $addEbook.classList.remove( 'invisible' ))
                            break

                        case 'EndEbook':
                            Vista.terminaLibro()
                            break

                        case 'CategorizeEbook':
                            Vista.muestraInputCategoria()
                            break;
                    }
                }
            })
        })

        // Al escoger una categoria
        Promise.all([
            Elementos.damePorId( 'CategoriaEbook' ),
            Elementos.damePorId( 'CategorizeEbook' ),
        ]).then( function([ $input, $categoriaBtn ]) {

            $input.addEventListener( 'change', function( e ) {

				if ( e.target.value.trim() === '' ) return

                e.target.classList.add( 'invisible' )
                $categoriaBtn.classList.remove( 'invisible' )

				let antiguaCategoria = Vista.infoLibro.categoria

				Vista.categorizaLibro( e.target.value.trim() ).then( function([ infolibro, $section ]) {
					let $uls = $section.querySelectorAll( 'ul' )

					if ( !antiguaCategoria ) antiguaCategoria = 'Sin leer'

					// Tomamos la lista de ULs y en cada una buscamos el primer elemento que es un <strong> que contiene el nombre de la categoria
					// Una vez tenemos la lista de la categoria antigua y la lista con la nueva categoria, buscamos el <li> que contiene el link
					// con el nombre del libro a cambiar y simplemente lo cambiamos al final
					// La categoria 'Leyendo' es especial porque se tiene como referencia para el usuario solamente
					let [ $antiguoUl ] = [ ...$uls ].filter( $ul => (( $ul.firstChild.textContent != 'Leyendo' ) && ( $ul.firstChild.textContent == antiguaCategoria )))
					let [ $nuevoUl ]   = [ ...$uls ].filter( $ul => (( $ul.firstChild.textContent != 'Leyendo' ) && ( $ul.firstChild.textContent == infolibro.categoria )))

					let [ $li ] = [ ...$antiguoUl.querySelectorAll( 'li' )].filter( $li => $li.firstChild.textContent == infolibro.nombre )

					if ( !$nuevoUl ) {
						$nuevoUl = document.createElement( 'ul' )
						let $strong = document.createElement( 'strong' )
						$strong.textContent = infolibro.categoria

						$nuevoUl.appendChild( $strong )
						$section.appendChild( $nuevoUl )

						let $aLi = $li.querySelector( 'a' )
						$aLi.href = `${ infolibro.categoria}/${ infolibro.nombre }`
					}

					if ( infolibro.categoria == 'Sin leer' ) {

						let $aLi = $li.querySelector( 'a' )
						$aLi.href = infolibro.nombre
					}

					$nuevoUl.appendChild( $li )
				})

                e.target.value = ''
            })
        })
    })
})
