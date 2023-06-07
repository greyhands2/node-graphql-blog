import 'cross-fetch/polyfill'
import React from 'react';
import ReactDOM from 'react-dom';
import bcrypt from 'bcryptjs'
import { gql } from '@apollo/client';

import { v4 as uuidv4 } from 'uuid';
import seedDatabase, {userOne} from './utils/seedDatabase'
import getClient from './utils/getClient'

const client = getClient();

beforeEach(seedDatabase)
test('fetch only published posts', async ()=>{
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
  
    const results = await client.query({
      query: getPosts
    })
    
    
    expect(results.data.posts.length > 0)
  .toBeTruthy()
  
  expect(results.data.posts[0].published).toBe(true)
  })




  test('should return my posts', async()=>{
    const client = getClient(userOne.jwt)

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
    const {data} = await client.query({query: myPosts})
    
    expect(data.myPosts[0].author.name).toBe(userOne.user.name)
    expect(data.myPosts[0].author.email).toBe(userOne.user.email)
    expect(data.myPosts[0].author.id).toBe(userOne.user.id)
  })


  test('should be able to update own post',  async()=>{
    const client = getClient(userOne.jwt)
   
    let postId = userOne.posts[0]["id"]
    const updatePost = gql`
    mutation UpdatePost {
      updatePost(id: "${postId}", data: {
        title: "some mad hope"
      }) {
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



    let result = await client.mutate({mutation: updatePost})


    expect(result.data.updatePost.author.id).toBe(userOne.user.id)
    expect(result.data.updatePost.title).toBe("some mad hope")
  })



  test('should allow only an authenticated user to create a post', async()=>{
    const client = getClient(userOne.jwt)
    const createPost = gql`
    mutation createPost {
      createPost(data:{title: "The Italian Job", body: "One of the best heist movies yet", published: true}){
        title
        id
        body
        author {
          
          id
        }
      }
    }
    
    `

    const result = await client.mutate({mutation: createPost})

    expect(result.data.createPost.author.id).toBe(userOne.user.id)
    expect(result.data.createPost.title).toBe("The Italian Job")

  })


  test('should allow a user delete own post', async()=>{
    
  })