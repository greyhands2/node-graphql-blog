import {gql } from '@apollo/client';



const getPosts = gql`
query getPosts {
  posts {
    title
    id
    body
    published
  }
}

`

const myPosts = gql`
    query Posts {
        myPosts {
            title
            body
            published
            author {
                name
                email
                id
            }
        }
    }
    
`

const updatePost = gql`
mutation UpdatePost($id: ID!, $data: UpdatePostInput) {
  updatePost(id: $id, data: $data) {
    title
    body
    author {
        name
        email
        id
    }
  }
}
`;





const createPost = gql`
mutation createPost($data: CreatePostInput) {
  createPost(data: $data){
    title
    id
    body
    author {
      
      id
    }
  }
}

`



const deletePost = gql`
    mutation deletePost($id: ID!) {
      deletePost(id: $id){
        id
        author {
          id
        }
      }
    }
    
    `

export {getPosts, myPosts, updatePost, createPost, deletePost}

