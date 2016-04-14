/* global Nando */

( function() {

	Nando.Estados = {

		INICIO    : Symbol( 'inicio' ),
		LIBRO     : Symbol( 'libro' ),
		LEYENDO   : Symbol( 'leyendo' ),
		CATEGORIZA: Symbol( 'categoriza' ),

		ELEMENTOS: [
			'section',
			'aside',
		],

		ELEMENTOS_POR_ID: [
			'CloseEbook',
			'AddEbook',
			'EndEbook',
			'CategorizeEbook',
			'CategoriaEbook',
		],

		anterior: null,
		actual  : this.INICIO,

		/**
		 * Cambia el estado de los elementos del UI
		 * @author Nando
		 * @param {Symbol} estado
		 */
		cambiaA( estado ) {

			switch( estado ) {
				case this.INICIO:
					break

				case this.LIBRO:

					Promise.all( this._armaPromesasElementos() ).then( this._estadoParaLibro.bind( this ))
					break
			}
		},

		/**
		 * Crea un arreglo de promesas con los elementos de la pantalla que seran modificados
		 * @private
		 * @author Nando
		 * @returns {Array} Un arreglo con todos los elementos a mostrar/ocultar
		 */
		_armaPromesasElementos() {
			let promesas = []

			this.ELEMENTOS.forEach( tagElemento => promesas.push( Nando.Elementos.dame( tagElemento )))
			this.ELEMENTOS_POR_ID.forEach( nombreElemento => promesas.push( Nando.Elementos.damePorId( nombreElemento )))

			return promesas
		},

		/**
		 * Cambia el estado de los elementos suministrados
		 * @private
		 * @author Nando
		 * @param {object} $section
		 * @param {object} $aside
		 * @param {object} $close             boton
		 * @param {object} $add               boton
		 * @param {object} $end               boton
		 * @param {object} $categorize        boton
		 * @param {object} $categoria         Este es un Input
		 */
		_estadoParaLibro([ $section, $aside, $close, $add, $end, $categorize, $categoria ]) {

			// No visibles
			this._oculta( $section )
			this._oculta( $end )
			this._oculta( $categoria )

			// Visibles
			this._muestra( $aside )
			this._muestra( $close )
			this._muestra( $add )
			this._muestra( $categorize )
		},

		_muestra( $elemento ) {
			$elemento.classList.remove( 'invisible' )
		},

		_oculta( $elemento ) {
			$elemento.classList.add( 'invisible' )
		},
	}

	Nando.Cargador.trae( 'Elementos', 'elementos/index' )
})()
