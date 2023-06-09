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
    posts:[],
    comments: []

}

const userTwo = {
  input: {
    id: uuidv4(),
    name: 'cane',
    email:"cane@example.com",
    password: bcrypt.hashSync('test@4321') 
  },
  user: undefined,
  token: undefined,
  posts:[],
  comments: []
}
const seedDatabase = async() => {
    //delete test data
    await PrismaContext.user.deleteMany({})
    await PrismaContext.post.deleteMany({})
    await PrismaContext.comment.deleteMany({})

    //create userOne
    userOne.user = await PrismaContext.user.create({
      data: userOne.input
    })
    

    userTwo.user = await PrismaContext.user.create({
      data: userTwo.input
    })
    


    userOne.jwt = jwt.sign({userId: userOne.user.id}, process.env.JWT_TOKEN) 
    userTwo.jwt = jwt.sign({userId: userTwo.user.id}, process.env.JWT_TOKEN)
    const [postId1, postId2] = [uuidv4(), uuidv4()]
    userOne.posts.length = 0
    userOne.comments.length = 0
    userTwo.posts.length = 0
    userTwo.comments.length = 0
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
            updateCheckField: `${postId2}${userTwo.user.id}`,
            title: "Nobody",
            body:"This ain't John Wick but you know...",
            published: false,
              author: { 
                connect:{
                  id: userTwo.user.id
                }
              }
        }
      })
    userTwo.posts.push(post2)

      let [commentId1, commentId2] = [uuidv4(), uuidv4()] 
    const comment1 = await PrismaContext.comment.create({
      data: {
        id: commentId1,
        updateCheckField: `${commentId1}${userTwo.user.id}${postId1}`,
        text: "",
        author: {
          connect: {
            id: userTwo.user.id
          }
        },
        post: {
          connect: {
            id: postId1
          }
        }
      }
    })

    userOne.comments.push(comment1)



    const comment2 = await PrismaContext.comment.create({
      data: {
        id: commentId2,
        updateCheckField: `${commentId2}${userOne.user.id}${postId2}`,
        text: "",
        author: {
          connect: {
            id: userOne.user.id
          }
        },
        post: {
          connect: {
            id: postId2
          }
        }
      }
    })

    userTwo.comments.push(comment2)
  
}




export {seedDatabase as default, userOne, userTwo}



