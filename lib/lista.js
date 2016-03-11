const fs   = require( 'fs' )
const Path = require('path' )

module.exports =
{
    result: {},

    lista(path)
    {
        this.carpetas = [ path ]
        this.generator = this.pasos()

        return new Promise( function( resolve, reject )
        {
            this.promesa = { resolve, reject }
            this.generator.next()
        }.bind( this ))
    },

    *pasos()
    {
        'use strict'

        while ( this.carpetas.length )
        {
            let folder = this.carpetas.shift()

            if ( 'Sin leer' in this.result === false )
            {
                this.result[ 'Sin leer' ] = yield this.listaPdfs( folder )
            }
            else if ( Path.basename( folder ) == 'ebooks')
            {
                /* NO OP */
            }
            else {
                this.result[ Path.basename( folder )] = yield this.listaPdfs( folder )
            }
        }
        this.promesa.resolve( this.result )
    },

    listaPdfs(path)
    {
        'use strict'

        fs.readdir( path, function( err, lista )
        {

            if ( err )
            {
                this.promesa.reject( err )
                return
            }
            let carpetas = lista.filter( file => /\./.test( file ) === false )

            carpetas && this.carpetas.push( ...carpetas.map( file => Path.join( path, file )))

            this.generator.next( lista.filter( file => /\.pdf/.test( file )))
        }.bind( this ))
    },
}
