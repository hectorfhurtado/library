var Nando = {

	Cargador: {

		// TODO: Mover esta lista a un archivo en el servidor y consultarla con un fetch
		paths: {
			'Arquitecto': 'arquitecto/index',
			'Elementos' : 'elementos/index',
			'DOM'       : 'elementos/DOM',
			'Estados'   : 'elementos/estados',
			'Libro'     : 'libro/index',
			'Red'       : 'red/index',
		},

		$HEAD  : document.querySelector( 'head' ),
		SCRIPTS: 'scripts/',

		trae( modulo, path ) {

			return new Promise( function( res ) {

				if ( Nando[ modulo ]) {
					res( Nando[ modulo ])
					return
				}

				if ( Nando[ path ]) {
					Nando[ modulo ] = Nando[ path ]
					res( Nando[ modulo ])
					return
				}

				let realPath = path ?
					Nando.Cargador.SCRIPTS + path + '.js' :
					Nando.Cargador.SCRIPTS + this.paths[ modulo ] + '.js'

				let script  = document.createElement( 'script' )
				script.type = 'text/javascript'
				script.src  = realPath

				Nando.Cargador.$HEAD.appendChild( script )

				script.addEventListener( 'load', alCargar.bind( this ))

				function alCargar() {
					script.removeEventListener( 'load', alCargar )
					Nando.Cargador.$HEAD.removeChild( script )

					script = null

					if ( path ) Nando[ path ] = Nando[ modulo ]

					res( Nando[ modulo ])
				}
			}.bind( this ))
		}
	}
}

window.addEventListener( 'DOMContentLoaded', function() {

	Nando.Cargador
		.trae( 'Arquitecto' )
		.then( A => A.inicia() )
		.catch( error => console.log( error ))
})
