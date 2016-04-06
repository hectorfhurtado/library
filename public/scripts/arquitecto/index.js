/* global Nando */

(function() {

	Nando.Arquitecto = {

		inicia() {

			this.iniciaModulos()
			this.pideLista()
		},

		pideLista() {
			// TODO: Continuar desde aqui llamando a Red
		},

		iniciaModulos() {
			Nando.Cargador.trae( 'Libro', 'libro/index' ).then( Libro => Libro.inicia() )
		}
	}
})()
