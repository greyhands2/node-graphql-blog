import {GraphQLError} from 'graphql'
import getUserId from '../helpers/getUserId'
const applyTakeConstraints = ({
    min,
    max,
    value,
  }) => {
    if (value < min || value > max) {
      throw new GraphQLError(
        `'take' argument value '${value}' is outside the valid range of '${min}' to '${max}'.`
      )
    }
    return value
  }
const applySkipConstraints = ({

}) => {
    
}
const Query = {
       
    async users(parent, {query, skip, take, cursor, orderBy}, ctx, info){
        
    const userId = getUserId(ctx.request, false)
    let selectionsArr, idFieldExists 
    if(userId){
          
        selectionsArr = info.fieldNodes[0].selectionSet.selections;
        idFieldExists = selectionsArr.some((selection) => selection.name.value === 'id');
        
           
            if(!idFieldExists ) {
                    
                 
                selectionsArr.push({
                    kind: 'Field',
                    name: { kind: 'Name', value: 'id' },
                })
                console.log('hi')
                ctx.wasIdInduced = true 
            } 
        
            
    }     
           
     let {prisma, gprf, dbRelationalFields} = ctx;
     let opArgs = {}
      if(query){
        opArgs.where = {
            OR: [
                {
                    name:{
                        contains: query
                    }
                },
                {
                    email: {
                        contains: query
                    }
                } 

            ]
             
        }

        
      } 
   
     //for the second arguement in the prisma query you can provide, nothing/null just that this would provide only scalar fields and no relational fields... or a string which selects the fields we want to return but this is nit always good because we at this point of writing the code would not know the exact fields a client's query needs... or an object where we pass in the info object and it contains all the information about the request's operation, so this way if the client asked for only some scalar fields or relational fields or whatever, the query can fetch em and return
     //
     
     let queryFields = gprf({info, dbRelationalFields, type:"select"})
     
     opArgs.select = queryFields.select
     take = applyTakeConstraints({
        min: 1,
        max: 5,
        value: take ? take : 5
      })
     opArgs.skip = skip
     opArgs.take = take
    if(cursor) [opArgs.cursor  = {id: cursor}]
    if(orderBy) [opArgs.orderBy= orderBy]  
     let users = await prisma.user.findMany(opArgs)
         
     if(userId && ctx.wasIdInduced ) selectionsArr.pop()
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
    async posts(parent, {query, skip, take, cursor, orderBy}, ctx, info){
        let {prisma, gprf, dbRelationalFields} = ctx
       
        
        let opArgs = {}
        opArgs.where={published: true}
        if(query){
            opArgs.where.OR = [
                    {
                        title:{
                            contains: query
                        }
                    },
                    {
                        body: {
                            contains: query
                        }
                    }
                ]
            
        }
    let queryFields = gprf({info, dbRelationalFields, type:"select"})
    
     opArgs.select = queryFields.select
     take = applyTakeConstraints({
        min: 1,
        max: 5,
        value: take ? take : 5
      })
     opArgs.skip = skip
     opArgs.take = take
     if(cursor) [opArgs.cursor  = {id: cursor}]
     if(orderBy) [opArgs.orderBy= orderBy] 
    let posts = await prisma.post.findMany(opArgs)
        console.log('posters', posts)
    return posts
    },
    async myPosts(parent, {query, skip, take, cursor, orderBy}, {prisma, request, dbRelationalFields, gprf}, info){
        const userId = getUserId(request)
        let opArgs={}, res
        opArgs.where={authorId:userId}
        if(query){
            opArgs.where.OR = [
                    {
                        title:{
                            contains: query
                        }
                    },
                    {
                        body: {
                            contains: query
                        }
                    }
                ]
            
        }
        let queryFields = gprf({info, dbRelationalFields, type:"select"}) 
      
        opArgs.select = queryFields.select
        opArgs.select = queryFields.select
     take = applyTakeConstraints({
        min: 1,
        max: 5,
        value: take ? take : 5
      })
     opArgs.skip = skip
     opArgs.take = take
     if(cursor) [opArgs.cursor  = {id: cursor}]
     if(orderBy) [opArgs.orderBy= orderBy] 
        await prisma.post.findMany(opArgs)
        .then((data)=>{res=data})
        .catch((e)=>{throw new GraphQLError("Something isn't as it should")})
        return res
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
    async comments(parent, {query, skip, take, cursor, orderBy}, ctx, info){
     let {prisma, gprf, dbRelationalFields} = ctx
     
     let opArgs = {}
     
     if(query){
        opArgs.where = {
           
             text: {
                    contains: query
                }
            }   
    }       
    let queryFields = gprf({info, dbRelationalFields, type:"select"})
     
    opArgs.select = queryFields.select
    take = applyTakeConstraints({
        min: 1,
        max: 5,
        value: take ? take : 5
      })
     opArgs.skip = skip
     opArgs.take = take
     if(cursor) [opArgs.cursor  = {id: cursor}]
     if(orderBy) [opArgs.orderBy= orderBy] 
    let comments = await prisma.comment.findMany(opArgs);
    return comments
    },
    async links(parent, {query, skip, take, cursor, orderBy}, ctx, info){
        let {prisma, gprf, dbRelationalFields} = ctx
     
     let opArgs = {}
     
     if(query){
        opArgs.where = {
           
             name:   {
                    contains: query
                }
            }   
    }       

    let queryFields = gprf({info, dbRelationalFields, type:"select"})
     
    opArgs.select = queryFields.select
    take = applyTakeConstraints({
        min: 1,
        max: 5,
        value: take ? take : 5
      })
     opArgs.skip = skip
     opArgs.take = take
     if(cursor) [opArgs.cursor  = {id: cursor}]
     if(orderBy) [opArgs.orderBy= orderBy] 
    let links = await prisma.link.findMany(opArgs);
    return links
    }
    
    
 }


 export {Query as default}