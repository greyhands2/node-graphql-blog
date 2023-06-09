import 'cross-fetch/polyfill'
import React from 'react';
import ReactDOM from 'react-dom';
import bcrypt from 'bcryptjs'
import { gql } from '@apollo/client';
import PrismaContext from '../src/prismaContext'
import { v4 as uuidv4 } from 'uuid';
import seedDatabase, {userOne, userTwo} from './utils/seedDatabase'
import getClient from './utils/getClient'
import {deleteComment} from './utils/comment-operations'
const client = getClient();

beforeEach(seedDatabase)

test('should delete own comment', async() => {
    console.log(userOne, userTwo)
    const client = getClient(userOne.jwt)

    const variables = {
        id: userTwo.comments[0]["id"],
        postId: userTwo.posts[0]["id"]  
    }

    const {data} = await client.mutate({mutation: deleteComment, variables})

    expect(data.deleteComment.author.id).toBe(userOne.user.id)

})



test('should not delete other users comments', async()=>{
    const client = getClient(userOne.jwt)

    const variables = {
        id: userOne.comments[0]["id"],
        postId: userOne.posts[0]["id"]  
    }

    
    await expect(client.mutate({mutation: deleteComment, variables})).rejects.toThrow()

})




