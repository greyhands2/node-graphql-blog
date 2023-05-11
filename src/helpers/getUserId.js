import {GraphQLError} from 'graphql'
import jwt from 'jsonwebtoken'
const getUserId = (request, requireAuth=true) => {
    //using the map get function
    const header = request.headers.get('authorization')
    if(header){
        const token = header.replace('Bearer ', '')
    
        const decoded = jwt.verify(token, process.env.JWT_TOKEN)
    
        return decoded.userId
    } 
    if(requireAuth) {
        throw new GraphQLError("Authentication required")
    }
    

    return undefined
}



export {getUserId as default}