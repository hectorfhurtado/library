/* global Nando, unescape */

(function() {

	Nando.Arquitecto = {

		inicia() {

			this.iniciaLibro()
				.then( this.pideLista )
				.then( this.pideCategorias )
                .then( this.adicionaCategoriasADatalistDeCategorias )
				.then( this.muestraLibros )
				.then( categorias => console.log( categorias ))

			this.inicializaEventHandlers()
		},

		/**
		 * Pide al modulo Red la lista de libros en la biblioteca del usuario
		 * @author Nando
		 * @returns {Promise<object>} El objeto con la informacion del servidor
		 */
		pideLista() {

			return Nando.Cargador
				.trae( 'Red' )
				.then( R => R.traeJson( 'lista' ))
				.catch( error => console.error( error ))
		},

		/**
		 * Pide las categorias a las que pertenecen los libros recibidos
		 * @author Nando
		 * @param   {Array} lista La lista la enviamos al modulo Libro para que la guarde
		 * @returns {Array} Contiene solo los nombres de las categorias
		 */
		pideCategorias( lista ) {

			return Nando.Libro.guarda( lista ).categorias
		},

		iniciaLibro() {

			return Nando.Cargador
				.trae( 'Libro' )
				.then( L => L.inicia())
		},

        /**
         * La informacion para el datalist que usa el usuario al momento de dar una categoria a un libro
         * se alimenta de la lista de categorias suministrada. Quitamos 'Leyendo' y 'Sin leer' porque no
         * son categorias como tal sino ayudantes para los libros sin categoria
         * @author Nando
         * @param   {Array}              categorias La lista de categorias
         * @returns {Promise<undefined>} No devolvemos nada en la promesa
         */
        adicionaCategoriasADatalistDeCategorias( categorias ) {
			const categoriasFiltradas = categorias.filter( categoria => /Leyendo|Sin leer/.test( categoria ) === false )

			return Nando.Cargador
				.trae( 'Elementos' )
			    .then( E => E.creaOptionsPara( E.damePorId( 'CategoriaEbookList' ), categoriasFiltradas ))
				.catch( error => console.log( error ))
		},

		/**
		 * Pedimos al modulo Elementos que cree la lista con los libros para que el usuario comience a leer
		 * alguno
		 * @author Nando
		 * @returns {promise}
		 */
		muestraLibros() {

			return Promise.resolve( Nando.Libro.categoriasConLibros )
				.then( categorias => Nando.Elementos.creaListaLibros( categorias, Nando.Elementos.dame( 'section' )))
		},

		/**
		 * Inicializa los event handlers para los elementos que contienen links y/o botones
		 * @author Nando
		 * @returns {Promise} [[Description]]
		 */
		inicializaEventHandlers() {

			return Nando.Cargador.trae( 'Elementos' ).then( function( E ) {

				return Promise.all([
					E.dame( 'section' ),
					E.dame( 'aside' ),
				])
			}).then( function([ $section, $aside ]) {

				$section.addEventListener( 'click', this._clickEnSectionLibros.bind( this ))
				$aside.addEventListener( 'click', this._clickEnMenu.bind( this ))
			}.bind( this ))
		},

		/**
		 * Cuando hacemos click en un link de un libro lo traemos, mostramos en el pdfjs y anunciamos
		 * el cambio de estado de todos los elementos del UI
		 * @private
		 * @author Nando
		 * @param {object} e Event
		 */
		_clickEnSectionLibros( e ) {

			if ( !e.target.pathname ) return

			e.preventDefault()

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
		},

		_clickEnMenu( e ) {

			if ( e.target.id ) {

				switch( e.target.id ) {
					case 'CloseEbook':
						this._cierraLibro()
						break

					case 'AddEbook':
						this._adicionaLibro()
						break

					case 'EndEbook':
						// TODO: Continuar aqui
						break
				}
			}
		},

		/**
		 * Tiene la logica para cerrar el libro y guardar en donde vamos si estamos leyendo
		 * @private
		 * @author Nando
		 * @returns {promise}
		 */
		_cierraLibro() {

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
		},

		/**
		 * Adivoins un nuevo libro a la categoria 'Leyendo' y hace el cambio en el UI y en el servidor
		 * @private
		 * @author Nando
		 */
		_adicionaLibro() {
			Nando.Cargador.trae( 'Elementos' )
				.then( Elementos => Elementos.infoPaginasPdf( Elementos.damePorId( 'iframe' )))
				.then( infoPaginas => Nando.Libro.adiciona( infoPaginas ))
				.then( informacion => Nando.Red.enviaJson( 'nuevoebook', informacion ))
				.then( () => Nando.Estados.cambiaA( Nando.Estados.LEYENDO ))
				.then( () => Nando.Elementos.adicionaALa( 'Leyendo', Nando.Libro.detalleLibro, Nando.Elementos.dame( 'section' )))
				.catch( error => console.error( error ))
		},
	}
})()
