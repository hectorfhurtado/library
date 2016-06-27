/* global Nando */

(function() 
{
	const INICIO     = Symbol( 'inicio' );
	const LIBRO      = Symbol( 'libro' );
	const LEYENDO    = Symbol( 'leyendo' );
	const CATEGORIZA = Symbol( 'categoriza' );
	const CALIFICA   = Symbol( 'califica' );

	const ELEMENTOS = 
	[
		'section',
		'aside',
	];

	const ELEMENTOS_POR_ID = 
	[
		'CloseEbook',
		'AddEbook',
		'EndEbook',
		'CategorizeEbook',
		'CategoriaEbook',
		'RankEbook',
		'RankList',
	];

	Nando.Estados = 
	{
		get INICIO() 
		{
			return INICIO;
		},

		get LIBRO() 
		{
			return LIBRO;
		},
		
		get LEYENDO() 
		{
			return LEYENDO;
		},
		
		get CATEGORIZA() 
		{
			return CATEGORIZA;
		},
		
		get CALIFICA() 
		{
			return CALIFICA;
		},

		anterior: null,
		actual  : INICIO,

		/**
		 * Cambia el estado de los elementos del UI
		 * @author Nando
		 * @param {Symbol} estado
		 */
		cambiaA( estado ) 
		{
			switch ( estado ) 
			{
				case INICIO:
					_actualizaEstadoInterno( estado );
		
					Promise.all( _armaPromesasElementos() ).then( _estadoParaInicio );
					break;

				case LIBRO:
					_actualizaEstadoInterno( estado );
		
					Promise.all( _armaPromesasElementos() ).then( _estadoParaLibro );
					break;

				case LEYENDO:
					_actualizaEstadoInterno( estado );
		
					Promise.all( _armaPromesasElementos() ).then( _estadoParaLeyendo );
					break;

				case CATEGORIZA:
					_actualizaEstadoInterno( estado );
		
					Promise.all( _armaPromesasElementos() ).then( _estadoParaCategoriza );
					break;
					
				case CALIFICA:
					_actualizaEstadoInterno( estado );

					Promise.all( _armaPromesasElementos() ).then( _estadoParaCalifica );				
					break;
					
				default:
					break;
			}
		}
	};
	
	function _actualizaEstadoInterno( estado ) 
	{
		Nando.Estados.anterior = Nando.Estados.actual;
		Nando.Estados.actual   = estado;
	}

	/**
	 * Crea un arreglo de promesas con los elementos de la pantalla que seran modificados
	 * @private
	 * @author Nando
	 * @returns {Array} Un arreglo con todos los elementos a mostrar/ocultar
	 */
	function _armaPromesasElementos() 
	{
		let promesas = [];

		ELEMENTOS.forEach( tagElemento => promesas.push( Nando.Elementos.dame( tagElemento )));
		ELEMENTOS_POR_ID.forEach( nombreElemento => promesas.push( Nando.Elementos.damePorId( nombreElemento )));

		return promesas;
	}

	/**
	 * El estado inicio solo necesita que no se vea el menu y que se vea el listado de libros
	 * @private
	 * @author Nando
	 * @param {object} $section
	 * @param {object} $aside
	 */
	function _estadoParaInicio([ $section, $aside ]) 
	{
		// No visibles
		_mueve($aside);

		// visibles
		_mueve( $section, { atras: true });
	}

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
	function _estadoParaLibro([ $section, $aside, $close, $add, $end, $categorize, $categoria, $rank, $rankList ]) 
	{
		// No visibles
		_oculta(
		[
			$end,
			$categoria,
			$rankList,
		]);

		_mueve( $section );

		// Visibles
		_muestra(
		[
			$close,
			$add,
			$categorize,
			$rank,
		]);

		_mueve( $aside, { atras: true });
	}

	function _estadoParaLeyendo([ $section, $aside, $close, $add, $end, $categorize, $categoria, $rank, $rankList ]) 
	{
		// No visibles
		_oculta(
		[
			$add,
			$categoria,
			$rankList,
		]);

		_mueve( $section );

		// Visibles
		_muestra(
		[
			$close,
			$end,
			$categorize,
			$rank,
		]);

		_mueve( $aside, { atras: true });
	}

	function _estadoParaCategoriza([ , , , , , $categorize, $categoria ]) 
	{
		// No visibles
		_oculta(
		[
			$categorize,
		]);

		// Visibles
		_muestra(
		[
			$categoria,
		]);
		
		$categoria.value = '';
	}
	
	function _estadoParaCalifica([ , , , , , , , $rank, $rankList ]) 
	{
		// No visibles
		_oculta(
		[
			$rank,
		]);

		// Visibles
		_muestra(
		[
			$rankList,
		]);
	}

	function _muestra( $elementos ) 
	{
		$elementos.forEach( $elemento => $elemento.classList.remove( 'invisible' ));
	}

	function _oculta( $elementos ) 
	{
		$elementos.forEach( $elemento => $elemento.classList.add( 'invisible' ));
	}

	function _mueve( $sectionPrincipal, { atras } = {})
	{
		if (atras)
		{
			$sectionPrincipal.classList.add( 'grow-animation' );
			$sectionPrincipal.classList.remove( 'shrink-animation' );
		}
		else
		{
			$sectionPrincipal.classList.remove( 'grow-animation' );
			$sectionPrincipal.classList.add( 'shrink-animation' );
		}
	}

	Nando.Cargador.trae( 'Elementos', 'elementos/index' );
})();
