const http = require( 'http' )
const path = require( 'path' )
const querystring = require( 'querystring' )
const fs = require( 'fs' )

const PATH_WEB = '../public'
const PATH_PDF = '../ebooks'
const List = require( '../lib/list' )
const Book = require( '../lib/book' )

const server = http.createServer( servir )

function servir( req, res )
{
    'use strict'

    let mitades = null

    if ( /\?/.test( req.url )) {
        mitades = req.url.split( '?' )
        req.url = mitades[ 0 ]
    }

    if ( /\/$|index\.html$/.test( req.url ))
    {
        res.setHeader( 'Content-type', 'text/html' )
        fs.createReadStream( path.join( __dirname, PATH_WEB + '/index.html' )).pipe( res )
        return
    }

    if ( /\.html$/.test( req.url ))      res.setHeader( 'Content-type', 'text/html' )
    else if ( /\.js$/.test( req.url ))   res.setHeader( 'Content-type', 'application/javascript' )
    else if ( /\.css$/.test( req.url ))  res.setHeader( 'Content-type', 'text/css' )
    else if ( /\.png$/.test( req.url ))  res.setHeader( 'Content-type', 'image/png' )
    else if ( /\.gif$/.test( req.url ))  res.setHeader( 'Content-type', 'image/gif' )
    else if ( /\.pdf/.test( req.url ))   res.setHeader( 'Content-type', 'application/pdf' )
    else if ( /\.properties$/.test( req.url ))  res.setHeader( 'Content-type', 'text/plain' )
    else if ( /\.fetch$/.test( req.url )) res.setHeader( 'Content-type', 'application/json' )
    else if ( /\.json$/.test( req.url )) res.setHeader( 'Content-type', 'application/json' )
    else if ( /\.ico$/.test( req.url ))  res.setHeader( 'Content-type', 'image/x-icon' )
    else if ( /\.svg$/.test( req.url ))  res.setHeader( 'Content-type', 'image/svg+xml' )
    else                                 return

    if ( /icono\.html$/.test( req.url ))

        // Esto es para poder crear los ├¡conos a partir de archivos .svg
        fs.createReadStream( path.join( __dirname, req.url )).pipe( res )

    else if ( /\.pdf/.test( req.url ))
        fs.createReadStream( path.join( __dirname, PATH_PDF + decodeURI( req.url.replace( '/web', '' )))).pipe( res )

    else if ( /\.fetch/.test( req.url )) {

        if ( /lista\.fetch/.test( req.url ))
            List.list( path.join( __dirname, PATH_PDF )).then( lista => res.end( JSON.stringify( lista )))

        if ( /book\.fetch/.test( req.url ) && req.method == 'GET' )
        {
            if ( mitades.length > 1 )
            {
                const searchString = mitades[ 1 ].replace( 'info=/', '' )

                if ( searchString ) {
                    const qParts = searchString.split( '/' )

                    let details = {}

                    if ( qParts.length > 1 ) {
                        details.categoria = qParts[ 0 ]
                        details.nombre = qParts[ 1 ]
                    }
                    else
                        details.nombre = qParts[ 0 ]

                    Book.getInfo( details ).then( data => res.end( JSON.stringify( data )))
                        .catch( console.log )

                }
            }
            else
            {
                res.end( JSON.stringify( 0 ))
            }
        }

        if ( /book\.fetch/.test( req.url ) && req.method == 'POST' )
        {
            req.setEncoding( 'utf8' )

            req.on( 'data', function( chunk )
            {
                const bookInfo = JSON.parse( chunk )
                Book.updateCurrentPage( bookInfo.book, bookInfo.current )
            })

            req.on( 'end', function()
            {
                res.writeHead(200, "OK", {'Content-Type': 'text/html'});
                res.end();
            })
        }
    }

    else
        fs.createReadStream( path.join( __dirname, PATH_WEB + req.url )).pipe( res )
}

server.listen( 7010 )
