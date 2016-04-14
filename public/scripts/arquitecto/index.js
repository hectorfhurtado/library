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
				.trae( 'Red', 'red/index' )
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
				.trae( 'Libro', 'libro/index' )
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
				.trae( 'Elementos', 'elementos/index' )
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

		inicializaEventHandlers() {

			return Nando.Cargador.trae( 'Elementos', 'elementos/index' ).then( function( E ) {

				return E.dame( 'section' )
			}).then( function ( $section ) {

				$section.addEventListener( 'click', this._clickEnSectionLibros.bind( this ))

				// TODO: continuar con los eventos para los botones del Aside
			}.bind( this ))
		},

		_clickEnSectionLibros( e ) {

			if ( !e.target.pathname ) return

			e.preventDefault()

			Nando.Cargador.trae( 'Red', 'red/index' )
				.then( R => R.traeJson( 'book', `info=${ e.target.pathname }` ))
				.then( infoLibro => Nando.Libro.extraeDetallesDe( infoLibro, unescape( e.target.pathname )))
				.then( detalleLibro => Nando.Elementos.muestraLibro( detalleLibro, Nando.Elementos.damePorId( 'iframe' )))
				.then( () => Nando.Cargador.trae( 'Estados', 'elementos/estados' ))
				.then( E => E.cambiaA( E.LIBRO ))
				.then( detallelibro => console.log( detallelibro ))
		},
	}
})()
