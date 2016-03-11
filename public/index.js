window.addEventListener( 'DOMContentLoaded', function() {

    let $section     = document.getElementsByTagName( 'section' )[ 0 ]
    let $iframe      = document.getElementById( 'iframe' )
    let $closeButton = document.getElementById( 'CloseEbook' )

    fetch( 'lista.fetch' )
        .then( lista => lista.json() )
        .then( function( libros )
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

            $section.appendChild( fragmento )
        })
        .catch( err => console.log( err ))

    $section.addEventListener( 'click', function( e )
    {
        e.preventDefault()

        fetch( `book.fetch?info=${ e.target.pathname }` )
            .then( data => data.json() )
            .then( function( data )
            {
                if ( data )
                {
                    $iframe.src = `/web/viewer.html?file=${ e.target.href }#page=${ data.actual }`

                    sessionStorage.setItem('readingBook', JSON.stringify({
                        nombre: e.target.textContent,
                        data  : data,
                    }))
                }
                else
                {
                    $iframe.src = `/web/viewer.html?file=${ e.target.href }`
                }
            })

        $closeButton.classList.remove( 'invisible' )
        $section.classList.add( 'invisible' )
    })

    $closeButton.addEventListener( 'click', function()
    {
        $iframe.src = ''

        $closeButton.classList.add( 'invisible' )
        $section.classList.remove( 'invisible' )

        const infoLibro = JSON.parse( sessionStorage.getItem( 'readingBook' ))

        if ( !infoLibro ) return

        const numeroPagina = $iframe.contentWindow.window.document.getElementById( 'pageNumber' ).value

        fetch( 'book.fetch', {
            method: 'POST',
            body: JSON.stringify({ actual: numeroPagina, libro: infoLibro.name }),
        })
    })
})
