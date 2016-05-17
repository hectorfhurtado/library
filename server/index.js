const http      = require( 'http' )
const Servidor  = require( './servidor' )
const Libro     = require( '../lib/libro')
const server    = http.createServer(( req, res ) => Servidor.sirve( req, res ))

server.listen( 7010 )

Libro.verificaSiExisteEbooks()

console.log( 'http://localhost:7010' )
