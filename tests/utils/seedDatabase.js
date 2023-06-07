import bcrypt from 'bcryptjs'
import PrismaContext from '../../src/prismaContext'
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken'

const userOne =  {
    input: {
        id: uuidv4(),
        name: 'jane',
        email:"jane@example.com",
        password: bcrypt.hashSync('test@1234') 
    },
    user: undefined,
    token: undefined,
    posts:[]

}
const seedDatabase = async() => {
    //delete test data
    await PrismaContext.user.deleteMany({})
    await PrismaContext.post.deleteMany({})
    //create userOne
    userOne.user = await PrismaContext.user.create({
      data: userOne.input
    })
    
    userOne.jwt = jwt.sign({userId: userOne.user.id}, process.env.JWT_TOKEN) 
    
    const [postId1, postId2] = [uuidv4(), uuidv4()]
    userOne.posts.length=0
    const post1 = await PrismaContext.post.create({
        data:{
            id: postId1,
            updateCheckField: `${postId1}${userOne.user.id}`,
            title: "John Wick",
            body:"John was once an associate of ours, we called him Baba Yaga.",
            published: true,
              author: { 
                connect:{
                  id: userOne.user.id
                }
              }
        }
      })

      
    userOne.posts.push(post1)
  
      const post2 = await PrismaContext.post.create({
        data: {
            id: postId2,
            updateCheckField: `${postId2}${userOne.user.id}`,
            title: "Nobody",
            body:"This ain't John Wick but you know...",
            published: false,
              author: { 
                connect:{
                  id: userOne.user.id
                }
              }
        }
      })
    userOne.posts.push(post2)
  
}




export {seedDatabase as default, userOne}



