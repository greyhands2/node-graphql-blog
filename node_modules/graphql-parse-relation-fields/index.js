const objectFactory=({arr, dbRelationalFields, type})=>{
    let res = {[type]:{}};
    
    arr.forEach((selection) =>{
        
        let currentField = selection["name"]["value"];
        if(!!dbRelationalFields.includes(currentField)===false){
            res[type][currentField] = true;
        } else {
            res[type][currentField] = {...objectFactory({arr:selection.selectionSet.selections, dbRelationalFields, type})};
        }
        
    });
       
      return res;
    
}


const gprf = ({info, dbRelationalFields, type}) => {
    return objectFactory({arr: info.fieldNodes[0].selectionSet.selections, dbRelationalFields, type});
}
module.exports = gprf;


