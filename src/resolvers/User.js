import getUserId from '../helpers/getUserId'
//basically a middleware for the user resolvers
const User = {
 email: {
     
     resolve(parent, args, {request}, info){
        let result
          
          const userId = getUserId(request, false)
         
          if(userId && userId === parent.id){
              
              result = parent.email
          } else result= null
      
         
          return result
     } 
 },
 
 id: {
    resolve(parent, args, ctx, info){
        
        if(ctx.wasIdInduced){
           
            ctx.wasIdInduced = false;
            return undefined
          }
         
         return parent.id 
    }
 },

 posts: {
    resolve({posts}, args, {request}, info){
        const userId = getUserId(request, false)
        console.log(userId)
        if(posts && Array.isArray(posts) && posts.length > 0){
            return posts.filter((post) => (userId ? (post.authorId.toString() === userId.toString() || post.published === true) : (post.published === true)))

        }

        return []
        
    }
 },
}


export { User as default}