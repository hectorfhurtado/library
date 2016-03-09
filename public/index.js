window.addEventListener( 'DOMContentLoaded', function() {

    let $section = document.getElementsByTagName( 'section' )[ 0 ]
    let $iframe = document.getElementById( 'iframe' )

    fetch( 'lista.fetch' )
        .then( lista => lista.json() )
        .then( function( libros )
        {
            const categorias = Object.keys( libros )

            let fragmento = document.createDocumentFragment()

            categorias.forEach( function( categoria )
            {
                const $ul = document.createElement( 'ul' )
                const $strong = document.createElement( 'strong' )
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

        $iframe.src = `/web/viewer.html?file=${ e.target.href }`
    })

})
