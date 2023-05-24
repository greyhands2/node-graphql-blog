import {createYoga, createPubSub} from 'graphql-yoga'
import { makeExecutableSchema} from '@graphql-tools/schema';
import { gql } from 'graphql-tag';
import {applyMiddleware} from 'graphql-middleware'
import resolvers from './resolvers/index'

import {createServer} from 'node:http'
import gprf from 'graphql-parse-relation-fields'
import * as dotenv from 'dotenv'

import dbRelationalFields from "./helpers/db-relational-fields";
import userFragmentMiddleware from './middleware/userFragmentMiddleware'
import typeDefs from './typeDefs';
import prismaContext from './prismaContext';

dotenv.config()
const pubsub = createPubSub()

const main = async() => {
    
  const schema = makeExecutableSchema({typeDefs, resolvers})
  const schemaWithMiddleware = applyMiddleware(schema, userFragmentMiddleware)
  const yoga = createYoga({
    schema: schemaWithMiddleware,
    
    context({request}){
      
      return {
        
        pubsub,
        gprf,
        prisma:prismaContext,
        dbRelationalFields,
        request 
        
    }
    },
  

})
  const server = createServer(yoga);
  
 
    let port = process.env.PORT || 4000
  server.listen(port, ()=>{
    console.log(`the server is up on port: ${port}`)
})
}

main();
