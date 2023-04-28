import { v4 as uuidv4 } from 'uuid';
import {GraphQLError} from 'graphql'

const Mutation = {
    async createUser(parent, args, ctx, info){
        let {prisma, gprf,dbRelationalFields} = ctx
        const emailTaken = await prisma.user.findUnique({
            where:{email: args.data.email}
        })
        if(emailTaken) throw new GraphQLError("Email is already in use")

        const data = {
            id: uuidv4(),
            ...args.data
        }
        let opArgs = {}

        let queryFields = gprf({info, dbRelationalFields, type:"select"})
     
        opArgs.select = queryFields.select

        let newUser = await prisma.user.create({data, ...opArgs});
        
        return newUser;
    },
    async deleteUser(parent, args, ctx, info){
        if(!args.id) throw new GraphQLError("User Id Must Be Provided")
        let {prisma} = ctx
        let res
        await prisma.user.delete({where: {id:args.id}})
        .then((data)=> [res=data])
        .catch((err)=> {throw new GraphQLError("Something isn't as it should")})

        

       return res

    },
    async updateUser(parent, args, ctx, info){
       //check if user exist
      let res
       let {id, data} = args
       let {prisma, dbRelationalFields, gprf} = ctx
       if(!data || !data.email && !data.age && !data.name) throw new GraphQLError("Invalid user update data") 
       let opArgs = {}

       let queryFields = gprf({info, dbRelationalFields, type:"select"})
    
       opArgs.select = queryFields.select

       await prisma.user.update({where:{
            id
       }, data}, opArgs)
       .then((data)=>{
        res = data
       })
       .catch((e)=>{
        throw new GraphQLError("Something isn't as it should")
       })
       
       return res;
        
    },

    async createPost(parent, args, ctx, info){
        let {prisma, gprf, dbRelationalFields} = ctx
        let { authorId} = args.data
        const userExists = await prisma.user.findUnique({
            where:{id: authorId}
        })
        

        if(!userExists) throw new GraphQLError("User does not exist")
        const id = uuidv4()
        const data = {
            id,
            updateCheckField: `${id}${authorId}`,
            ...args.data
        }

        let opArgs = {}

        let queryFields = gprf({info, dbRelationalFields, type:"select"})
     
        opArgs.select = queryFields.select

        let newPost = await prisma.post.create({data, ...opArgs});
        
        if(newPost.published === true) ctx.pubsub.publish('post', {
            post:{
                mutation: 'CREATED',
                data:newPost
            }
            
        })
        return newPost
    },
    async deletePost(parent, {id, authorId}, {prisma,pubsub}, info){
        let res
        await prisma.post.delete({
            where: {
                updateCheckField: `${id}${authorId}`
              
            },
          })
        .then((data) => {res=data})
        .catch((err) => {throw new GraphQLError("Something isn't as it should")})

        if(res.published === true){
            pubsub.publish('post', {
                post: {
                   mutation: 'DELETED',
                   data: res 
                }
            })      
        }
        
        return res
    },

    async updatePost(parent, {id, authorId, data}, {prisma, pubsub, gprf, dbRelationalFields}, info){
        
        if(!data || !data.title && !data.body && !data.published) throw new GraphQLError("Invalid post data")
        let res
        let opArgs = {}

        let queryFields = gprf({info, dbRelationalFields, type:"select"})
        console.log(queryFields)
        opArgs.select = queryFields.select
        opArgs.where = {
            updateCheckField: `${id}${authorId}`             
        }

        opArgs.data = {
            ...data
        }
        
        await prisma.post.update(opArgs)
        .then((data)=> {res = data})
        .catch((e)=> {console.log('errah!!!!!!', e);throw new GraphQLError("Something isn't as it should")})
        //find user
        


       


        // if(typeof data.published === 'boolean'){
        //     post.published = data.published
        //     if(originalPost.published === true && post.published === false){
        //        //deleted event 
        //        pubsub.publish('post', {
        //         post: {
        //             mutation: 'DELETED',
        //             data: originalPost
        //         }
        //        })
        //     } else if(originalPost.published === false && post.published === true){
        //         //created event
        //         pubsub.publish('post', {
        //             post: {
        //                 mutation: 'CREATED',
        //                 data: post
        //             }
        //            })
        //     }
        // } else if(post.published === true){
        //     //updated
        //     pubsub.publish('post', {
        //         post: {
        //             mutation: 'UPDATED',
        //             data: post
        //         }
        //        })
        // }
        console.log(data)
        return res
    },

    async createComment(parent, args, {prisma}, info){
        let {authorId, postId} = args.data
        let {pubsub, dbRelationalFields, gprf} = ctx
        let userExist = await prisma.user.findUnique({where:{id: authorId}})
        let postExist = await prisma.post.findUnique({where: {id: postId}})
        

        if(!userExist) throw new GraphQLError("This user does not exist")

        if(!postExist) throw new GraphQLError("The post specified does not exist")

        const id = uuidv4()

        let data = {
            id,
            updateCheckField: `${id}${authorId}${postId}`,
            ...args.data
        }

        let opArgs = {}
        let queryFields = gprf({info, dbRelationalFields, type:"select"})
        opArgs.select = queryFields.select
        let newComment = await prisma.comment.create({data, ...opArgs})
        
        pubsub.publish(`comment:${post}`, {
            comment: {
                mutation: 'CREATED',
                data: newComment
            }
            
        })
        return newComment
    },
    async deleteComment(parent, {id, authorId, postId}, {pubsub, prisma}, info){
        
       let res 

       await prisma.comment.delete({where: {updateCheckField: `${id}${authorId}${postId}`}})
       .then((data) => {res=data})
       .catch((e)=> {throw new GraphQLError("Something isn't as it should")}) 

       pubsub.publish(`comment:${res.post}`, {
        comment: {
            mutation: 'DELETED',
            data: res
        }
       })

       return res

    },
    async updateComment(parent, {id, authorId, postId, data}, {prisma, dbRelationalFields, gprf, pubsub}, info){
        
        if(!data || !data.text) throw new GraphQLError("Invalid comment data")
        let res
        let opArgs = {}

        let queryFields = gprf({info, dbRelationalFields, type:"select"})
     
        opArgs.select = queryFields.select
        opArgs.where = {
            updateCheckField: `${id}${authorId}${postId}`           
        }

        opArgs.data = {
            ...data
        }
        await prisma.comment.update(opArgs)
        .then((data) => {res=data})
        .catch((e)=>{throw new GraphQLError("Something isn't as it should")})

        pubsub.publish(`comment:${post}`, {
            comment: {
              mutation: 'UPDATED',
              data: res  
            }
        })
        return res
    },
    async createLink(parent, args, ctx, info){
        let {userId } = args.data
        let {dbRelationalFields, prisma, gprf} = ctx
        let res
        let userExist = await prisma.user.findUnique({where:{userId}})
        if(!userExist) throw new GraphQLError("This user does not exist")
        const id = uuidv4()
        let data = {
            id,
            updateCheckField: `${id}${userId}`,
            ...args.data
        }
        let opArgs = {}
        
        let queryFields = gprf({info, dbRelationalFields, type:"select"})
        opArgs.select = queryFields.select
        
        await prisma.link.create({data, ...opArgs})
        .then((data)=>{res=data})
        .catch((e)=>{throw new GraphQLError("Something isn't as it should")})
        return res

        
    }, 
    async deleteLink(parent, {id, userId}, {prisma}, info){
        let res
        await prisma.link.delete({where:{updateCheckField: `${id}${userId}`}})
        .then((data)=>{res=data})
        .catch((e)=>{throw new GraphQLError("Something isn't as it should")}) 
        return res
    },
    async updateLink(parent, {id, userId, data}, {prisma, gprf, dbRelationalFields}, info){
        let res
        let opArgs = {}

        let queryFields = gprf({info, dbRelationalFields, type:"select"})
     
        opArgs.select = queryFields.select
        opArgs.where = {
            updateCheckField: `${id}${userId}` 
        }
        opArgs.data= {
            ...data
        }

        await prisma.link.update(opArgs)
        .then((data)=>{res=data})
        .catch((e)=>{throw new GraphQLError("Something isn't as it should")})
        return res
    }
}


export { Mutation as default}