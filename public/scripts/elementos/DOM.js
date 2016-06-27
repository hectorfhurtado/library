/* global Nando */

(function() 
{
	let _pilaFunciones = [];
	
	Nando.DOM = 
	{
		/**
		 * Devuelve si queda algo para hacer
		 */
		get quedanFunciones() 
		{
			return Boolean( _pilaFunciones.length );
		},

		/**
		 * Adiciona un elemento al que se le va a hacer algo a traves de otro elemento.
		 * Por ejemplo, si queremos hacer un ul.appendChild( li ), le pasamos (ul, 'appendChild', li )
		 * La idea es hacer los cambios durante el refresco de la pantalla
		 * @param {object} $aEsteElemento un DOMElement
		 * @param {string} conUnaFuncion  La funcion a realizar
		 * @param {object} $esteElemento  Otro DOMElement
		 */
		adiciona( $aEsteElemento, conUnaFuncion, $esteElemento ) 
		{
			if ( this.quedanFunciones === false ) 
			{
				requestAnimationFrame( _correFuncion );
			}

			_pilaFunciones.push([ $aEsteElemento, conUnaFuncion, $esteElemento ]);
		},
	};
	
	/**
	 * Cuando requestAnimationFrame llama a esta funcion, toma el trabajo para hacer y lo ejecuta
	 * @author Nando
	 * @private
	 */
	function _correFuncion() 
	{
		let [ $elementoA, funcion, $elementoB ] = _pilaFunciones.shift();

		$elementoA[ funcion ]( $elementoB );

		if ( Nando.DOM.quedanFunciones ) 
		{
			requestAnimationFrame( _correFuncion );
		}
	}
})();
