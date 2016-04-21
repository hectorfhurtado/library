const fs   = require( 'fs' )
const Path = require('path' )
const INFO  = 'server/reading.json'

module.exports = {

    result: {},

    /**
     * Guarda referencias a los archivos y alista el generator
     * @param   {string}         path el path donde estan los ebooks
     * @returns {Promise<Array>} Retornara la lista de archivos en disco
     */
    lista( path ) {
        this.carpetas  = [ path ]
        this.generator = this.pasos()
        this.result    = {}

        return new Promise( function( resolve, reject ) {
            this.promesa = { resolve, reject }
            this.generator.next()
        }.bind( this ))
    },

    /**
     * Arma la lista de archivos y carpetas para leer lo que contienen y devuelve a la promesa
     * el resultado
     */
    *pasos() {
        'use strict'

        yield this.listaEbooksEnLectura()

        while ( this.carpetas.length ) {
            let folder = this.carpetas.shift()

            if ( 'Sin leer' in this.result === false ) {
                this.result[ 'Sin leer' ] = yield this.listaPdfs( folder )
            }
            else if ( Path.basename( folder ) == 'ebooks') {
                /* NO OP */
            }
            else {
                this.result[ Path.basename( folder )] = yield this.listaPdfs( folder )
            }
        }
        this.promesa.resolve( this.result )
    },

    /**
     * Busca en la lista de archivos cuales son pdfs y separa las que son carpetas en la lista
     * de carpetas
     * @param {string} path El path para buscar los archivos
     */
    listaPdfs( path ) {
        'use strict'

        fs.readdir( path, function( err, lista ) {

            if ( err ) {
                this.promesa.reject( err )
                return
            }
            let carpetas = lista.filter( file => /\./.test( file ) === false )

            carpetas && this.carpetas.push( ...carpetas.map( file => Path.join( path, file )))

            this.generator.next( lista.filter( file => /\.pdf/.test( file )))
        }.bind( this ))
    },

    /**
     * Adiciona el listado de los libros que estamos leyendo en el momento
     */
    listaEbooksEnLectura() {
        'use strict'

        fs.readFile( INFO, { encoding: 'utf8'}, function( err, data ) {

            if ( err ) {
                console.log( err )
                return
            }
            const datos = JSON.parse( data )

            let consolidado = Object.keys( datos )
                .filter( libro => datos[ libro ].leyendo )
                .map( libro => datos[ libro ].categoria ? `${ datos[ libro ].categoria }/${ libro }` : libro )

            this.result[ 'Leyendo' ] = consolidado

            this.generator.next()
        }.bind( this ))

    },
}
