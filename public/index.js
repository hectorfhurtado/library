var Nando =
{
    Cargador:
    {
        $HEAD: document.querySelector( 'head' ),
        SCRIPTS: 'scripts/',

        trae( modulo )
        {
            return new Promise( function( res )
            {
                if ( Nando[ modulo ])
                {
                    res( Nando[ modulo ])
                    return
                }
                let script  = document.createElement( 'script' )
                script.type = 'text/javascript'
                script.src  = Nando.Cargador.SCRIPTS + modulo.toLowerCase() + '/' + modulo + '.js';

                Nando.Cargador.$HEAD.appendChild( script );

                script.addEventListener( 'load', alCargar.bind( this ));

                function alCargar()
                {
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

    // Traemso la lista de ebooks y la mostramos
    Promise.all([
        Nando.Cargador.trae( 'Elementos' ),
        Nando.Cargador.trae( 'Vista' ),
    ]).then( function( modulos )
    {
        const Elementos = modulos[ 0 ]
        const Vista     = modulos[ 1 ]

        fetch( 'lista.fetch' )
            .then( lista => lista.json() )
            .then( libros => Vista.muestra( libros ))
            .then( function( fragmento )
            {
                return Elementos.dame( 'section' )
                    .then( $section => $section.appendChild( fragmento ))
            })
            .catch( err => console.log( err ))

        // Cuando hacemos click en un link para un libro, traemos los datos acerca del libro en
        // caso de que lo estemos leyendo y queramos hacerle seguimiento. Lo pasamos a [Vista] para
        // que a su vez lo pasa al visor de pdfs
        Promise.all([
            Elementos.dame( 'section' ),
            Elementos.damePorId( 'CloseEbook' ),
        ]).then( function( elementos )
        {
            const $section      = elementos[ 0 ]
            const $closeButton  = elementos[ 1 ]

            $section.addEventListener( 'click', function( e )
            {
                e.preventDefault()

                fetch( `book.fetch?info=${ e.target.pathname }` )
                    .then( data => data.json() )
                    .then( data => Vista.cargaViewerCon( data, e.target.textContent ))

                $closeButton.classList.remove( 'invisible' )
                $section.classList.add( 'invisible' )
            })
        })

        // Cuando hacemos click en el boton de cerrar, actualizamos nuestro progdeso si estamos
        // leyendo este libro. Luego ocultamos el boton de cerrar y mostramos la lista de ebooks
        Promise.all([
            Elementos.dame( 'section' ),
            Elementos.damePorId( 'iframe' ),
            Elementos.damePorId( 'CloseEbook' ),
        ]).then( function( elementos )
        {
            const $section      = elementos[ 0 ]
            const $iframe       = elementos[ 1 ]
            const $closeButton  = elementos[ 2 ]

            $closeButton.addEventListener( 'click', function()
            {
                $iframe.src = ''

                $closeButton.classList.add( 'invisible' )
                $section.classList.remove( 'invisible' )

                const paginaActual = $iframe.contentWindow.window.document.getElementById( 'pageNumber' ).value

                Vista.actualizaLecturaCon( paginaActual )
            })
        })
    })
})
