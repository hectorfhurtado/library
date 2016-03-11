const fs = require( 'fs' )
const INFO = 'server/reading.json'

module.exports =
{
    trae( detalles )
    {
        return new Promise( function( res, rej )
        {
            if ( 'totalInfo' in this === false )
            {
                fs.readFile( INFO, { encoding: 'utf8'}, function( err, data )
                {
                    if ( err )
                    {
                        rej( err )
                        return
                    }
                    this.totalInfo = JSON.parse( data )

                    res( this.totalInfo[ detalles.nombre ] || 0 )
                }.bind( this ))
            }
            else
            {
                res( this.totalInfo[ detalles.nombre ] || 0 )
            }
        }.bind( this ))
    },

    actualiaPaginaActual( nombre, actual )
    {
        if ( 'totalInfo' in this )
        {
            this.totalInfo[ nombre ].actual = actual

            fs.writeFile( INFO, JSON.stringify( this.totalInfo ))
        }
    }
}
