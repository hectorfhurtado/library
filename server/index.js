const http = require( 'http' )
const path = require( 'path' )
const fs = require( 'fs' )
const PATH_WEB = '../public'
const PATH_PDF = '../ebooks'
const List = require( '../lib/list' )

const server = http.createServer( servir )

function servir( req, res )
{
    'use strict'

    if ( /\?/.test( req.url )) {
        const mitades = req.url.split( '?' )
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
        List.list( path.join( __dirname, PATH_PDF )).then( lista => res.end( JSON.stringify( lista )))
    }

    else
        fs.createReadStream( path.join( __dirname, PATH_WEB + req.url )).pipe( res )
}

server.listen( 7010, 'localhost' )
