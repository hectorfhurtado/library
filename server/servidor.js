const fs        = require( 'fs' )
const path      = require( 'path' )
const Lista     = require( '../lib/lista' )
const Libro     = require( '../lib/libro' )
const PATH_PDF  = '../ebooks'
const PATH_WEB  = '../public'

module.exports = {
	
    sirve( req, res )
    {
        'use strict'

        let mitades = null

        if ( /\?/.test( req.url ))
        {
            mitades = req.url.split( '?' )
            req.url = mitades[ 0 ]
        }
        
        this.clasifica( req, res )
        this.envia( req, res, mitades )
    },
    
	clasifica( req, res )
	{
		if      ( /\/$|\.html$/.test(   req.url ))  res.setHeader( 'Content-type', 'text/html' )
		else if ( /\.js$/.test(         req.url ))  res.setHeader( 'Content-type', 'application/javascript' )
		else if ( /\.css$/.test(        req.url ))  res.setHeader( 'Content-type', 'text/css' )
		else if ( /\.png$/.test(        req.url ))  res.setHeader( 'Content-type', 'image/png' )
		else if ( /\.gif$/.test(        req.url ))  res.setHeader( 'Content-type', 'image/gif' )
		else if ( /\.pdf/.test(         req.url ))  res.setHeader( 'Content-type', 'application/pdf' )
		else if ( /\.properties$/.test( req.url ))  res.setHeader( 'Content-type', 'text/plain' )
		else if ( /\.fetch$/.test(      req.url ))  res.setHeader( 'Content-type', 'application/json' )
		else if ( /\.json$/.test(       req.url ))  res.setHeader( 'Content-type', 'application/json' )
		else if ( /\.ico$/.test(        req.url ))  res.setHeader( 'Content-type', 'image/x-icon' )
		else if ( /\.svg$/.test(        req.url ))  res.setHeader( 'Content-type', 'image/svg+xml' )
		else                                        return
	},
    
    envia( req, res, mitades )
    {
        'use strict'
        
        if ( /\/$|index\.html$/.test( req.url ))
        {
            fs.createReadStream( path.join( __dirname, PATH_WEB + '/index.html' )).pipe( res )
        }    
        else if ( /icono\.html$/.test( req.url ))
        {
            // Esto es para poder crear los iconos a partir de archivos .svg
            fs.createReadStream( path.join( __dirname, req.url )).pipe( res )
        }
        else if ( /\.pdf/.test( req.url ))
        {
            fs.createReadStream( path.join( __dirname, PATH_PDF + decodeURI( req.url.replace( '/web', '' )))).pipe( res )
        }
        else if ( /\.fetch/.test( req.url ))
        {
            // Aqui pedimos la lista de libros en la biblioteca
            if ( /lista\.fetch/.test( req.url ))
            {
                Lista.lista( path.join( __dirname, PATH_PDF )).then( lista => res.end( JSON.stringify( lista )))
            }
            
            // Aqui pedimos informacion acerca de un libro en especifico
            if ( /book\.fetch/.test( req.url ) && req.method == 'GET' )
            {
                if ( mitades.length > 1 )
                {
                    const searchString = mitades[ 1 ].replace( 'info=/', '' )

                    if ( searchString ) {
                        const qParts = searchString.split( '/' )

                        let detalles = {}

                        if ( qParts.length > 1 ) {
                            detalles.categoria = qParts[ 0 ]
                            detalles.nombre    = qParts[ 1 ]
                        }
                        else
                        {
                            detalles.nombre = qParts[ 0 ]
                        }

                        Libro.trae( detalles )
                            .then( data => res.end( JSON.stringify( data )))
                            .catch( console.log )
                    }
                }
                else
                {
                    res.end( JSON.stringify( 0 ))
                }
            }

            // Aqui actualizamos la informacion del libro que estamos leyendo
            if ( /book\.fetch/.test( req.url ) && req.method == 'POST' )
            {
                req.setEncoding( 'utf8' )

                // TODO: Separar esta funcion para que tome mas datos, ahorita solo toma los utlimos que vengan
                req.on( 'data', function( chunk )
                {
                    const infoLibro = JSON.parse( chunk )
                    Libro.actuallizaPaginaActual( infoLibro.libro, infoLibro.actual )
                })

                req.on( 'end', function()
                {
                    res.writeHead( 200, 'OK', { 'Content-Type': 'text/html' })
                    res.end()
                })
            }
        }
        else
        {
            fs.createReadStream( path.join( __dirname, PATH_WEB + req.url )).pipe( res )
        }
    },
}