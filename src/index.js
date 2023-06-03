import server from './server'

import * as dotenv from 'dotenv'



dotenv.config()


const main = async() => {
    
 
  
 
    let port = process.env.PORT || 4000
  server.listen(port, ()=>{
    console.log(`the server is up on port: ${port}`)
})
}

main();
