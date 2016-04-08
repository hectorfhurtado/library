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
			sessionStorage.setItem( 'infoLibro', JSON.stringify( info ))
		},

		/**
		 * Extrae las categorias de la lista de libros que le pasaron
		 * @param   {object}	lista
		 * @returns {array}     La lista de categorias
		 */
		extraeCategoriasDe( lista ) {
			this._lista = lista

			return Object.keys( lista )
		}
	}
})()
