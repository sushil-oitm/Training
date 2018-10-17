const _find=async(paramValue,args)=>{
    console.log("paramValue>>>>"+JSON.stringify(paramValue))
    // console.log("args>>>>"+JSON.stringify(args))
    let {table,query,option}=paramValue;
    let data=await args._dbConnect.find(table,query,option)
    console.log("data>>>>>>"+JSON.stringify(data));
    return data;
}
let allmethod={
    _find
}
export  default  allmethod;