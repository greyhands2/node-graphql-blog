import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
const getClient = (jwt='') => { 
    let uri = 'http://localhost:4000/graphql'
    let httpLink = createHttpLink({uri})
    const authLink = setContext((_, {headers})=>{
        return {
            headers:{
                ...headers,
                authorization: jwt ? `Bearer ${jwt}` : ''
            }
        }
    })

    return new ApolloClient({
        link: authLink.concat(httpLink),
        cache: new InMemoryCache(),
        request(operation){
            if(!!jwt === true){
                
                operation.setContext({headers: {authorization: `Bearer ${jwt}`}})
            }
            
        }
    })

}


export {getClient as default}