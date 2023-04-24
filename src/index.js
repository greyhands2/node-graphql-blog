import {createSchema, createYoga, createPubSub} from 'graphql-yoga'
import { makeExecutableSchema } from '@graphql-tools/schema';

import {createServer} from 'node:http'
import gprf from 'graphql-parse-relation-fields'
import db from './db'
import dbRelationalFields from "./helpers/db-relational-fields";
import Query from './resolvers/Query'
import Mutation from './resolvers/Mutation';
import User from './resolvers/User';
import Post from './resolvers/Post';
import Link from './resolvers/Link';
import Comment from './resolvers/Comment';
import Subscription from './resolvers/Subscription';
import typeDefs from './typeDefs';
import prismaContext from './prismaContext';
const pubsub = createPubSub()

//resolvers for api
const resolvers = {
    Query,
    Mutation,
    Subscription,
    User,
    Post,
    Comment,
    Link 
}



const main = async() => {
    
 
  const yoga = createYoga({
    schema: makeExecutableSchema({
    typeDefs,
    resolvers
    }),
    context: {
        db,
        pubsub,
        gprf,
        prisma:prismaContext,
        dbRelationalFields
        
        
    }

})
  const server = createServer(yoga);
  
 
    let port = process.env.PORT || 4000
  server.listen(port, ()=>{
    console.log(`the server is up on port: ${port}`)
})
}

main();
