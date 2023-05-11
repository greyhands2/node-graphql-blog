import {GraphQLError} from 'graphql'
import getUserId from '../helpers/getUserId'


const Query = {
       
    async users(parent, args, ctx, info){
     let {prisma, gprf, dbRelationalFields} = ctx;
     let opArgs = {}
      if(args.query){
        opArgs.where = {
            OR: [
                {
                    name:{
                        contains: args.query
                    }
                },
                {
                    email: {
                        contains: args.query
                    }
                } 

            ]
             
        }

        
      } 
   
     //for the second arguement in the prisma query you can provide, nothing/null just that this would provide only scalar fields and no relational fields... or a string which selects the fields we want to return but this is nit always good because we at this point of writing the code would not know the exact fields a client's query needs... or an object where we pass in the info object and it contains all the information about the request's operation, so this way if the client asked for only some scalar fields or relational fields or whatever, the query can fetch em and return
     //
     
     let queryFields = gprf({info, dbRelationalFields, type:"select"})
     
     opArgs.select = queryFields.select
    
     let users = await prisma.user.findMany(opArgs)
         
    console.log(users)
    return users
    },
    
    async me(parent, args, {prisma, request, gprf, dbRelationalFields}, info){
        const userId = getUserId(request)
        let opArgs = {}
        let queryFields = gprf({info, dbRelationalFields, type:"select"})
        let res
        opArgs.select = queryFields.select
        opArgs.where= {id: userId}
        await prisma.user.findUnique(opArgs)
        .then((data)=>{res=data})
        .catch((e)=>{throw new GraphQLError("Something isn't as it should")})
            
        return res
    },
    async posts(parent, args, ctx, info){
        let {prisma, gprf, dbRelationalFields} = ctx
       
        
        let opArgs = {}
        opArgs.where={published: true}
        if(args.query){
            opArgs.where.OR = [
                    {
                        title:{
                            contains: args.query
                        }
                    },
                    {
                        body: {
                            contains: args.query
                        }
                    }
                ]
            
        }
    let queryFields = gprf({info, dbRelationalFields, type:"select"})
     
     opArgs.select = queryFields.select
    let posts = await prisma.post.findMany(opArgs)
        console.log('posters', posts)
    return posts
    },
    async myPosts(){
        
    }, 
    async post(parent, {id}, {prisma, request, dbRelationalFields, gprf}, info){
        const userId = getUserId(request, false);
        let opArgs = {}
        let queryFields = gprf({info, dbRelationalFields, type:"select"}) 
      
        opArgs.select = queryFields.select
        opArgs.where= {id, OR:[{authorId: userId}, {published: true}]}
        let res
       await prisma.post.findMany(opArgs)
      
        .then((data)=> {res=data})
        .catch((e)=>{throw new GraphQLError("Something isn't as it should")})
         
        
        return res.length>0 ? res[0] : {}
    
    },
    async comments(parent, args, ctx, info){
     let {prisma, gprf, dbRelationalFields} = ctx
     
     let opArgs = {}
     
     if(args.query){
        opArgs.where = {
           
             text: {
                    contains: args.query
                }
            }   
    }       
    let queryFields = gprf({info, dbRelationalFields, type:"select"})
     
    opArgs.select = queryFields.select
    let comments = await prisma.comment.findMany(opArgs);
    return comments
    },
    async links(parent, args, ctx, info){
        let {prisma, gprf, dbRelationalFields} = ctx
     
     let opArgs = {}
     
     if(args.query){
        opArgs.where = {
           
             name:   {
                    contains: args.query
                }
            }   
    }       

    let queryFields = gprf({info, dbRelationalFields, type:"select"})
     
    opArgs.select = queryFields.select
    let links = await prisma.link.findMany(opArgs);
    return links
    }
    
    
 }


 export {Query as default}