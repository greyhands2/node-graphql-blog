import {gql } from '@apollo/client';




const deleteComment = gql`
mutation deleteComment($id: ID!, $postId: ID!){
    deleteComment(id: $id, postId: $postId){
        id
        text
        author {
            id
        }
        post {
            id
        }

    }

}
`

export {deleteComment}
