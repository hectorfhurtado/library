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
					Promise.all( this._armaPromesasElementos() ).then( this._estadoParaInicio.bind( this ))
					break

				case this.LIBRO:
					Promise.all( this._armaPromesasElementos() ).then( this._estadoParaLibro.bind( this ))
					break

				case this.LEYENDO:
					Promise.all( this._armaPromesasElementos() ).then( this._estadoParaLeyendo.bind( this ))
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
		 * El estado inicio solo necesita que no se vea el menu y que se vea el listado de libros
		 * @private
		 * @author Nando
		 * @param {object} $section
		 * @param {object} $aside
		 */
		_estadoParaInicio([ $section, $aside ]) {

			// No visibles
			this._oculta([
				$aside,
			])

			// visibles
			this._muestra([
				$section
			])
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
			this._oculta([
				$section,
				$end,
				$categoria,
			])

			// Visibles
			this._muestra([
				$aside,
				$close,
				$add,
				$categorize,
			])
		},

		_estadoParaLeyendo([ $section, $aside, $close, $add, $end, $categorize, $categoria ]) {

			// No visibles
			this._oculta([
				$section,
				$add,
				$categoria,
			])

			// Visibles
			this._muestra([
				$aside,
				$close,
				$end,
				$categorize,
			])
		},

		_muestra( $elementos ) {
			$elementos.forEach( $elemento => $elemento.classList.remove( 'invisible' ))
		},

		_oculta( $elementos ) {
			$elementos.forEach( $elemento => $elemento.classList.add( 'invisible' ))
		},
	}

	Nando.Cargador.trae( 'Elementos', 'elementos/index' )
})()
