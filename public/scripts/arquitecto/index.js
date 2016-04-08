/* global Nando */

(function() {

	Nando.Arquitecto = {

		inicia() {

			this.iniciaLibro()
				.then( this.pideLista )
				.then( this.pasa )
				.then( categorias => console.log( categorias ))

			// TODO: Continuar con lo que corresponde a Vista#tomaCategoriasDe
		},

		pideLista() {

			return Nando.Cargador
				.trae( 'Red', 'red/index' )
				.then( R => R.traeJson( 'lista' ))
				.catch( error => console.error( error ))
		},

		pasa( lista ) {

			return Nando.Libro.extraeCategoriasDe( lista )
		},

		iniciaLibro() {

			return Nando.Cargador
				.trae( 'Libro', 'libro/index' )
				.then( L => L.inicia())
		},
	}
})()
