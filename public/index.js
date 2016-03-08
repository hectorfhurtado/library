window.addEventListener( 'DOMContentLoaded', function() {

    let $ul = document.getElementsByTagName( 'ul' )[ 0 ]
    let $iframe = document.getElementById( 'iframe' )

    fetch( 'lista.fetch' )
        .then( lista => lista.json() )
        .then( function( librosArray )
        {
            let fragmento = document.createDocumentFragment()

            librosArray.forEach( function( libro )
            {
                let $li = document.createElement( 'li' )

                let $a = document.createElement( 'a' )
                $a.href = libro
                $a.textContent = libro

                $li.appendChild( $a)
                fragmento.appendChild( $li )
            })

            $ul.appendChild( fragmento )
        })
        .catch( err => console.log( err ))

    $ul.addEventListener( 'click', function( e )
    {
        e.preventDefault()

        $iframe.src = `/web/viewer.html?file=${ e.target.textContent }`

    })

})
