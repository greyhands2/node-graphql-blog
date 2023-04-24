# graphql-parse-relation-fields

This is a package that helps you sort out your graphql client request fields into a neat Javascript object and format so they can be used as an optional arguement for a [Prisma ](https://www.prisma.io/docs/concepts/components/prisma-schem) relational or non-relational(scalar) sql database query. This helps you filter out unwanted data from your database query results except that it's the client request that specifies and determines the fields they want returned.

[
](https://www.prisma.io/docs/concepts/components/prisma-schem)

## Usage

Installation

```
npm i graphql-parse-relation-fields

```

An example of a [ Prisma ](https://www.prisma.io/docs/concepts/components/prisma-schem) schema below

schema.prisma

```javascript
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}


model User {
  
  id String @id 
  name String @db.VarChar(255)
  email String @unique @db.VarChar(255)
  password String? @db.VarChar(255)
  links Link[]
  posts Post[] 
  comments Comment[] 
  createdAt DateTime @default(now())
  updatedAt DateTime @default(now())
  verified Boolean @default(false)
}
model Post {
  id String @id 
  title String @db.VarChar(100)
  body String 
  published Boolean?
  authorId String 
  author User @relation(fields: [authorId], references: [id], onDelete: Cascade)
  comments Comment[] 
  
 
  
}

model Comment {
  id String @id 
  text String
  authorId String 
  postId String 
  author User @relation(fields: [authorId], references: [id], onDelete: Cascade)
  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)


  
}

model Link {
  id String @id
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  text String 
  name String
  userId String 
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  
}

```

Graphql Playground / Graphiql Query Example

```graphql
users {
    id
    name
    email
  
    posts {
      title
      body
      author {
        name
        links {
          text
        }
      }
  
    }
   comments {
        text
      }
  
 }
```



**Take note that the package's function call takes an object as an argument containing keys : info, dbRelationalFields and type and then it returns an object in a format that the prisma query can accept**

Example of the package's function call

```javascript
const grpf = require("graphql-parse-relation-fields");

let queryFields = gprf({info, dbRelationalFields, type:relationType});

```



The info variable

**This is a parameter in the Graphql's resolver function as shown below, it contains details about the fields requested by the client user but in a format that would be useless to prisma hence the need for this package**

```javascript
const Query = {
    users(parent, args, ctx, info){
  
    },

}


```



The dbRelationalFields variable

**This is an array of strings that should typically contain all the relational(non-scalar) fields across the schemas in your project, for example, a user schema could have posts, comments, links , etc as relational fields. A post schema too could also have author and comments as it's own relational fields.  So also a comment schema would have author and post relational fields. An Example below**

```javascript
const dbRelationFields = ["posts", "author", "comments", "links", "post"];
```



The type variable

**This basically allows you to choose the  [prisma relational query type API](https://www.prisma.io/docs/concepts/components/prisma-client/relation-querie) you want to use which could be "include" or "select"**


An example of the returned result of the package's function call where the type variable passed was "select"

```javascript
{
       select: {
         name: true,
         email:true,
         posts:{
           select:{
            title: true,
            body: true
           }
         }

       }
     }
```

## Now let's integrate the package

Example of a [GraphQL Yoga](https://the-guild.dev/graphql/yoga-server/doc) users query resolver function

```javascript
//import the package
const gprf = require("graphql-parse-relation-fields");

/****
the dbRelationFields array contains some the schema fields as written in the schema.prisma
file above that are in relation to other schemas in your schema.prisma file,
these fields would be called by the graphql client
query most probably from a frontend application
***/
const dbRelationFields = ["posts", "author", "comments", "links"];
const Query = {
   
    async users(parent, args, ctx, info){
     let {prisma} = ctx;
     // the opArgs object initiliazed here would contain your prisma query         optional arguements
     let opArgs = {};

     /****
     the variable relationType refers to the relation query type
     you want to use, for example, it could be 
     Prisma's "select" or "include" API


     example: 
     {
       select: {
         name: true,
         email:true,
         posts:{
           select:{
            title: true,
            body: true
           }
         }

       }
     }
     ****/


     let relationType = "select";


     /****
     call the graphql-parse-relation-fields 
     package and provide the arguments as done below 
     ****/

     let queryFields = gprf({info, dbRelationalFields, type:relationType});

     /****
      assign your optional arguement select key to the
      graphql-parse-relation-fields package function
      call results
     ****/

     opArgs.select = queryFields.select;
   
     // make your prisma query and pass the optional arguements
     let users = await prisma.user.findMany(opArgs);
   
     console.log(users);
   
     // return the results
     return users;
    }
}
```

This is an example of an object that is returned from the function call of this package using the schema.prisma file and also the graphql playground query examples above

```javascript
{
 select:{
 id:true,
 name:true,
 email:true,
 posts:{
  select:{
   title:true,
   body:true,
   author:{
    select:{
    name:true,
    links:{
     select:{
      text:true
      }
     }
    }
   }
  }
 },
 comments:{
  select:{
   text:true
   }
  }
 }
}
```

Example of a Prisma query result, when you use the object gotten from this package as an optional query arguement

```json
{
  "data": {
    "users": [
      {
        "id": "0b1bab18-6b02-4f91-9f60-ca050a17fcf4",
        "name": "tony",
        "email": "tonyt1@outlook.com",
        "posts": [],
        "comments": []
      },
      {
        "id": "e1d01500-9480-4051-8d55-71b9f0c77d0a",
        "name": "tonia",
        "email": "toniat1@outlook.com",
        "posts": [
          {
            "title": "the new",
            "body": "I am the new boss",
            "author": {
              "name": "tonia",
              "links": []
            }
          }
        ],
        "comments": []
      },
      {
        "id": "57cc1c4b-9b23-4a62-99f1-0e8cfda6d0dd",
        "name": "tonnel",
        "email": "tonnel1@outlook.com",
        "posts": [
          {
            "title": "john wickr",
            "body": "the baba yaga",
            "author": {
              "name": "tonnel",
              "links": []
            }
          },
          {
            "title": "john wickr",
            "body": "the baba yaga",
            "author": {
              "name": "tonnel",
              "links": []
            }
          },
          {
            "title": "john wickr",
            "body": "the baba yaga",
            "author": {
              "name": "tonnel",
              "links": []
            }
          }
        ],
        "comments": []
      }
    ]
  }
}

```
