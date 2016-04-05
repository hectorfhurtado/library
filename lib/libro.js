'use strict'

const fs    = require( 'fs' )
const INFO  = 'server/reading.json'
const EBOOKS = 'ebooks'

module.exports = {
    /**
     * Lee el archivo JSON con la informacion de los libros que estemos leyendo o hayamos leido.
     * Enviamos la informacion del archivo requerido, si no hay infomacion, no enviamos nada
     * @param   {object}          detalles El nombre del libro y la categoria, si tiene
     * @returns {Promise<Object>} Enviamos los detalles del libro requerido
     */
    trae( detalles ) {

        return new Promise( function( res, rej ) {

            if ( 'totalInfo' in this === false ) {

                fs.readFile( INFO, { encoding: 'utf8'}, function( err, data ) {

                    if ( err )   {
                        rej( err )
                        return
                    }
                    this.totalInfo = JSON.parse( data )

                    res( this.totalInfo[ detalles.nombre ] || 0 )
                }.bind( this ))
            }
            else {
                res( this.totalInfo[ detalles.nombre ] || 0 )
            }
        }.bind( this ))
    },

    /**
     * Actualizamos el archivo JSON para hacer seguimiento al libro que estemos leyendo
     * @param {string} nombre el nombre del libro
     * @param {string} actual La pagina actual
     */
    actualizaPaginaActual( nombre, actual ) {

        if ( 'totalInfo' in this ) {
            this.totalInfo[ nombre ].actual = actual

            fs.writeFile( INFO, JSON.stringify( this.totalInfo ))
        }
    },

    /**
     * Adiciona el libro a la lista de no existir o actualiza el libro existente
     * @param {object} detallesLibro Los detalles a cambiar o a ingresar en la BD
     */
    adicionaALectura( detallesLibro ) {
        const nombre = detallesLibro.nombre

        delete detallesLibro.nombre

        if ( 'totalInfo' in this ) {

            // Si tenemos ya el libro referenciado, solo necesitamos actualizar el dato de la pagina actual
            // y que lo estamos leyendo
            if ( this.totalInfo[ nombre ]) {
                this.totalInfo[ nombre ].actual   = detallesLibro.actual
                this.totalInfo[ nombre ].leyendo  = true
            }
            else {
                this.totalInfo[ nombre ] = detallesLibro
            }
        }
        else {
            this.totalInfo            = {}
            this.totalInfo[ nombre ]  = detallesLibro
        }

        fs.writeFile( INFO, JSON.stringify( this.totalInfo ))
    },

    /**
     * Actualiza la informacion del libro si hay o si existe el libro y actualiza el archivo .JSON
     * @param {string} libro El nombre del libre
     */
    terminaLibro( libro ) {

        if ( 'totalInfo' in this && this.totalInfo[ libro ]) {
            this.totalInfo[ libro ].leyendo = false
            this.totalInfo[ libro ].actual  = '1'

            fs.writeFile( INFO, JSON.stringify( this.totalInfo ))
        }
    },

	/**
	 * Inicializa el generador para realizar la categorizacion del libro a nivel del sistema de archivos
	 * @param {object} libro Contiene el [nombre] del libro, la categoria [antigua] y la [nueva]
	 */
	categoriza( libro ) {

		this._categorizaGen = this._categoriza( libro )
		this._categorizaGen.next()
	},

	/**
	 * Busca el path antiguo, si no existe no hace nada porque es como si no existiera el libro.
	 * Busca el path nuevo, si no existe, crea la carpeta, si ya existe copia el archivo en la nueva
	 * carpeta y por ultimo actualiza el archivo JSON de seguimiento
	 */
	*_categoriza( libro ) {

		const pathAntiguo = ( !libro.antigua ) ? `${ EBOOKS }/${ libro.nombre }` : `${ EBOOKS }/${ libro.antigua }/${ libro.nombre }`
		let existeAntiguo = yield this.existe( pathAntiguo )

		if ( existeAntiguo === false ) return

		const pathNuevo = ( libro.nueva == 'Sin leer' ) ? EBOOKS : `${ EBOOKS }/${ libro.nueva }`
		let existeNuevo = yield this.existe( pathNuevo, true )

		if ( existeNuevo === false ) {
			yield this.creaCategoriaNueva( pathNuevo )
		}

		yield this.copia( pathAntiguo, `${ pathNuevo }/${ libro.nombre }` )

		if ( 'totalInfo' in this && this.totalInfo[ libro.nombre ]) {
            this.totalInfo[ libro.nombre ].categoria = ( libro.nueva == 'Sin leer' ) ? '' : libro.nueva

            fs.writeFile( INFO, JSON.stringify( this.totalInfo ))
        }
	},

	/**
	 * Busca el path suministrado y mira si es un archivo o carpeta.
	 * Si no existe el path suministrado devuelve false al generador
	 * @param {string}  path    El path del archivo o carpeta a buscar
	 * @param {boolean} carpeta true si queremos verificar si el path es una carpeta
	 */
	existe( path, carpeta ) {

		fs.stat( path, function ( err, stats ) {

			if ( err ) {
				this._categorizaGen.next( false )
				return
			}

			if ( carpeta ) {
				this._categorizaGen.next( stats.isDirectory() )
			}
			else {
				this._categorizaGen.next( stats.isFile() )
			}
		}.bind( this ))
	},

	/**
	 * Movemos el archivo del [pathAntiguo] al [pathNuevo].
	 * Si algo sale mal lanzamos el error
	 * @param {string}   pathAntiguo
	 * @param {string} pathNuevo
	 */
	copia( pathAntiguo, pathNuevo ) {

		fs.rename( pathAntiguo, pathNuevo, function( err ) {

			if ( err ) {
				this._categorizaGen.throw( err )
				return
			}

			this._categorizaGen.next()
		}.bind( this ))
	},

	/**
	 * Crea la carpeta en el path suministrado
	 * Si algo sale mal lanzamos el error
	 * @param {string} path
	 */
	creaCategoriaNueva( path ) {

		fs.mkdir( path, function( err ) {

			if ( err ) {
				this._categorizaGen.throw( err )
			}
			this._categorizaGen.next()
		}.bind( this ))
	},
}
