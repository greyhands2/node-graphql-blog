import {GraphQLError} from 'graphql'
const Subscription = {
   
    comment: {
        subscribe(parent, args, ctx, info){
            let {postId} = args
            let {db, pubsub} = ctx
            let post = db.posts.find((post) => post.id === postId)
            if(!post) throw new GraphQLError("post not found")

            return pubsub.subscribe(`comment:${postId}`) //comment:44 e.g
        }
    },
    post: {
        subscribe(parent, args, ctx, info){
            return ctx.pubsub.subscribe('post')
        }
    }
}

export {Subscription as default}