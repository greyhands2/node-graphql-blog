require('@babel/register')
require('@babel/polyfill/noConflict')
const server = require('../../src/server').default
module.exports = async () => {
    global.httpServer = await server.listen(4000, ()=>{
        console.log(`the server is up on port: 4000`)
    })
}
