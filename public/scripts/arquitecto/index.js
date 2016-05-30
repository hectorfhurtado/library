/* global Nando, unescape */

(function() {

	function inicia() {

		iniciaLibro()
			.then( pideLista )
			.then( pideCategorias )
			.then( adicionaCategoriasADatalistDeCategorias )
			.then( pideEbooks )
			.then( adicionaCategoriasADatalistDeEbooks )
			.then( muestraLibros )
			.catch( error => console.error( error ))

		inicializaEventHandlers()
	}
	
	/**
	 * Pide al modulo Red la lista de libros en la biblioteca del usuario
	 * @author Nando
	 * @returns {Promise<object>} El objeto con la informacion del servidor
	 */
	function pideLista() {

		return Nando.Cargador
			.trae( 'Red' )
			.then( R => R.traeJson( 'lista' ))
			.catch( error => console.error( error ))
	}

	/**
	 * Pide las categorias a las que pertenecen los libros recibidos
	 * @author Nando
	 * @param   {Array} lista La lista la enviamos al modulo Libro para que la guarde
	 * @returns {Array} Contiene solo los nombres de las categorias
	 */
	function pideCategorias( lista ) {

		return Nando.Libro.guarda( lista ).categorias
	}

	function iniciaLibro() {

		return Nando.Cargador
			.trae( 'Libro' )
			.then( L => L.inicia())
	}
	
	/**
	 * La informacion para el datalist que usa el usuario al momento de dar una categoria a un libro
	 * se alimenta de la lista de categorias suministrada. Quitamos 'Leyendo' y 'Sin leer' porque no
	 * son categorias como tal sino ayudantes para los libros sin categoria
	 * @author Nando
	 * @param   {Array}              categorias La lista de categorias
	 * @returns {Promise<undefined>} No devolvemos nada en la promesa
	 */
	function adicionaCategoriasADatalistDeCategorias( categorias ) {
		const categoriasFiltradas = categorias.filter( categoria => /Leyendo|Sin leer/.test( categoria ) === false )

		return Nando.Cargador
			.trae( 'Elementos' )
			.then( E => E.creaOptionsPara( E.damePorId( 'CategoriaEbookList' ), categoriasFiltradas ))
			.catch( error => console.log( error ))
	}
	
	/**
	 * Pedimos al modulo Elementos que cree la lista con los libros para que el usuario comience a leer
	 * alguno
	 * @author Nando
	 * @returns {promise}
	 */
	function muestraLibros() {

		return Promise.resolve( Nando.Libro.categoriasConLibros )
			.then( categorias => Nando.Elementos.creaListaLibros( categorias, Nando.Elementos.dame( 'section' )))
	}
	
	/**
	 * Inicializa los event handlers para los elementos que contienen links y/o botones
	 * @author Nando
	 * @returns {Promise} [[Description]]
	 */
	function inicializaEventHandlers() {

		return Nando.Cargador.trae( 'Elementos' ).then( function( E ) {

			return Promise.all([
				E.dame( 'section' ),
				E.dame( 'aside' ),
				E.damePorId( 'CategoriaEbook' ),
				E.damePorId( 'BuscarEbook' ),
			])
		}).then( function([ $section, $aside, $inputCategoria, $inputBuscar ]) {

			$section.addEventListener( 'click', _clickEnSectionLibros )
			$aside.addEventListener( 'click', _clickEnMenu )
			$inputCategoria.addEventListener( 'change', _changeInputCategoria )
			$inputBuscar.addEventListener( 'change', _changeBuscarEbook )
		})
	}
	
	/**
	 * Cuando hacemos click en un link de un libro lo traemos, mostramos en el pdfjs y anunciamos
	 * el cambio de estado de todos los elementos del UI
	 * Cuando hacemos click en 'Recomiendame un libro al azar, busca en la lista de libros Sin leer
	 * para que la persona lea uno que no haya contemplado
	 * @private
	 * @author Nando
	 * @param {object} e Event
	 */
	function _clickEnSectionLibros( e ) {
		e.preventDefault()
		
		let dataset = e.target.dataset
		
		if ( 'id' in dataset ) {
			
			if ( dataset.id == 'azar' ) {
				let ebook = Nando.Libro.traeLibroAlAzarDe( 'Sin leer' )
				
				return _changeBuscarEbook.bind({ value: ebook })()
			}
			
			return
		}

		if ( !e.target.pathname ) return

		Nando.Cargador.trae( 'Red' )
			.then( R => R.traeJson( 'book', `info=${ e.target.pathname }` ))
			.then( infoLibro => Nando.Libro.extraeDetallesDe( infoLibro, unescape( e.target.pathname )))
			.then( detalleLibro => Nando.Elementos.muestraLibro( detalleLibro, Nando.Elementos.damePorId( 'iframe' )))
			.then( () => Nando.Cargador.trae( 'Estados' ))
			.then( E => {
				let detalle = Nando.Libro.detalleLibro

				if ( detalle.leyendo ) E.cambiaA( E.LEYENDO )
				else E.cambiaA( E.LIBRO )
			})
	}
	
	function _clickEnMenu( e ) {

		if ( !e.target.id ) return

		switch( e.target.id ) {
			case 'CloseEbook':
				_cierraLibro()
				break

			case 'AddEbook':
				_adicionaLibro()
				break

			case 'EndEbook':
				_terminaLibro()
				break

			case 'CategorizeEbook':
				_muestraInputCategoria()
				break
				
			case 'RankEbook':
				_muestraBarraCalificacion()
				break
		}
	}
	
	/**
	 * Tiene la logica para cerrar el libro y guardar en donde vamos si estamos leyendo
	 * @private
	 * @author Nando
	 * @returns {promise}
	 */
	function _cierraLibro() {

		Nando.Cargador.trae( 'Elementos' )
			.then( E => E.limpiaPdfjs( E.damePorId( 'iframe' )))
			.then( paginaActual => {
				let detalle = Nando.Libro.detalleLibro

				if ( !detalle.leyendo ) return null

				detalle.actual            = paginaActual
				Nando.Libro.detalleLibro  = detalle

				return detalle
			}).then( actualizacion => {

				if ( !actualizacion ) return null

				Nando.Red.enviaJson( 'book', {
					actual: actualizacion.actual,
					libro : actualizacion.nombre,
				})
			}).then( () => Nando.Estados.cambiaA( Nando.Estados.INICIO ))
			.catch( error => console.error( error ))
	}

	/**
	 * Adiciona un nuevo libro a la categoria 'Leyendo' y hace el cambio en el UI y en el servidor
	 * @private
	 * @author Nando
	 */
	function _adicionaLibro() {
		
		Nando.Cargador.trae( 'Elementos' )
			.then( Elementos => Elementos.infoPaginasPdf( Elementos.damePorId( 'iframe' )))
			.then( infoPaginas => Nando.Libro.adiciona( infoPaginas ))
			.then( informacion => Nando.Red.enviaJson( 'nuevoebook', informacion ))
			.then( () => Nando.Estados.cambiaA( Nando.Estados.LEYENDO ))
			.then( () => Nando.Elementos.adicionaALa( 'Leyendo', Nando.Libro.detalleLibro, Nando.Elementos.dame( 'section' )))
			.catch( error => console.error( error ))
	}

	/**
	 * Marca el libro como terminado, envia el cambio al servidor y elimina el link de la categoria 'Leyendo'
	 * @private
	 * @author Nando
	 */
	function _terminaLibro() {

		Nando.Libro.termina()
			.then( libro => Nando.Red.enviaJson( 'terminaebook', libro ))
			.then( () => Nando.Elementos.eliminaDeLa( 'Leyendo', Nando.Libro.detalleLibro, Nando.Elementos.dame( 'section' )))
			.then( () => Nando.Estados.cambiaA( Nando.Estados.LIBRO ))
			.then( () => {

				if ( !Nando.Libro.detalleLibro.categoria ) {
					return Nando.Estados.cambiaA( Nando.Estados.CATEGORIZA )
				}
			})
			.catch( error => console.error( error ))
	}
	
	/**
	 * Muestra el input para escribir la categoria a la que debe pertenecer el libro
	 * @private
	 * @author Nando
	 */
	function _muestraInputCategoria() {
		
		Nando.Cargador.trae( 'Estados' )
			.then( Estados => Estados.cambiaA( Estados.CATEGORIZA ))
			.catch( error => console.error( error ))
	}
	
	/**
	 * Cambia o asigna una categoria a un ebook
	 * @param	{Event}	e
	 */
	function _changeInputCategoria( e ) {
		let categoriaNueva = e.target.value.trim()
		
		if ( categoriaNueva === '' ) return

		let detalles         = Nando.Libro.detalleLibro
		let categoriaAntigua = detalles.categoria
		
		Nando.Libro.actualiza( categoriaNueva )
			.then( detalleLibro => {
				
				if ( !detalleLibro ) return Promise.reject( 'No hay informacion para realizar la categorizacion' )

				const cambio = {
					nombre : detalleLibro.nombre,
					antigua: categoriaAntigua,
					nueva  : detalleLibro.categoria,
				}

				Nando.Red.enviaJson( 'categoriza', cambio )
				
				return detalleLibro
			})
			.then( detalleLibro => Nando.Elementos.cambiaCategoria( categoriaAntigua, detalleLibro, Nando.Elementos.dame( 'section' )))
			.then( () => Nando.Estados.cambiaA( Nando.Estados.anterior ))
			.catch( error => console.log( error ))
	}
	
	/**
	 * retorna la lista de ebooks
	 * @returns	{promise<Array>}
	 */
	function pideEbooks() {
		return Nando.Libro.ebooks
	}
	
	/**
	 * Al datalist de busqueda le agregamos la lista de los ebooks que tienemos
	 * @returns	{promise}
	 */
	function adicionaCategoriasADatalistDeEbooks( ebooks ) {
		return Nando.Elementos.creaOptionsPara( Nando.Elementos.damePorId( 'BuscarEbookList' ), ebooks )
	}
	
	/**
	 * Tomamos el nombre del libro del datalist y lo buscamos en la lista de links haciendo
	 * scroll para que el usuario pueda ver este link y hacer click si quiere.
	 * El link encontrado lo marcamos de un color amarillo
	 */
	function _changeBuscarEbook() {
		const ebook = this.value.trim()
		
		return Nando.Cargador.trae( 'Elementos' )
			.then( Elementos => Elementos.buscaConTextContent( ebook, 'a', Nando.Elementos.dame( 'section' )))
			.then(([ $elemento ]) => Nando.Elementos.scrollTo( $elemento ))
			.catch( error => console.log( error ))
	}
	
	/**
	 * Al hacer click sobre el boton de estrella (para calificar), cambiamos el estado a CALIFICA
	 */
	async function _muestraBarraCalificacion() {
		
		/* jshint lastsemic: true */
		let Estados = await Nando.Cargador.trae( 'Estados' )
		
		Estados.cambiaA( Estados.CALIFICA )
	}
	
	Nando.Arquitecto = {
		inicia,
 	}
})()
