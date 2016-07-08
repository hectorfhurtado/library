const http      = require( 'http' );
const Servidor  = require( './servidor' );
const Libro     = require( '../lib/libro');
const server    = http.createServer(( req, res ) => Servidor.sirve( req, res ));
const os        = require( 'os' );

const PUERTO = 7010;

server.listen( PUERTO );

Libro.verificaSiExisteEbooks();

/* eslint no-console: "off" */
const networkInterfaces = os.networkInterfaces();

console.log( 'Intenta acceder a traves de cualquiera de las siguientes direcciones: ' );

for (const interfaz in networkInterfaces)
{
    for (const subinterfaz of networkInterfaces[ interfaz ])
    {
        if (subinterfaz.internal === false && subinterfaz.family === 'IPv4')
            console.log( `http://${ subinterfaz.address }:${ PUERTO }` );
    }
}
