const http = require('http')
const Servidor = require('./servidor')
const server = http.createServer((req, res) => Servidor.sirve(req, res))

server.listen(7010)
