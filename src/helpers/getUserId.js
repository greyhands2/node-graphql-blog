import {GraphQLError} from 'graphql'
import jwt from 'jsonwebtoken'
const getUserId = (request) => {
    //using the map get function
    const header = request.headers.get('authorization')
    if(!header) throw new GraphQLError("Authentication required")

    const token = header.replace('Bearer ', '')
    
    const decoded = jwt.verify(token, process.env.JWT_TOKEN)
    
    return decoded.userId
}



export {getUserId as default}