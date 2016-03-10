const fs = require( 'fs' )
const INFO = 'server/reading.json'

module.exports = {

    getInfo( details )
    {
        console.log( details )

        return new Promise( function( res, rej )
        {
            if ( 'totalInfo' in this == false )
            {
                fs.readFile( INFO, { encoding: 'utf8'}, function( err, data )
                {
                    if ( err )
                    {
                        rej( err )
                        return
                    }

                    this.totalInfo = JSON.parse( data )

                    res( this.totalInfo[ details.nombre ] || 0 )
                }.bind( this ))
            }
            else
            {
                res( this.totalInfo[ details.name ] || 0 )
            }
        }.bind( this ))
    },

    updateCurrentPage( name, current )
    {
        if ( 'totalInfo' in this )
        {
            this.totalInfo[ name ].current = current

            fs.writeFile( INFO, JSON.stringify( this.totalInfo ))
        }
    }
}
