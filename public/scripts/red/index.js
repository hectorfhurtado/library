/* global Nando */

( function() {

	const TERMINACION = '.fetch'

	Nando.Red = {

		/**
		 * Trae informacion del servidor
		 * @param   {string}          path El path donde esta la informacion
		 * @returns {promise<object>} La informacion si la hay
		 */
		traeJson( path ) {

			return fetch( path + TERMINACION )
				.then( informacion => informacion.json() )
				.catch( error => console.error( error ))
		},
	}
})()
