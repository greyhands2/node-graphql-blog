import {GraphQLError} from 'graphql'
import getUserId from '../helpers/getUserId'
const Subscription = {
   //using prisma native subscriptions
    comment: {
        async subscribe(parent, {postId}, {prisma, pubsub, request}, info){
            const authorId = getUserId(request)
            let res
            await prisma.post.findUnique({where:{updateCheckField: `${postId}${authorId}`}})
            .then((data)=>{ res=data})
            .catch((e)=>{ throw new GraphQLError("Something is not as it should be")})
            

            //return pubsub.asyncIterator(`comment:${postId}`)
            return pubsub.subscribe(`comment:${postId}`)


        }
    },
    post: {
        subscribe(parent, args, {pubsub}, info){
            //return pubsub.asyncIterator('post')
            return pubsub.subscribe('post')
        }
    }
}

export {Subscription as default}