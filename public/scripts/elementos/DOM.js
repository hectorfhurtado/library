/* global Nando */

( function() {

	Nando.DOM = {

		_pilaFunciones: [],

		/**
		 * Devuelve si queda algo para hacer
		 */
		get quedanFunciones() {
			return !!this._pilaFunciones.length
		},

		/**
		 * Adiciona un elemento al que se le va a hacer algo a traves de otro elemento.
		 * Por ejemplo, si queremos hacer un ul.appendChild( li ), le pasamos (ul, 'appendChild', li )
		 * La idea es hacer los cambios durante el refresco de la pantalla
		 * @param {object} $aEsteElemento un DOMElement
		 * @param {string} conUnaFuncion  La funcion a realizar
		 * @param {object} $esteElemento  Otro DOMElement
		 */
		adiciona( $aEsteElemento, conUnaFuncion, $esteElemento ) {

			if ( this.quedanFunciones === false ) {
				requestAnimationFrame( this.correFuncion.bind( this ))
			}

			this._pilaFunciones.push([ $aEsteElemento, conUnaFuncion, $esteElemento ])
		},

		/**
		 * Cuando requestAnimationFrame llama a esta funcion, toma el trabajo para hacer y lo ejecuta
		 */
		correFuncion() {
			let [ $elementoA, funcion, $elementoB ] = this._pilaFunciones.shift()

			$elementoA[ funcion ]( $elementoB )

			if ( this.quedanFunciones ) {
				requestAnimationFrame( this.correFuncion.bind( this ))
			}
		},
	}
})()
