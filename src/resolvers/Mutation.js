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

        const data = {
            id: uuidv4(),
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
    deletePost(parent, {id}, {pubsub, prisma, dbRelationalFields, gprf}, info){
        
        const postIndex = db.posts.findIndex((post) => post.id === args.id)
        if(postIndex === -1) throw new GraphQLError("Post does not exist")
        //delete post
        let [deletedPost] = db.posts.splice(postIndex, 1);
        //remove comments under post
        db.comments = db.comments.filter((comment) => comment.post !== args.id)

        if(deletedPost.published === true){
            pubsub.publish('post', {
                post: {
                   mutation: 'DELETED',
                   data: deletedPost 
                }
            })
        }
        return deletedPost
    },

    updatePost(parent, args, ctx, info){
        let {id, author, data} = args
        if(!data || !data.title && !data.body && !data.published) throw new GraphQLError("Invalid post data")
        let {users, posts} = ctx.db
        
        //find user
        let user = users.find((user) => user.id === author)
        if(!user) throw new GraphQLError("User not found")

        //check if post exist
        let post = posts.find((post) => post.id === id)
        const originalPost = {...post}
        if(!post) throw new GraphQLError("Post not found")
        //if user was found check if the user is the author of the post cos only the author can update it
        if(post.author !== author) throw new GraphQLError("The user provided is not permitted to edit this post")


        if(typeof data.title === 'string'){
            post.title = data.title
        }

        if(typeof data.body === 'string') {
            post.body = data.body
        }


        if(typeof data.published === 'boolean'){
            post.published = data.published
            if(originalPost.published=== true && post.published === false){
               //deleted event 
               pubsub.publish('post', {
                post: {
                    mutation: 'DELETED',
                    data: originalPost
                }
               })
            } else if(originalPost.published === false && post.published === true){
                //created event
                pubsub.publish('post', {
                    post: {
                        mutation: 'CREATED',
                        data: post
                    }
                   })
            }
        } else if(post.published === true){
            //updated
            pubsub.publish('post', {
                post: {
                    mutation: 'UPDATED',
                    data: post
                }
               })
        }

        return post
    },

    async createComment(parent, args, {prisma}, info){
        let {author, post} = args.data
        let {pubsub, dbRelationalFields, gprf} = ctx
        let userExist = await prisma.user.findUnique({where:{id: author}})
        let postExist = await prisma.post.findUnique({where: {id: post}})
        

        if(!userExist) throw new GraphQLError("This user does not exist")

        if(!postExist) throw new GraphQLError("The post specified does not exist")


        let data = {
            id: uuidv4(),
            ...args.data
        }

        let opArgs = {}
        let queryFields = gprfgprf({info, dbRelationalFields, type:"select"})
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
    deleteComment(parent, args, ctx, info){
       let {db, pubsub} = ctx
       let commentIndex = db.comments.findIndex((comment) => comment.id === args.id) 
       if(commentIndex === -1) throw new GraphQLError("Comment not found")

       let [deletedComment] = db.comments.splice(commentIndex, 1);

       pubsub.publish(`comment:${deletedComment.post}`, {
        comment: {
            mutation: 'DELETED',
            data: deletedComment
        }
       })

       return deletedComment

    },
    updateComment(parent, args, ctx, info){
        let {id, author, post, data} = args
        if(!data || !data.text) throw new GraphQLError("Invalid comment data")
        let {db:{users, posts, comments}, pubsub} = ctx
        
        //check if user exist
        let user = users.find((user) => user.id === author)
        if(!user) throw new GraphQLError("User does not exist")

        //check if post exists
        let postExist = posts.find((currentPost) => currentPost.id === post)
        if(!postExist) throw new GraphQLError("Post does not exist")

        //check if comment exist
        let comment = comments.find((comment) => comment.id === id)

        if(!comment) throw new GraphQLError("Comment does not exist")

        //if user was found check if the user is the author of the comment cos only the author can update it

        if(comment.author !== author) throw new GraphQLError("The user provided is not permitted to edit this comment")

        if(typeof data.text === 'string'){
            comment.text = data.text
        }

        pubsub.publish(`comment:${post}`, {
            comment: {
              mutation: 'UPDATED',
              data: comment  
            }
        })
        return comment
    },
    async createLink(parent, args, ctx, info){
        let {userId } = args.data
        let {dbRelationalFields, prisma, gprf} = ctx

        let userExist = await prisma.user.findUnique({where:{userId}})
        if(!userExist) throw new GraphQLError("This user does not exist")
        let data = {
            id: uuidv4(),
            ...args.data
        }
        let opArgs = {}
        
        let queryFields = gprf({info, dbRelationalFields, type:"select"})
        opArgs.select = queryFields.select
        
        let newLink = await prisma.link.create({data, ...opArgs})
       
        return newLink

        
    }, 
    deleteLink(){
        return {}
    },
    updateLink(){
        return {}
    }
}


export { Mutation as default}