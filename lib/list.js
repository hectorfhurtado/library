const fs = require( 'fs' )
const Path = require( 'path' )

module.exports = {

// recorre la carpeta suministrada
// filtra y deja solo los pdfs
// si encuentra una carpeta, deja ese como una nueva categoria
// recorre el interior de las carpetas encontradas
// devuelve un objeto con todo lo encontrado

    result: {},

    list( path )
    {
        this.folders = [ path ]
        this.generator = this.steps()

        return new Promise( function( resolve, reject )
        {
            this.promise = { resolve, reject }
            this.generator.next()
        }.bind( this ))
    },

    *steps()
    {
        'use strict'

        while( this.folders.length )
        {
            let folder = this.folders.shift()

    console.log(folder)

            if ( 'Sin leer' in this.result == false )
                this.result[ 'Sin leer' ] = yield this.listPdfs( folder )
            else
                this.result[ Path.basename( folder )] = yield this.listPdfs( folder )
        }
        this.promise.resolve( this.result )
    },

    listPdfs( path )
    {
        'use strict'

        fs.readdir( path, function( err, lista ) {

            if ( err ) {
                this.promise.reject( err )
                return
            }

            let folders = lista.filter( file => /\./.test( file ) == false )
            folders && this.folders.push( ...folders.map( file => Path.join( path, file )) )

            console.log(this.folders)

            this.generator.next( lista.filter( file => /\.pdf/.test( file )))
        }.bind( this ))

    },
}
