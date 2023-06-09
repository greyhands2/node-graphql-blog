const path = require('path')
const { loadFilesSync } = require('@graphql-tools/load-files')
const { mergeTypeDefs } = require('@graphql-tools/merge')
 
const typesArray = loadFilesSync(path.join(__dirname, './types'), { extensions: ['graphql'] })
 
const typeDefs = mergeTypeDefs(typesArray);
export {typeDefs as default}