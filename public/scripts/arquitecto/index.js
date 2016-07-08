/* global Nando, unescape */

(function() 
{
	const CALIFICACION_DEFAULT = 0;

	function inicia() 
	{
		animarSeccionPrincipal();

		let gen = (function *()
		{
			yield *iniciaLibro(gen);

			let lista      = yield *pideLista(gen);
			let categorias = pideCategorias( lista );

			yield *adicionaCategoriasADatalistDeCategorias( categorias, gen );

			let ebooks = pideEbooks();
			adicionaCategoriasADatalistDeEbooks( ebooks );

			muestraLibros();
			yield *inicializaEventHandlers(gen);
		})();

		gen.next();
	}
	
	function animarSeccionPrincipal()
	{
		document.querySelector( 'section' ).classList.add( 'grow-animation' );
	}

	/**
	 * Pide al modulo Red la lista de libros en la biblioteca del usuario
	 * @author Nando
	 * @param	{generator}		  generator
	 * @returns {Array} 		  La lista de ebooks proveniente del servidor
	 */
	function *pideLista( generator ) 
	{
		let Red = yield Nando.Cargador.trae( 'Red', null, generator );

		let lista = yield Red.traeJson( 'lista' )
			.then( listaJson => generator.next( listaJson ));

		return lista;
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

	function *iniciaLibro(gen) 
	{
		let Libro = yield Nando.Cargador.trae( 'Libro', null, gen );
		Libro.inicia();
	}
	
	/**
	 * La informacion para el datalist que usa el usuario al momento de dar una categoria a un libro
	 * se alimenta de la lista de categorias suministrada. Quitamos 'Leyendo' y 'Sin leer' porque no
	 * son categorias como tal sino ayudantes para los libros sin categoria
	 * @author Nando
	 * @param   {Array}              categorias La lista de categorias
	 * @param	{generator}		     generator
	 */
	function *adicionaCategoriasADatalistDeCategorias( categorias, generator ) 
	{
		const filtro              = /Leyendo|Sin leer/;
		const categoriasFiltradas = categorias.filter( categoria => filtro.test( categoria ) === false );
		const Elementos           = yield Nando.Cargador.trae( 'Elementos', null, generator );
		
		Elementos.creaOptionsPara( Elementos.damePorId( 'CategoriaEbookList' ), categoriasFiltradas );
	}
	
	/**
	 * Pedimos al modulo Elementos que cree la lista con los libros para que el usuario comience a leer
	 * alguno
	 * @author Nando
	 * @returns {promise}	Retorna una promesa para continuar la cadena si se requiere
	 */
	function muestraLibros() 
	{
		let categorias = Nando.Libro.categoriasConLibros;

		return Nando.Elementos.creaListaLibros( categorias, Nando.Elementos.dame( '.listas' ));
	}
	
	/**
	 * Inicializa los event handlers para los elementos que contienen links y/o botones
	 * @author Nando
	 * @param	{generator}	generator
	 */
	function *inicializaEventHandlers( generator ) 
	{
		const  Elementos = yield Nando.Cargador.trae( 'Elementos', null, generator );

		Promise.all(
			[
				Elementos.dame( '.listas' ),
				Elementos.dame( 'aside' ),
				Elementos.dame( 'nav' ),
				Elementos.damePorId( 'CategoriaEbook' ),
				Elementos.damePorId( 'BuscarEbook' ),
				Elementos.damePorId( 'RankList' ),
				Elementos.damePorId( 'Notes' ),
				Elementos.damePorId( 'ImportEbookInput' ),
			]).then(([ $section, $aside, $nav, $inputCategoria, $inputBuscar, $rankList, $notes, $importador ]) =>
			{
				$section.addEventListener( 'click', _clickEnSectionLibros, false );
				$aside.addEventListener( 'click', _clickEnMenu, false );
				$nav.addEventListener( 'click', _clickEnNav, false );
				$inputCategoria.addEventListener( 'change', _changeInputCategoria, false );
				$inputBuscar.addEventListener( 'change', _changeBuscarEbook, false );
				$rankList.addEventListener( 'click', _clickEnRankList, false );
				$notes.addEventListener( 'change', _changeEnNotas, false );
				$importador.addEventListener( 'change', _subirArchivos, false );
			});
	}
	
	/**
	 * Cuando hacemos click en un link de un libro lo traemos, mostramos en el pdfjs y anunciamos
	 * el cambio de estado de todos los elementos del UI
	 * Cuando hacemos click en 'Recomiendame un libro al azar, busca en la lista de libros Sin leer
	 * para que la persona lea uno que no haya contemplado
	 * @private
	 * @author Nando
	 * @param {object} e Event
	 * @returns	{undefined}	no retorna nada
	 */
	function _clickEnSectionLibros( e ) 
	{
		e.preventDefault();

		let dataset = e.target.dataset;
		
		if ( 'id' in dataset ) 
		{
			if ( dataset.id === 'azar' ) 
			{
				let ebook = Nando.Libro.traeLibroAlAzarDe( 'Sin leer' );
				
				return _changeBuscarEbook.bind({ value: ebook.nombre })();
			}
			
			return null;
		}

		if ( !e.target.pathname ) return null;

		let gen = (function *()
		{
			let Red          = yield Nando.Cargador.trae( 'Red', null, gen );
			let infoLibro    = yield Red.traeJson( 'book', `info=${ e.target.pathname }`, gen );
			let detalleLibro = Nando.Libro.extraeDetallesDe( infoLibro, unescape( e.target.pathname ));

			Nando.Elementos.muestraLibro( detalleLibro, Nando.Elementos.damePorId( 'iframe' ));

			let Estados = yield Nando.Cargador.trae( 'Estados', null, gen );
			let detalle = Nando.Libro.detalleLibro;

			if ( detalle.leyendo ) Estados.cambiaA( Estados.LEYENDO );
			else Estados.cambiaA( Estados.LIBRO );		

			Nando.Elementos.damePorId( 'RankEbook' )
				.then( $rankEbook => Nando.Elementos.califica( detalle.calificacion || CALIFICACION_DEFAULT, $rankEbook ));

			Nando.Elementos.dame( '.listas' )
				.then( $listas => Nando.Elementos.comenta( detalle.notas, $listas, detalle.nombre ));

		})();

		gen.next();

		return null;
	}
	
	function _clickEnMenu( e ) 
	{
		if (!e.target.getAttribute('data-id') && !e.target.id) return;

		let ID = e.target.getAttribute('data-id') || e.target.id;

		switch (ID) 
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

			default:
				break;
		}
	}

	function _clickEnNav( e )
	{
		if ( !e.target.id && !e.target.getAttribute('data-id') ) return;

		let ID = e.target.id || e.target.getAttribute('data-id');

		switch (ID) 
		{
			case 'ImportEbook':
				_abreImporttadorEbooks();
				break;
			
			default:
				break;
		}
	}
	
	/**
	 * Tiene la logica para cerrar el libro y guardar en donde vamos si estamos leyendo
	 * @private
	 * @author Nando
	 * @returns {null}	No retorna nada
	 */
	function _cierraLibro() 
	{
		const numeroRegexp = /\d+/;

		let gen = (function *()
		{
			let Elementos    = yield Nando.Cargador.trae( 'Elementos', null, gen );
			console.assert( typeof Elementos === 'object', 'Elementos debe ser un objeto', Elementos);

			let paginaActual = yield Elementos.limpiaPdfjs( Elementos.damePorId( 'iframe' ), gen );
			let assert       = typeof paginaActual === 'string' && numeroRegexp.test(paginaActual);
			console.assert( assert, 'paginaActual debe ser un numero en String', paginaActual);

			let detalle = Nando.Libro.detalleLibro;

			Nando.Estados.cambiaA( Nando.Estados.INICIO );

			if (detalle.leyendo)
			{
				detalle.actual            = paginaActual;
				Nando.Libro.detalleLibro  = detalle;
			}
			
			return Nando.Red.enviaJson( 'book', detalle);
		})();

		gen.next();

		return null;
	}

	/**
	 * Adiciona un nuevo libro a la categoria 'Leyendo' y hace el cambio en el UI y en el servidor
	 * @private
	 * @author Nando
	 */
	function _adicionaLibro() 
	{
		let gen = (function *()
		{
			let Elementos   = yield Nando.Cargador.trae( 'Elementos', null, gen );
			let infoPaginas = yield Elementos.infoPaginasPdf( Elementos.damePorId( 'iframe' ), gen );
			let informacion = Nando.Libro.adiciona( infoPaginas );

			Nando.Red.enviaJson( 'nuevoebook', informacion );
			Nando.Estados.cambiaA( Nando.Estados.LEYENDO );
			Nando.Elementos.adicionaALa( 'Leyendo', Nando.Libro.detalleLibro, Nando.Elementos.dame( '.listas' ));
		})();

		gen.next();
	}

	/**
	 * Marca el libro como terminado, envia el cambio al servidor y elimina el link de la categoria 'Leyendo'
	 * @private
	 * @author Nando
	 */
	function _terminaLibro() 
	{
		let libro = Nando.Libro.termina();

		Nando.Red.enviaJson( 'terminaebook', libro );
		Nando.Elementos.eliminaDeLa( 'Leyendo', Nando.Libro.detalleLibro, Nando.Elementos.dame( '.listas' ));

		/* eslint no-negated-condition: "off" */
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
	function _muestraInputCategoria() 
	{
		let gen = (function *()
		{
			let Estados = yield Nando.Cargador.trae( 'Estados', null, gen );

			Estados.cambiaA( Estados.CATEGORIZA );
		})();

		gen.next();
	}
	
	/**
	 * Cambia o asigna una categoria a un ebook
	 * @param	{Event}	e
	 */
	function _changeInputCategoria( e ) 
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

		Nando.Red.enviaJson( 'categoriza', cambio );
		Nando.Elementos.cambiaCategoria( categoriaAntigua, detalleLibro, Nando.Elementos.dame( '.listas' ));
		Nando.Estados.cambiaA( Nando.Estados.anterior );
	}
	
	/**
	 * retorna la lista de ebooks
	 * @returns	{promise<Array>}	Devuelve los libros
	 */
	function pideEbooks() 
	{
		return Nando.Libro.ebooks;
	}
	
	/**
	 * Al datalist de busqueda le agregamos la lista de los ebooks que tienemos
	 * @param	{Array}		ebooks
	 * @returns	{promise}	Regresa una promesa para seguir la cadena
	 */
	function adicionaCategoriasADatalistDeEbooks( ebooks ) 
	{
		return Nando.Elementos.creaOptionsPara( Nando.Elementos.damePorId( 'BuscarEbookList' ), ebooks );
	}
	
	/**
	 * Tomamos el nombre del libro del datalist y lo buscamos en la lista de links haciendo
	 * scroll para que el usuario pueda ver este link y hacer click si quiere.
	 * El link encontrado lo marcamos de un color amarillo
	 */
	function _changeBuscarEbook() 
	{
		const ebook = this.value.trim();

		let gen = (function *()
		{
			const Elementos = yield Nando.Cargador.trae( 'Elementos', null, gen );

			Elementos.buscaConTextContent( ebook, 'a', Elementos.dame( '.listas' ))
				.then($elementos => Elementos.scrollTo( $elementos[ 0 ]));
		})();

		gen.next();
	}
	
	/**
	 * Al hacer click sobre el boton de estrella (para calificar), cambiamos el estado a CALIFICA
	 */
	function _muestraBarraCalificacion() 
	{
		let gen = (function *()
		{
			let Estados = yield Nando.Cargador.trae( 'Estados', null, gen );
			
			Estados.cambiaA( Estados.CALIFICA );
		})();

		gen.next();
	}
	
	/**
	 * Al hacer click en un boton con calificacion, las asigna en el objeto con la informacion del libro y
	 * actualiza el UI.
	 * @param	{Event}	e
	 */
	function _clickEnRankList(e) 
	{
		let textContent = e.target.textContent.trim();

		if (!textContent)
		{
			let parentNode = e.target.parentNode;
			let $span = parentNode.querySelector('span');

			if ($span)
			{
				textContent = $span.textContent;
			}
			else
			{
				parentNode  = parentNode.parentNode;
				$span       = parentNode.querySelector('span');
				textContent = $span.textContent;
			}
		}

		let gen = (function *()
		{
			const numerosRegexp  = /\d/;
			const Elementos      = yield Nando.Cargador.trae( 'Elementos', null, gen );

			let [ calificacion ] = numerosRegexp.exec( textContent );

			if ( !calificacion ) return;

			const Libro = yield Nando.Cargador.trae( 'Libro', null, gen );
			Libro.calificaCon( calificacion );

			const Red      = yield Nando.Cargador.trae( 'Red', null, gen );
			let { nombre } = Libro.detalleLibro;

			Red.enviaJson( 'califica', 
			{
				calificacion, 
				libro: nombre 
			});

			Elementos.damePorId( 'RankEbook' )
				.then($botonCalificacion => Elementos.califica( calificacion, $botonCalificacion, nombre ));

			const Estados = yield Nando.Cargador.trae( 'Estados', null, gen );
			Estados.cambiaA( Estados.anterior );
		})();

		gen.next();
	}

	function _muestraAreaParaNotas() 
	{
		Nando.Cargador.trae( 'Estados' ).then(Estados => Estados.cambiaA( Estados.COMENTA ));
	}

	/**
	 * Se encarga de tomar el comentario escrito por el usuario y coordinar para que sea actualizado el 
	 * estado en la app, enviado al servidor, actualizado en las listas de ebooks y actualiza el Estado 
	 * general de la app
	 */
	function _changeEnNotas()
	{
		const comentario = this.value.trim();

		let gen = (function *()
		{
			const Libro      = yield Nando.Cargador.trae( 'Libro', null, gen );
			Libro.agregaComentario( comentario );

			// TODO: Guardar la nota aun cuando no se este leyendo el libro
			const Red             = yield Nando.Cargador.trae( 'Red', null, gen );
			let { nombre: libro } = Libro.detalleLibro;

			Red.enviaJson( 'comenta', 
			{ 
				notas: comentario, 
				libro 
			});

			const Elementos = yield Nando.Cargador.trae( 'Elementos', null, gen );

			Elementos.dame( '.listas' )
				.then($contenedorListas => Elementos.comenta( comentario, $contenedorListas, libro ));

			const Estados = yield Nando.Cargador.trae( 'Estados', null, gen );
			Estados.cambiaA( Estados.anterior ); 
		})();

		gen.next();
	}

	function _abreImporttadorEbooks()
	{
		let gen = (function *()
		{
			let Elementos = yield Nando.Cargador.trae( 'Elementos', null, gen );
			Elementos.abreImporttadorEbooks();
		})();

		gen.next();
	}

	/**
	 * Se encarga de subir los archivos seleccionados por el usuario a la biblioteca.
	 * Realiza un reload para que tome la informacion del o los nuevos libros
	 */
	function _subirArchivos()
	{
		if (this.files.length)
		{
			let gen = (function *()
			{
				const Elementos   = yield Nando.Cargador.trae( 'Elementos', null, gen );
				const ImportEbook = Elementos.damePorId( 'ImportEbook' );
				const Red         = yield Nando.Cargador.trae( 'Red', null, gen );

				let librosASubir = this.files.length;

				Elementos.muestraNumeroEbooksSubiendo( ImportEbook, librosASubir );

				for (let archivo of this.files)
				{
					yield Red.subeLibro( archivo.name, archivo, gen );
					
					librosASubir -= 1;
					Elementos.muestraNumeroEbooksSubiendo( ImportEbook, librosASubir );
				}

				Elementos.muestraNumeroEbooksSubiendo( ImportEbook, librosASubir, { quitar: true });
				location.reload();
			}.bind( this ))();

			gen.next();
		}
	}
	
	Nando.Arquitecto = 
	{
		inicia,
	};
})();
