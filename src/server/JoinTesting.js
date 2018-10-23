import MongoConnect from "./MogoConnect"
let mongo = require("mongodb");

export const config={
    host: "192.168.100.119",
    port: 27017,
    dbName: "autoload",
    authEnabled: false
}
let db=new MongoConnect({config})

let tripSchema = {
    _id :{type :"objectId"},
    vehicle: {type: "fk", table:"vehicle"},
    transporter: {type: "fk", table:"entities"},
    customer: {type: "fk", table:"entities"},
    // imei_mapping: {type: "fk", table:"imei_mapping"},
    imei: "string",
    status: "string",
}
let truckSchema = {
    _id :{type :"objectId"},
    truck_no: "string",
    vehicle_type: "string",
    imei: "string",
    alert_time: "date",
    powercut: "boolean",
    transporter: {type: "fk", table:"transpoter"},
}
let entitySchema={
    _id :{type :"objectId"},
    name:"string",
    email:"string",
    branch: {type: "fk", table:"transpoterbranch"}
}
let entityBranchSchema={
    _id :{type :"objectId"},
    name:"string",
    email:"string",
    city:{type:"fk",table:"city"}

}
let citySchema={
    _id :{type :"objectId"},
    name:"string",

}
let stateSchema={
    _id :{type :"objectId"},
    name:"string",
    email:"string",

}

var getSchema = (table)=>{
    if(table =="trip"){
        return tripSchema;
    }else if(table =="vehicle"){
        return truckSchema;
    }else if(table =="transpoter"){
        return entitySchema;
    }else if(table =="transpoterbranch"){
        return entityBranchSchema;
    }
    return null;
}



export const getTripData=async (mongoConnect)=>{
    console.log("getTripData called>>>>>")
     // let query={"imei" : "358735072873754",_id:mongo.ObjectID("5b30cd3eff56bf4752e26ea8")}
     let query={_id:mongo.ObjectID("5b30cd3eff56bf4752e26ea8")}
    // let fields={_id:1,status:1,imei:1,"vehicle._id":1,"vehicle.vehicle_type":1}
    let fields={_id:1,status:1,imei:1,vehicle:{_id:1,vehicle_type:1,transporter:{_id:1,name:1,branch:{_id:1,name:1}}}}
    let table="trip"
    let result = await getTableData(query,fields,table,mongoConnect);
     console.log("final result >>>>."+JSON.stringify(result));
    return result;
}


let getTableData=async(query ,fields, table,mongoConnect)=>{
    // console.log(`getTableData called with fields>>>> ${JSON.stringify(fields)} table ${table}`)
    let subqueryFields= resolveSubqueryFields(fields,table);
     console.log(`fields pass to query>>>> ${JSON.stringify(fields)}`)
    let realFields=resolveFields(fields)
    let salData = await mongoConnect.find(table,{filter:query,fields:realFields});
    salData=salData.result;
     console.log(`result of query>>>> ${JSON.stringify(salData)}`)
    let subResult = await getSubqueryResult(salData,subqueryFields,mongoConnect);
    let data = salData;
    if(subResult && Object.keys(subResult).length >0){
        data =mergeResult(salData, subResult.data, subResult.relation);
    }
    return data;
}

let mergeResult=(src, tar, rel)=>{
    if(!src || !src.length || !rel){
        return src;
    }
    let map = mapOfRelation(tar, rel);
    for(let i=0; i<src.length; i++){
        let value = src[i][rel.localField]["_id"];
        delete src[i][rel.localField]["_id"];
        src[i][rel.localField] = map[value];
    }
    return src;
}

let mapOfRelation=(tar, rel)=>{
    let map = {}
    let f = rel["foreignKey"];
    for(let i=0;i<tar.length;i++){
        map[tar[i][f]] = tar[i];
    }
    return map;
}

// let subqueryFields
const  resolveFields =(obj,target,prefix)=> {
    target = target || {},
        prefix = prefix || "";

    Object.keys(obj).forEach(function(key) {
        if ( typeof(obj[key]) === "object" ) {
            resolveFields(obj[key],target,prefix + key + ".");
        } else {
            return target[prefix + key] = obj[key];
        }
    });

    return target;
}
let resolveSubqueryFields=(fields, table)=>{
    let subqueryFields = {};
    let schema = getSchema(table);
    console.log("fields>>>>>"+JSON.stringify(fields))
    for(let key in fields){
        let mainKey = key;
        let secondPart = null;
        if(key && Object.keys(fields[key]).length > 0){
            mainKey = key;
        }
        if(schema[mainKey].type == "fk"){
            if(!subqueryFields[schema[mainKey].table]){
                subqueryFields[schema[mainKey].table] = subqueryFields[schema[mainKey].table] || {};
            }
            if(!subqueryFields[schema[mainKey].table]["fields"]){
                subqueryFields[schema[mainKey].table]["fields"] = {};
                subqueryFields[schema[mainKey].table]["fields"] = fields[key];
                subqueryFields[schema[mainKey].table]["relation"] = {
                    localField :mainKey,
                    foreignKey : "_id"
                }
            }else {
                subqueryFields[schema[mainKey].table]["fields"] =subqueryFields[schema[mainKey].table]["fields"]
                subqueryFields[schema[mainKey].table]["fields"] = fields[key];
            }
        }
    }
    return subqueryFields;
}


let getSubqueryResult = async (subdata,subqueryFields,mongoConnect) =>{
    if(!subqueryFields || subqueryFields && Object.keys(subqueryFields).length==0){
        return;
    }
    let table = Object.keys(subqueryFields)[0];
    if(table){
        let relation = clone(subqueryFields[table]["relation"]);
        console.log("relation>>>>>",relation)
        let filter = [];
        if(subdata && subdata.length>0){
            for(let i=0;i<subdata.length; i++){
                if(subdata[i][relation.localField] && mongo.ObjectID(subdata[i][relation.localField]["_id"])){
                    filter.push(subdata[i][relation.localField]["_id"]);
                }

            }
        }
        console.log("filter>>>>>",filter)
        if(filter && filter.length >0){
            let data = await getTableData({_id:{$in: filter}} ,clone(subqueryFields[table]["fields"]), table,mongoConnect);
            return {data, relation}
        }
        return;

    }
}


let clone=(obj)=>{
    let c = {};
    for(let k in obj)
        c[k] = obj[k]
    return c;
}

getTripData(db);


