


const Query = {
       
    async users(parent, args, ctx, info){
     let {prisma, gprf, dbRelationalFields} = ctx;
     let opArgs = {}
      if(args.query){
        opArgs.where = {
            OR:[
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
    
    me(){
     return {
         id: "das7y87dasdas1121",
         name: "Osas",
         email: "osas@gmail.com",
         age:33
     }
    },
    async posts(parent, args, ctx, info){
        let {prisma, gprf, dbRelationalFields} = ctx
       
        
        let opArgs = {}
       
        if(args.query){
            opArgs.where = {
                OR: [
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
        }
    let queryFields = gprf({info, dbRelationalFields, type:"select"})
     
     opArgs.select = queryFields.select
    let posts = await prisma.post.findMany(opArgs)
   
    return posts
    }, 
    post(){
     return {
         id: "wer234e2323",
         title: "Uncle Gazpacho",
         body: "Yeah the boys at the marine like to call this one uncle Gazpacho, I call it the ex wife, capable of reducing the population of every standing structure to zero",
         published: false
     }
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