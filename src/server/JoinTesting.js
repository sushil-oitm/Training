import MongoConnect from "./MongoConnect"
let mongo = require("mongodb");
export const config={
    host: "139.162.25.190",
    port: 28853,
    dbName: "autoload_new",
    fileDBName: "files_db",
    logDBName: "app_v3_logs",
    authEnabled: true,
    user: "autoload@admin",
    pwd:  "daffodil-autoload@admin",
    authDB: "admin"
}

let tripSchema = {
    _id :{type :"objectId"},
    truck: {type: "fk", table:"trucks"},
    transporter: {type: "fk", table:"entities"},
    customer: {type: "fk", table:"entities"},
    imei_mapping: {type: "fk", table:"imei_mapping"},
    imei: "string",
    status: "string",
}
let truckSchema = {
    _id :{type :"objectId"},
    truck_no: "string",
    imei: "string",
    alert_time: "date",
    powercut: "boolean",
    fleet_owner: {type: "fk", table:"entities"},
}
let entitySchema={
    _id :{type :"objectId"},
    name:"string",
    email:"string"
}

var getSchema = (table)=>{
    if(table =="offers"){
        return tripSchema;
    }else if(table =="trucks"){
        return truckSchema;
    }else if(table =="entities"){
        return entitySchema;
    }
    return null;
}



export const getTripData=async (mongoConnect,query)=>{
    console.log("getTripData called>>>>>")
    // let query={"imei" : "358735072873754",_id:mongo.ObjectID("5b618c299970c08c655ae7ff")}
    let fields={_id:1,status:1,imei:1,"customer.email":1,"customer._id":1,"transporter.email":1,"transporter._id":1,"truck":1}
    let table="offers"
    let result = await getTableData(query,fields,table,mongoConnect);
    // console.log("final result >>>>."+JSON.stringify(result));
    return result;
}


let getTableData=async(query ,fields, table,mongoConnect)=>{
    // console.log(`getTableData called with fields>>>> ${JSON.stringify(fields)} table ${table}`)
    let subqueryFields= resolveSubqueryFields(fields,table);
    // console.log(`fields pass to query>>>> ${JSON.stringify(fields)}`)
    let salData = await mongoConnect.find(table,{filter:query,fields:fields});
    salData=salData.result;
    // console.log(`result of query>>>> ${JSON.stringify(salData)}`)
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
let resolveSubqueryFields=(fields, table)=>{
    let subqueryFields = {};
    let schema = getSchema(table);
    for(let key in fields){
        let mainKey = key;
        let secondPart = null;
        let index = key.indexOf(".");
        if(index > -1){
            mainKey = key.substring(0, index);
            secondPart = key.substring(index+1);
        }
        if(schema[mainKey].type == "fk"){
            if(!subqueryFields[schema[mainKey].table]){
                subqueryFields[schema[mainKey].table] = subqueryFields[schema[mainKey].table] || {};
            }
            if(!subqueryFields[schema[mainKey].table]["fields"]){
                subqueryFields[schema[mainKey].table]["fields"] = {};
                subqueryFields[schema[mainKey].table]["fields"][secondPart] = 1;
                subqueryFields[schema[mainKey].table]["relation"] = {
                    localField :mainKey,
                    foreignKey : "_id"
                }
            }else {
                subqueryFields[schema[mainKey].table]["fields"] =subqueryFields[schema[mainKey].table]["fields"]
                subqueryFields[schema[mainKey].table]["fields"][secondPart] = 1;
            }
            // if(secondPart == "_id")
            // delete fields[key];
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
        let filter = [];
        if(subdata && subdata.length>0){
            for(let i=0;i<subdata.length; i++){
                filter.push(mongo.ObjectID(subdata[i][relation.localField]["_id"]));
            }
        }
        let data = await getTableData({_id:{$in: filter}} ,clone(subqueryFields[table]["fields"]), table,mongoConnect);
        return {data, relation}
    }
}


let clone=(obj)=>{
    let c = {};
    for(let k in obj)
        c[k] = obj[k]
    return c;
}


