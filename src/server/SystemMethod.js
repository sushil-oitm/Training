import {findData} from "./DbQuery";

const _find=async(paramValue,args)=>{
    console.log("paramValue>>>>"+JSON.stringify(paramValue))
    // console.log("args>>>>"+JSON.stringify(args))
    // let {table,query,option}=paramValue;
    let data=await findData(paramValue,args)
    console.log("data>>>>>>"+JSON.stringify(data));
    return data;
}

const transactiontest=async(paramValue,args)=>{
    console.log("transactiontest>>>>>")
  let studentupdate=await _save({table:"student",updates:{update:{_id:"5bcf1da062d2e24328b0f63d",changes:{$set:{name:"jyoti-5"}}}}},args)
  // let studentremove=await _save({table:"student",updates:{remove:{name:"jyoti-2"}}},args)
  // let studentinsert1=await _save({table:"student",updates:{insert:{name:"jyoti-1"}}},args)
  // let studentinsert2=await _save({table:"student",updates:{insert:{name:"jyoti-2"}}},args)
      throw  new Error("stop")
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
        let old= await args._dbConnect.find(table,{filter:remove})
        old=old.result;
        console.log("old>>>>"+JSON.stringify(old))
        if(old && old.length>0){
            old=old[0]
        }
        await removeData(table,remove,{old},args._dbConnect)
    }else if(update){
        await updateData(table,update,args._dbConnect)
    }
}
let insertData=async(table,insert,db)=>{
   await db.insert(table, insert)
}
let removeData=async(table,filter,option,db)=>{
   await db.remove(table, filter,{...option})
}
let updateData=async(table,update,db)=>{
    let {_id,changes}=update;
    if(!_id){
      throw new Error("_id is mandetory in update")
    } if(!changes){
      throw new Error("changes not found in update")
    }
    let filter={_id:_id}
    let old= await db.find(table,{filter})
    old=old.result;
    console.log("old>>>>"+JSON.stringify(old))
    if(old && old.length>0){
        old=old[0]
    }
   await db.update(table, filter, changes,{old})
}
let allmethod={
    transactiontest,
    _find,
    _save
}

export  default  allmethod;