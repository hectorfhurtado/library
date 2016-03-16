const fs    = require( 'fs' )
const INFO  = 'server/reading.json'

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
}
