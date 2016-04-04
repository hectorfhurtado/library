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

	categoriza( libro ) {

		this._categorizaGen = this._categoriza( libro )
		this._categorizaGen.next()
	},

	*_categoriza( libro ) {

		// if existe antiguo
		const pathAntiguo = ( !libro.antigua ) ? `${ EBOOKS }/${ libro.nombre }` : `${ EBOOKS }/${ libro.antigua }/${ libro.nombre }`

		let existeAntiguo = yield this.existe( pathAntiguo )
		if ( existeAntiguo === false ) return

		const pathNuevo = ( libro.nueva == 'Sin leer' ) ? EBOOKS : `${ EBOOKS }/${ libro.nueva }`

		// if existe nuevo, creo la carpeta
		let existeNuevo = yield this.existe( pathNuevo, true )
		if ( existeNuevo === false ) {
			yield this.creaCategoriaNueva( pathNuevo )
		}

		// Copie de antiguo a nuevo
		yield this.copia( pathAntiguo, `${ pathNuevo }/${ libro.nombre }` )

		if ( 'totalInfo' in this && this.totalInfo[ libro.nombre ]) {
            this.totalInfo[ libro.nombre ].categoria = ( libro.nueva == 'Sin leer' ) ? '' : libro.nueva

            fs.writeFile( INFO, JSON.stringify( this.totalInfo ))
        }
	},

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

	copia( pathAntiguo, pathNuevo ) {

		fs.rename( pathAntiguo, pathNuevo, function( err ) {

			if ( err ) {
				this._categorizaGen.throw( err )
				return
			}

			this._categorizaGen.next()
		}.bind( this ))
	},

	creaCategoriaNueva( path ) {

		fs.mkdir( path, function( err ) {

			if ( err ) {
				this._categorizaGen.throw( err )
			}
			this._categorizaGen.next()
		}.bind( this ))
	},

	borra( archivo ) {

	}
}
