import 'cross-fetch/polyfill'
import React from 'react';
import ReactDOM from 'react-dom';
import bcrypt from 'bcryptjs'
import { gql } from '@apollo/client';
import PrismaContext from '../src/prismaContext'
import { v4 as uuidv4 } from 'uuid';
import seedDatabase, {userOne, userTwo} from './utils/seedDatabase'
import getClient from './utils/getClient'
import {getPosts, myPosts, updatePost, createPost, deletePost} from './utils/post-operations'
const client = getClient();

beforeEach(seedDatabase)
test('fetch only published posts', async ()=>{
   
  
    const results = await client.query({
      query: getPosts
    })
    
    
    expect(results.data.posts.length > 0)
  .toBeTruthy()
  
  expect(results.data.posts[0].published).toBe(true)
  })




  test('should return my posts', async()=>{
    const client = getClient(userOne.jwt)

    
    const {data} = await client.query({query: myPosts})
    
    expect(data.myPosts[0].author.name).toBe(userOne.user.name)
    expect(data.myPosts[0].author.email).toBe(userOne.user.email)
    expect(data.myPosts[0].author.id).toBe(userOne.user.id)
  })


  test('should be able to update own post',  async()=>{
    const client = getClient(userOne.jwt)
   
    let postId = userOne.posts[0]["id"]
    const variables = {
      id: postId, 
      data: {
        title: "some mad hope"
      }
    }



    let result = await client.mutate({mutation: updatePost, variables})


    expect(result.data.updatePost.author.id).toBe(userOne.user.id)
    expect(result.data.updatePost.title).toBe("some mad hope")
  })



  test('should allow only an authenticated user to create a post', async()=>{
    const client = getClient(userOne.jwt)

    const variables = {
      data: {
        title: "The Italian Job",
        body: "One of the best heist movies yet",
        published: true
      }
      
    }
    const result = await client.mutate({mutation: createPost, variables})

    expect(result.data.createPost.author.id).toBe(userOne.user.id)
    expect(result.data.createPost.title).toBe("The Italian Job")

  })


  test('should allow a user delete own post', async()=>{
    const client = getClient(userOne.jwt)
    const postId = userOne.posts[0]["id"]
    const variables = {
      id: postId
    }
    const {data} = await client.mutate({mutation: deletePost, variables})
    expect(data.deletePost.id).toBe(postId)
    expect(data.deletePost.author.id).toBe(userOne.user.id)

   
    let deletedPost = await await PrismaContext.post.findUnique({where:{id: postId}})
    await expect(deletedPost).toBe(null)

  })