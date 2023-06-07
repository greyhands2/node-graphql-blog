import 'cross-fetch/polyfill'
import React from 'react';
import ReactDOM from 'react-dom';
import bcrypt from 'bcryptjs'
import {gql } from '@apollo/client';
import PrismaContext from '../src/prismaContext'
import { v4 as uuidv4 } from 'uuid';
import seedDatabase, {userOne} from './utils/seedDatabase'
import getClient from './utils/getClient'
const client = getClient();


beforeEach(seedDatabase)


test('should create a new user', async()=>{

    
   
    const createUser = gql`
    mutation CreateUser {
      createUser(data: {
        email: "fony@outlook.com",
        name: "fony",
        password: "test1234"
      }) {
        token
        user {
          id
          name
          email
        }
      }
    }
  `;


const result = await client.mutate({
    mutation: createUser
})

let exists = await PrismaContext.user.findUnique({where:{id: result.data.createUser.user.id}})

expect(JSON.stringify(exists)).not.toBe('{}')


})

  
test('should not login with bad credentials', async () => {
  
    
  
  const login = gql`
  mutation User {
    login(email: "tana@examp.com", password: "543rtt") {
      token
      user {
        id
        name
        email
      }
    }
  }
  `;
  
    await expect(client.mutate({mutation: login})).rejects.toThrow()
  
   
  })

test('should expose public author profiles', async()=>{
  const getUsers = gql`
    query getUsers {
      users {
          id
          name
          email
        
      }
    }
  `;

  const results = await client.query({
  query: getUsers
}) 

expect(results.data.users.length > 0).toBeTruthy()

expect(results.data.users[0].name).toBe('jane')



})






test('should not be able to signup with a short password', async()=>{

    
   
  const createUser = gql`
  mutation CreateUser {
    createUser(data: {
      email: "fony@outlook.com",
      name: "fony",
      password: "test1"
    }) {
      token
      user {
        id
        name
        email
      }
    }
  }
`;

await expect(client.mutate({
  mutation: createUser
})).rejects.toThrow()

})



test('should fetch user profile', async()=>{
  
  const client = getClient(userOne.jwt)
  
  const getProfile = gql`
  query GetProfile {
      me {
        id
        name
        email
      }
    }
  `

  const {data} = await client.query({query: getProfile})

  expect(data.me.id).toBe(userOne.user.id)
  expect(data.me.name).toBe(userOne.user.name)
  expect(data.me.email).toBe(userOne.user.email)

})