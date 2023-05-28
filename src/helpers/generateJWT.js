import jwt from "jsonwebtoken";

const generateJWT = (userId) => (jwt.sign({userId}, process.env.JWT_TOKEN, { expiresIn: process.env.JWT_EXPIRES }));





export {generateJWT as default}