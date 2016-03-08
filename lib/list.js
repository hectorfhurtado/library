const fs = require( 'fs' )

module.exports = {

    list(path, callback)
    {

        fs.readdir( path, function( err, lista ) {

            if ( err ) {
                console.log( err )
                return
            }

            callback( lista )
        })
    },
}
