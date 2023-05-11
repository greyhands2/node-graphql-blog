import { v4 as uuidv4 } from 'uuid';
import {GraphQLError} from 'graphql'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import getUserId from '../helpers/getUserId'
const Mutation = {
    async createUser(parent, args, ctx, info){
        if(args.data.password.length < 8) throw new GraphQLError("Password must be 8 characters or longer")

        const password = await bcrypt.hash(args.data.password, 10)
        let {prisma, gprf,dbRelationalFields} = ctx
        const emailTaken = await prisma.user.findUnique({
            where:{email: args.data.email}
        })
        if(emailTaken) throw new GraphQLError("Email is already in use")

        const data = {
            id: uuidv4(),
            ...args.data,
            password
        }
        let opArgs = {}

        let queryFields = gprf({info, dbRelationalFields, type:"select"})
     
        opArgs.select = queryFields.select

        let newUser = await prisma.user.create({data});
        
        return {
            user:newUser,
            token: jwt.sign({userId: newUser.id}, process.env.JWT_TOKEN)
        }
    },
    async login(parent, {email, password}, {prisma}, info){
        if(!email || !password) throw new GraphQLError("Email and Password are required")
        
        let user = await prisma.user.findUnique({where:{email: email}})
        if(!user) throw new GraphQLError("Something isn't as it should")
        console.log('user', user)
        let didPasswordMatch = await bcrypt.compare(password, user.password)
        if(!didPasswordMatch) throw new GraphQLError("Something isn't as it should")
        
        return {
            user,
            token: jwt.sign({userId: user.id}, process.env.JWT_TOKEN )
        }
    },
    async deleteUser(parent, args, ctx, info){

       
        let {prisma, request} = ctx
        const userId = getUserId(request)
        let res
        await prisma.user.delete({where: {id:userId}})
        .then((data)=> [res=data])
        .catch((err)=> {throw new GraphQLError("Something isn't as it should")})

        

       return res

    },
    async updateUser(parent, args, ctx, info){
       //check if user exist
      let res
       let {data} = args
       let {prisma, dbRelationalFields, gprf, request} = ctx
       const userId = getUserId(request)
       if(!data || !data.email && !data.age && !data.name) throw new GraphQLError("Invalid user update data") 
       let opArgs = {}

       let queryFields = gprf({info, dbRelationalFields, type:"select"})
    
       opArgs.select = queryFields.select

       await prisma.user.update({where:{
            id: userId
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
        let {prisma, request} = ctx
        const userId = getUserId(request)
        console.log('userid', userId)
        let { title, body, published} = args.data
        const userExists = await prisma.user.findUnique({
            where:{id: userId}
        })
        

        if(!userExists) throw new GraphQLError("User does not exist")
        const id = uuidv4()
        const data = {
            id,
            updateCheckField: `${id}${userId}`,
            title,
            body,
            published,
            author: {
                connect:{
                    id: userId
                }
            }
        }
        
       
        
        let newPost
        await prisma.post.create({data, include:{author: true}})
        .then((data)=>{newPost=data})
        .catch((e)=>{throw new GraphQLError("Something isn't as it should")})
        if(newPost.published === true) ctx.pubsub.publish('post', {
            post:{
                mutation: 'CREATED',
                data:newPost
            }
            
        })

        
        return newPost
    },
    async deletePost(parent, {id}, {prisma,pubsub, request}, info){
        const userId = getUserId(request)
        let res
        await prisma.post.delete({
            where: {
                updateCheckField: `${id}${userId}`
              
            },
            include:{
                author: true
            }
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

    async updatePost(parent, {id, data}, {prisma, pubsub, request}, info){
        
        if(!data || !data.title && !data.body && !data.published) throw new GraphQLError("Invalid post data")
        const userId = getUserId(request)
        let updatedPost
        let opArgs = {}

        
        opArgs.include = {author: true}
        opArgs.where = {
            updateCheckField: `${id}${userId}`             
        }

        opArgs.data = {
            ...data
        }
        
        await prisma.post.update(opArgs)
        .then((data)=> {updatedPost = data})
        .catch((e)=> {throw new GraphQLError("Something isn't as it should")})
        
        pubsub.publish('post', {
            post: {
               mutation: 'UPDATED',
               data: updatedPost 
            }
        }) 
        return updatedPost
    },

    async createComment(parent, args, {prisma, pubsub, request}, info){
        let {postId, text} = args.data
        const userId = getUserId(request)
        let userExist = await prisma.user.findUnique({where:{id: userId}})
        let postExist = await prisma.post.findUnique({where: {id: postId}})
        

        if(!userExist) throw new GraphQLError("This user does not exist")

        if(!postExist) throw new GraphQLError("The post specified does not exist")

        const id = uuidv4()
        
        let data = {
            id,
            updateCheckField: `${id}${userId}${postId}`,
            
            text,
            
            author:{
                connect: {
                    id: userId
                }
            }, 
            post: {
                connect:{
                    id: postId
                }
            },
            
        }
        

        // because of our subscription notification we would return complete comment data include relational fields to both the comment create event and also the create Comment request allowing graphql to sort our the fields they would both request for
        let newComment
        await prisma.comment.create({data, include:{ post: true, author: true}})
        .then((data)=>{ newComment = data})
        .catch((e)=>{ throw new GraphQLError("Something isn't as it should")})
        console.log(newComment);
        pubsub.publish(`comment:${postId}`, {
            comment:{
                mutation: 'CREATED',
                data: newComment
            }
        })
        
        return newComment
    },
    async deleteComment(parent, {id, postId}, {pubsub, prisma, request}, info){
        const userId = getUserId(request)
       let res 

       await prisma.comment.delete({where: {updateCheckField: `${id}${userId}${postId}`}, include:{author: true, post: true}})
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
    async updateComment(parent, {id, postId, data}, {prisma, dbRelationalFields, gprf, pubsub, request}, info){
        
        if(!data || !data.text) throw new GraphQLError("Invalid comment data")
        let res
        let opArgs = {}
        const userId = getUserId(request)
        // because of our subscription notification we would return complete comment data include relational fields to both the comment create event and also the create Comment request allowing graphql to sort our the fields they would both request for
        opArgs.include = {
            post: true,
            author: true
        }
        opArgs.where = {
            updateCheckField: `${id}${userId}${postId}`           
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
        const userId = getUserId(request)
        let {dbRelationalFields, prisma, gprf, request} = ctx
        let res
        let userExist = await prisma.user.findUnique({where:{userId}})
        if(!userExist) throw new GraphQLError("This user does not exist")
        const id = uuidv4()
        let data = {
            id,
            updateCheckField: `${id}${userId}`,
            userId,
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
    async deleteLink(parent, {id}, {prisma, request}, info){
        let res
        const userId = getUserId(request)
        await prisma.link.delete({where:{updateCheckField: `${id}${userId}`}})
        .then((data)=>{res=data})
        .catch((e)=>{throw new GraphQLError("Something isn't as it should")}) 
        return res
    },
    async updateLink(parent, {id, data}, {prisma, gprf, dbRelationalFields, request}, info){
        let res
        let opArgs = {}
        const userId = getUserId(request)
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