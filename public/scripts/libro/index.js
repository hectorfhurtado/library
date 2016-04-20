/* global Nando */

(function() {
	
	// La lista de libros que tiene el usuario
	let _lista = null

	Nando.Libro = {

		inicia() {
			this.detalleLibro = null
		},

		get detalleLibro() {
            const libroString = sessionStorage.getItem( 'infoLibro' )

            return libroString ? JSON.parse( libroString ) : null
		},

		set detalleLibro( info ) {
			sessionStorage.setItem( 'infoLibro', JSON.stringify( info ))
		},

        guarda( lista ) {
            _lista = lista

            return this
        },

		/**
		 * Extrae las categorias de la lista de libros que le pasaron
		 * @returns {array}     La lista de categorias
		 */
		get categorias() {

			if ( !_lista ) return null

			return Object.keys( _lista )
		},

		/**
		 * Arma un mapa de las categorias con los libros y sus paths en la carpeta de libros del usuario
		 * @return {Array} Devuelve las categorias que a su vez contienen arrays de objetos
		 */
		get categoriasConLibros() {

			if ( !_lista ) return null

			return this.categorias.map( function( categoria ) {
				let grupo = {}

				grupo[ categoria ] = _lista[ categoria ].map( _armaPropiedades.bind( this, categoria ))
				return grupo
		
			}.bind( this ))
		},

		/**
		 * Extrae los detalles del libro seleccionado por el usuario en caso de que haya informacion
		 * @author Nando
		 * @param   {object} infoLibroDeServidor Detalles del libro
		 * @param   {string} pathname            El path que tiene el link para extraer el nombre del libro
		 * @returns {object} El mismo objeto que entro mas el nombre del libro
		 */
		extraeDetallesDe( infoLibroDeServidor, pathname ) {

			if ( !infoLibroDeServidor ) {
				infoLibroDeServidor = {}
			}

			if ( infoLibroDeServidor.categoria ) {
				infoLibroDeServidor.nombre = pathname.replace( '/' + infoLibroDeServidor.categoria + '/', '' )
			}
			else {
				infoLibroDeServidor.nombre = pathname.replace( '/', '' )
			}

			this.detalleLibro = infoLibroDeServidor

			return infoLibroDeServidor
		},

		/**
		 * Asigna los campos para que al libro se le pueda hacer seguimiento com oleyendo
		 * @author Nando
		 * @param   {object}         infoPaginas Con tiene el total de paginas y la pagina en la que esta el usuario
		 * @returns {object|promise} Si todo sale bien retorna el objeto con los campos del libro, sino, un rechazo
		 */
		adiciona( infoPaginas ) {
			let detalles = this.detalleLibro

			if ( !detalles ) return Promise.reject( 'No hay informacion del nombre del libro' )

			detalles.actual  = infoPaginas.actual || 0
			detalles.leyendo = true

			// Asignamos valores por defecto si no los tiene
			Object.assign( detalles,  {
				paginas     : infoPaginas.paginas || 0,
				calificacion: 0,
				notas       : '',
				categoria   : '',
			})

			this.detalleLibro = detalles

			return detalles
		},

		/**
		 * Actualiza los atributos del libro para iniciar la proxima vez
		 * @author Nando
		 * @returns {object} Los detalles del libro
		 */
		termina() {
			let detalles = this.detalleLibro

			detalles.actual  = 1
			detalles.leyendo = false

			this.detalleLibro = detalles

			return Promise.resolve( detalles )
		},
		
		/**
		 * Actualiza la categoria en la informacion del libro
		 * @param	{String}			El nombre de la nueva categoria
		 * @return  {promise<Object>}
		 */
		actualiza( categoria ) {
			if ( !categoria ) return Promise.resolve( null )
			
			let detalles       = this.detalleLibro
			detalles.categoria = categoria
			this.detalleLibro  = detalles
			
			return Promise.resolve( detalles )
		},
	}
	
	/**
	 * Crea las categorias para armar los links que se muestran al ususario
	 * @private
	 * @author Nando
	 * @param   {string} categoria La categoria del libro
	 * @param   {string} path      El path donde se encuentra el libro en la carpeta 'ebooks'
	 * @returns {Array}  Con las propiedades libro y link
	 */
	function _armaPropiedades( categoria, path ) {
		
		// Para 'Sin leer
		let propiedades = {
			libro: path,
			link : path,
		}

		switch ( categoria ) {
		case 'Leyendo':

			if ( /\//.test( path )) {
				propiedades.libro = path.split( '/' )[ 1 ]
			}
			break

		case 'Sin leer':
			// NOOP
			break

		default:
			propiedades.link = `${ categoria }/${ path }`
			break
		}

		return propiedades
	}
})()
