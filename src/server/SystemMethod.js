const _find=async(paramValue,args)=>{
    console.log("paramValue>>>>"+JSON.stringify(paramValue))
    // console.log("args>>>>"+JSON.stringify(args))
    let {table,query,option}=paramValue;
    let data=await args._dbConnect.find(table,query,option)
    console.log("data>>>>>>"+JSON.stringify(data));
    return data;
}
const _save=async(paramValue,args)=>{
    let {table,updates,option}=paramValue || {};
    let {insert ,update,remove}=updates || {};
    if(!insert && !update && !remove){
      throw new Error("operation is mandetory in save")
    }
    if(!table){
      throw new Error("table is mandetory in save")
    }
    if(insert){
        await insertData(table,insert,args._dbConnect)
    } else if(remove){
        await removeData(table,remove,args._dbConnect)
    }else if(update){
        await updateData(table,update,args._dbConnect)
    }
}
let insertData=async(table,insert,db)=>{
   await db.insert(table, insert)
}
let removeData=async(table,filter,db)=>{
   await db.remove(table, insert)
}
let updateData=async(table,update,db)=>{
    let {_id,changes}=update;
    if(!_id){
      throw new Error("_id is mandetory in update")
    } if(!changes){
      throw new Error("changes not found in update")
    }
    let filter={id:_id}
   await db.update(table, filter, changes,)
}
let allmethod={
    _find,
    _save
}

export  default  allmethod;