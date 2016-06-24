const fork = require('child_process').fork;
const fs   = require('fs');
const path = require('path');

const PATH_SERVIDOR = 'server/index.js';
const TIMER         = 500;

let servidor = null;
let timer    = null;

fs.watch( __dirname, () =>
{
    if (servidor) servidor.kill();
    if (timer)    clearTimeout(timer);

    programaInicioServidor();
});

function programaInicioServidor()
{
    timer = setTimeout(() =>
    {
        servidor = fork( path.join( __dirname, PATH_SERVIDOR ));
    }, TIMER);
}

programaInicioServidor();
