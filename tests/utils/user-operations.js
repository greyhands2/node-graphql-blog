import {gql } from '@apollo/client';


const createUser = gql`
mutation CreateUser($data: CreateUserInput) {
  createUser(data: $data) {
    token
    user {
      id
      name
      email
    }
  }
}
`;

const getUsers = gql`
query getUsers {
  users {
      id
      name
      email
    
  }
}
`;



const login = gql`
mutation User($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    token
    user {
      id
      name
      email
    }
  }
}
`;


const getProfile = gql`
  query GetProfile {
      me {
        id
        name
        email
      }
    }
  `






export {createUser, getUsers, login, getProfile}

