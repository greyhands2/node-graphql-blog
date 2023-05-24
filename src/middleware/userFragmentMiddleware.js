import getUserId from '../helpers/getUserId'
const userFragmentMiddleware = async (resolve, parent, args, ctx, info) => {
    const result = await resolve(parent, args, ctx, info);
    const userId = getUserId(ctx.request, false);
  
    
    return result;
  };
  

  
  export {userFragmentMiddleware as default}