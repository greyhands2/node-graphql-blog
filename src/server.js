
import {createYoga, createPubSub} from 'graphql-yoga'
import { makeExecutableSchema} from '@graphql-tools/schema';

import {applyMiddleware} from 'graphql-middleware'
import resolvers from './resolvers/index'

import {createServer} from 'node:http'
import gprf from 'graphql-parse-relation-fields'
import dbRelationalFields from "./helpers/db-relational-fields";
import userFragmentMiddleware from './middleware/userFragmentMiddleware'
import typeDefs from './typeDefs';
import prismaContext from './prismaContext';
const pubsub = createPubSub()


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


export {server as default}