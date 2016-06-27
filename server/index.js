const http      = require( 'http' );
const Servidor  = require( './servidor' );
const Libro     = require( '../lib/libro');
const server    = http.createServer(( req, res ) => Servidor.sirve( req, res ));

const PUERTO = 7010;

server.listen( PUERTO );

Libro.verificaSiExisteEbooks();

/* eslint no-console: "off" */
console.log( 'http://localhost:7010' );
