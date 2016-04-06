/* global Nando */

(function() {

	Nando.Libro = {

		inicia() {
			this.detalleLibro = null
		},

		get detalleLibro() {
			// TODO: lo de sessionStorage
		},

		set detalleLibro( info ) {
			sessionStorage.setItem( JSON.stringity( info ))
		},
	}
})()
