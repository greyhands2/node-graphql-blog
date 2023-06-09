import 'cross-fetch/polyfill'
import React from 'react';
import ReactDOM from 'react-dom';
import bcrypt from 'bcryptjs'

import PrismaContext from '../src/prismaContext'
import { v4 as uuidv4 } from 'uuid';
import seedDatabase, {userOne, userTwo} from './utils/seedDatabase'
import {createUser, getUsers, login, getProfile} from './utils/user-operations'
import getClient from './utils/getClient'
const client = getClient();


beforeEach(seedDatabase)

//tests
test('should create a new user', async()=>{

    const variables = {
      data:{
        email: "fony@outlook.com",
        name: "fony",
        password: "test1234"
      }
    }
   
    


const result = await client.mutate({
    mutation: createUser,
    variables
})

let exists = await PrismaContext.user.findUnique({where:{id: result.data.createUser.user.id}})

expect(JSON.stringify(exists)).not.toBe('{}')


})

  
test('should not login with bad credentials', async () => {
    const variables = {
      email: "fony@outlook.com",
      password: "test1234"
    }


    await expect(client.mutate({mutation: login, variables})).rejects.toThrow()
  
   
  })

test('should expose public author profiles', async()=>{


  const results = await client.query({
  query: getUsers

}) 

expect(results.data.users.length > 0).toBeTruthy()




})






test('should not be able to signup with a short password', async()=>{

  const variables = {
    data: {
      email:"tony@outlook.com",
      name:"tony",
      password:"test1"
    }
  }  
   
  

await expect(client.mutate({
  mutation: createUser,
  variables
})).rejects.toThrow()

})



test('should fetch user profile', async()=>{
  
  const client = getClient(userOne.jwt)
  
  

  const {data} = await client.query({query: getProfile})

  expect(data.me.id).toBe(userOne.user.id)
  expect(data.me.name).toBe(userOne.user.name)
  expect(data.me.email).toBe(userOne.user.email)

})