/* global Nando */

(function() {

	Nando.Libro = {

        // La lista de libros que tiene el usuario
        _lista: null,

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
            this._lista = lista

            return this
        },

		/**
		 * Extrae las categorias de la lista de libros que le pasaron
		 * @returns {array}     La lista de categorias
		 */
		get categorias() {

			if ( !this._lista ) return null

			return Object.keys( this._lista )
		},

		/**
		 * Arma un mapa de las categorias con los libros y sus paths en la carpeta de libros del usuario
		 * @return {Array} Devuelve las categorias que a su vez contienen arrays de objetos
		 */
		get categoriasConLibros() {

			if ( !this._lista ) return null

			return this.categorias.map( function( categoria ) {
				let grupo = {}

				grupo[ categoria ] = this._lista[ categoria ].map( this._armaPropiedades.bind( this, categoria ))
				return grupo
			}.bind( this ))
		},

		/**
		 * Crea las categorias para armar los links que se muestran al ususario
		 * @private
		 * @author Nando
		 * @param   {string} categoria La categoria del libro
		 * @param   {string} path      El path donde se encuentra el libro en la carpeta 'ebooks'
		 * @returns {Array}  Con las propiedades libro y link
		 */
		_armaPropiedades( categoria, path ) {
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
	}
})()
