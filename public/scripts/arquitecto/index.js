/* global Nando, unescape */

(function() 
{
	async function inicia() 
	{
		animarSeccionPrincipal();
		await iniciaLibro();
		let lista = await pideLista();
		let categorias = pideCategorias( lista );

		await adicionaCategoriasADatalistDeCategorias( categorias );

		let ebooks = pideEbooks();
		
		await adicionaCategoriasADatalistDeEbooks( ebooks );
		await muestraLibros();

		inicializaEventHandlers();
	}
	
	function animarSeccionPrincipal() {
		document.querySelector( 'section' ).classList.add( 'grow-animation' );
	}

	/**
	 * Pide al modulo Red la lista de libros en la biblioteca del usuario
	 * @author Nando
	 * @returns {Promise<object>} El objeto con la informacion del servidor
	 */
	async function pideLista() 
	{
		let Red = await Nando.Cargador.trae( 'Red' );
		return Red.traeJson( 'lista' );
	}

	/**
	 * Pide las categorias a las que pertenecen los libros recibidos
	 * @author Nando
	 * @param   {Array} lista La lista la enviamos al modulo Libro para que la guarde
	 * @returns {Array} Contiene solo los nombres de las categorias
	 */
	function pideCategorias( lista ) 
	{
		return Nando.Libro.guarda( lista ).categorias;
	}

	async function iniciaLibro() 
	{
		let Libro =  await Nando.Cargador.trae( 'Libro' );
		Libro.inicia();
	}
	
	/**
	 * La informacion para el datalist que usa el usuario al momento de dar una categoria a un libro
	 * se alimenta de la lista de categorias suministrada. Quitamos 'Leyendo' y 'Sin leer' porque no
	 * son categorias como tal sino ayudantes para los libros sin categoria
	 * @author Nando
	 * @param   {Array}              categorias La lista de categorias
	 * @returns {Promise<undefined>} No devolvemos nada en la promesa
	 */
	async function adicionaCategoriasADatalistDeCategorias( categorias ) 
	{
		const filtro              = /Leyendo|Sin leer/;
		const categoriasFiltradas = categorias.filter( categoria => filtro.test( categoria ) === false );
		const Elementos           = await Nando.Cargador.trae( 'Elementos' );
		
		Elementos.creaOptionsPara( Elementos.damePorId( 'CategoriaEbookList' ), categoriasFiltradas );
	}
	
	/**
	 * Pedimos al modulo Elementos que cree la lista con los libros para que el usuario comience a leer
	 * alguno
	 * @author Nando
	 * @returns {promise}
	 */
	function muestraLibros() 
	{
		let categorias = Nando.Libro.categoriasConLibros;

		return Nando.Elementos.creaListaLibros( categorias, Nando.Elementos.dame( '.listas' ));
	}
	
	/**
	 * Inicializa los event handlers para los elementos que contienen links y/o botones
	 * @author Nando
	 * @returns {Promise} [[Description]]
	 */
	async function inicializaEventHandlers() 
	{
		const  Elementos = await Nando.Cargador.trae( 'Elementos' );

		const [ $section, $aside, $inputCategoria, $inputBuscar, $rankList, $notes ] = await Promise.all(
		[
			Elementos.dame( '.listas' ),
			Elementos.dame( 'aside' ),
			Elementos.damePorId( 'CategoriaEbook' ),
			Elementos.damePorId( 'BuscarEbook' ),
			Elementos.damePorId( 'RankList' ),
			Elementos.damePorId( 'Notes' ),
		]);

		$section.addEventListener( 'click', _clickEnSectionLibros, false );
		$aside.addEventListener( 'click', _clickEnMenu, false );
		$inputCategoria.addEventListener( 'change', _changeInputCategoria, false );
		$inputBuscar.addEventListener( 'change', _changeBuscarEbook, false );
		$rankList.addEventListener( 'click', _clickEnRankList, false );
		$notes.addEventListener( 'change', _changeEnNotas, false );

		// window.addEventListener( 'resize', ajustaPosicionElementos, false);
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
	async function _clickEnSectionLibros( e ) 
	{
		e.preventDefault();
		
		let dataset = e.target.dataset;
		
		if ( 'id' in dataset ) 
		{
			if ( dataset.id == 'azar' ) 
			{
				let ebook = Nando.Libro.traeLibroAlAzarDe( 'Sin leer' );
				
				return _changeBuscarEbook.bind({ value: ebook })();
			}
			
			return;
		}

		if ( !e.target.pathname ) return;

		let Red          = await Nando.Cargador.trae( 'Red' );
		let infoLibro    = await Red.traeJson( 'book', `info=${ e.target.pathname }` );
		let detalleLibro = Nando.Libro.extraeDetallesDe( infoLibro, unescape( e.target.pathname ));

		await Nando.Elementos.muestraLibro( detalleLibro, Nando.Elementos.damePorId( 'iframe' ));

		let Estados = await Nando.Cargador.trae( 'Estados' );
		let detalle = Nando.Libro.detalleLibro;

		if ( detalle.leyendo ) Estados.cambiaA( Estados.LEYENDO );
		else Estados.cambiaA( Estados.LIBRO );		

		let $rankEbook = await Nando.Elementos.damePorId( 'RankEbook' );
		Nando.Elementos.califica( detalle.calificacion || 0, $rankEbook );

		const $listas = await Nando.Elementos.dame( '.listas' );
		Nando.Elementos.comenta( detalle.notas, $listas, detalle.nombre );
	}
	
	function _clickEnMenu( e ) 
	{
		if ( !e.target.id && !e.target.getAttribute('data-id') ) return;

		let ID = e.target.id || e.target.getAttribute('data-id');

		switch( ID ) 
		{
			case 'CloseEbook':
				_cierraLibro();
				break;

			case 'AddEbook':
				_adicionaLibro();
				break;

			case 'EndEbook':
				_terminaLibro();
				break;

			case 'CategorizeEbook':
				_muestraInputCategoria();
				break;
				
			case 'RankEbook':
				_muestraBarraCalificacion();
				break;

			case 'AddNote':
				_muestraAreaParaNotas();
				break;
		}
	}
	
	/**
	 * Tiene la logica para cerrar el libro y guardar en donde vamos si estamos leyendo
	 * @private
	 * @author Nando
	 * @returns {promise}
	 */
	async function _cierraLibro() 
	{
		let Elementos = await Nando.Cargador.trae( 'Elementos' );
		let paginaActual = await Elementos.limpiaPdfjs( Elementos.damePorId( 'iframe' )); 
		let detalle = Nando.Libro.detalleLibro;

		Nando.Estados.cambiaA( Nando.Estados.INICIO );

		if ( !detalle.leyendo ) return null;

		detalle.actual            = paginaActual;
		Nando.Libro.detalleLibro  = detalle;
		
		await Nando.Red.enviaJson( 'book', 
		{
			actual: detalle.actual,
			libro : detalle.nombre,
		});
	}

	/**
	 * Adiciona un nuevo libro a la categoria 'Leyendo' y hace el cambio en el UI y en el servidor
	 * @private
	 * @author Nando
	 */
	async function _adicionaLibro() 
	{
		let Elementos   = await Nando.Cargador.trae( 'Elementos' );
		let infoPaginas = await Elementos.infoPaginasPdf( Elementos.damePorId( 'iframe' ));
		let informacion = Nando.Libro.adiciona( infoPaginas );

		await Nando.Red.enviaJson( 'nuevoebook', informacion );

		Nando.Estados.cambiaA( Nando.Estados.LEYENDO );

		return Nando.Elementos.adicionaALa( 'Leyendo', Nando.Libro.detalleLibro, Nando.Elementos.dame( '.listas' ));
	}

	/**
	 * Marca el libro como terminado, envia el cambio al servidor y elimina el link de la categoria 'Leyendo'
	 * @private
	 * @author Nando
	 */
	async function _terminaLibro() 
	{
		let libro = Nando.Libro.termina();

		await Nando.Red.enviaJson( 'terminaebook', libro );
		await Nando.Elementos.eliminaDeLa( 'Leyendo', Nando.Libro.detalleLibro, Nando.Elementos.dame( '.listas' ));

		if ( !Nando.Libro.detalleLibro.categoria ) 
			Nando.Estados.cambiaA( Nando.Estados.CATEGORIZA );
		else
			Nando.Estados.cambiaA( Nando.Estados.LIBRO );
	}
	
	/**
	 * Muestra el input para escribir la categoria a la que debe pertenecer el libro
	 * @private
	 * @author Nando
	 */
	async function _muestraInputCategoria() 
	{
		let Estados = await Nando.Cargador.trae( 'Estados' );

		Estados.cambiaA( Estados.CATEGORIZA );
	}
	
	/**
	 * Cambia o asigna una categoria a un ebook
	 * @param	{Event}	e
	 */
	async function _changeInputCategoria( e ) 
	{
		let categoriaNueva = e.target.value.trim();
		
		if ( categoriaNueva === '' ) return;

		let detalles         = Nando.Libro.detalleLibro;
		let categoriaAntigua = detalles.categoria;
		let detalleLibro     = Nando.Libro.actualiza( categoriaNueva );

		const cambio = 
		{
			nombre : detalleLibro.nombre,
			antigua: categoriaAntigua,
			nueva  : detalleLibro.categoria,
		};

		await Nando.Red.enviaJson( 'categoriza', cambio );
		await Nando.Elementos.cambiaCategoria( categoriaAntigua, detalleLibro, Nando.Elementos.dame( '.listas' ));

		Nando.Estados.cambiaA( Nando.Estados.anterior );
	}
	
	/**
	 * retorna la lista de ebooks
	 * @returns	{promise<Array>}
	 */
	function pideEbooks() 
	{
		return Nando.Libro.ebooks;
	}
	
	/**
	 * Al datalist de busqueda le agregamos la lista de los ebooks que tienemos
	 * @returns	{promise}
	 */
	async function adicionaCategoriasADatalistDeEbooks( ebooks ) 
	{
		return Nando.Elementos.creaOptionsPara( Nando.Elementos.damePorId( 'BuscarEbookList' ), ebooks );
	}
	
	/**
	 * Tomamos el nombre del libro del datalist y lo buscamos en la lista de links haciendo
	 * scroll para que el usuario pueda ver este link y hacer click si quiere.
	 * El link encontrado lo marcamos de un color amarillo
	 */
	async function _changeBuscarEbook() 
	{
		const ebook         = this.value.trim();
		const Elementos     = await Nando.Cargador.trae( 'Elementos' );
		const [ $elemento ] = await Elementos.buscaConTextContent( ebook, 'a', Elementos.dame( '.listas' ));
		
		Elementos.scrollTo( $elemento );
	}
	
	/**
	 * Al hacer click sobre el boton de estrella (para calificar), cambiamos el estado a CALIFICA
	 */
	async function _muestraBarraCalificacion() 
	{
		let Estados = await Nando.Cargador.trae( 'Estados' );
		
		Estados.cambiaA( Estados.CALIFICA );
	}
	
	/**
	 * Al hacer click en un boton con calificacion, las asigna en el objeto con la informacion del libro y
	 * actualiza el UI.
	 * @param	{Event}	e
	 */
	async function _clickEnRankList(e) 
	{
		const Elementos      = await Nando.Cargador.trae( 'Elementos' );
		let [ calificacion ] = /\d/.exec( e.target.textContent );

		if ( !calificacion ) return;

		const Libro = await Nando.Cargador.trae( 'Libro' );
		Libro.calificaCon( calificacion );

		const Red      = await Nando.Cargador.trae( 'Red' );
		let { nombre } = Libro.detalleLibro;
		Red.enviaJson( 'califica', { calificacion, libro: nombre });

		let $botonCalificacion = await Elementos.damePorId( 'RankEbook' );
		Elementos.califica( calificacion, $botonCalificacion, nombre );

		const Estados = await Nando.Cargador.trae( 'Estados' );
		Estados.cambiaA( Estados.anterior );
	}

	/**
	 * Ubica a los elementos que necesitan ajuste en su CSS
	 */
	async function ajustaPosicionElementos() 
	{
		const Elementos   = await Nando.Cargador.trae( 'Elementos' );
		const $section    = await Elementos.dame( 'section' );
		const propiedades = [ 'width', 'height' ];

		Elementos.posicionAlCien( propiedades, $section );
	}

	async function _muestraAreaParaNotas() {
		const Estados = await Nando.Cargador.trae( 'Estados' );
		Estados.cambiaA( Estados.COMENTA );
	}

	/**
	 * Se encarga de tomar el comentario escrito por el usuario y coordinar para que sea actualizado el 
	 * estado en la app, enviado al servidor, actualizado en las listas de ebooks y actualiza el Estado 
	 * general de la app
	 */
	async function _changeEnNotas()
	{
		const comentario = this.value.trim();
		const Libro      = await Nando.Cargador.trae( 'Libro' );
		Libro.agregaComentario( comentario );

		// TODO: Guardar la nota aun cuando no se este leyendo el libro
		const Red             = await Nando.Cargador.trae( 'Red' );
		let { nombre: libro } = Libro.detalleLibro;
		Red.enviaJson( 'comenta', { notas: comentario, libro });

		const Elementos         = await Nando.Cargador.trae( 'Elementos' );
		const $contenedorListas = await Elementos.dame( '.listas' );
		Elementos.comenta( comentario, $contenedorListas, libro ); 

		const Estados = await Nando.Cargador.trae( 'Estados' );
		Estados.cambiaA( Estados.anterior ); 
	}
	
	Nando.Arquitecto = 
	{
		inicia,
 	};
})();
