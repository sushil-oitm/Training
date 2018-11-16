import {getSchema} from "./Schema";

var ObjectId = require("mongodb").ObjectID;
export const findData = async (paramValue, args) => {
    console.log("findData called>>>>>")
    let {table, query, option} = paramValue;
    let fieldsinfo={};
    if(query.fields){
        let schema = getSchema(table).fields;
        for(let key in query.fields){
            if(schema[key]){
                fieldsinfo[key]=schema[key];
            }else{
                throw new Error("Schema not found for field "+ key)
            }
        }
    }
    let result = await getTableData(query, table, option, args);
    console.log("final result >>>>." + JSON.stringify(result));
    let meta={table:table,fieldsinfo:fieldsinfo}
    return {data:result,meta};
}

let getTableData = async (query, table, option, args) => {
    // console.log(`getTableData called with fields>>>> ${JSON.stringify(fields)} table ${table}`)

    let subqueryFields = resolveSubqueryFields(query.fields, table);
    let finalQuery = processQuery(query)
    let salData = await args._dbConnect.find(table, finalQuery, option)
    salData = salData.result;
     console.log(`result of query>>>> ${JSON.stringify(salData)}`)
    let subResult = await getSubqueryResult(salData, subqueryFields, args);
    let data = salData;
    if (subResult && Object.keys(subResult).length > 0) {
        data = mergeResult(salData, subResult.data, subResult.relation);
    }
    return data;
}

let processQuery = (query) => {
    let {filter} = query;
    for (let i in filter) {
        if (i == "_id" && "string" == typeof filter._id) {
            filter._id = ObjectId(filter._id)
        }
        else if ("string" == typeof i) {
            let index = i.lastIndexOf('.');
            let lastkey = i.substring(index + 1);
            if (lastkey == "_id" && "string" == typeof filter[i]) {
                filter[i] = ObjectId(filter[i])
            }
            else if (lastkey == "_id" && "object" == typeof filter[i]) {
                let filterValue = filter[i];
                for (let f1 in filterValue) {
                    if (f1 == "$in") {
                        let adata = filterValue[f1];
                        let farray = adata.map(d1 => {
                            if ("string" == typeof d1) {
                                d1 = ObjectId(d1)
                            }
                            return d1;
                        })
                        filterValue[f1] = farray;
                    }
                }
            }
        }

    }
    return query
}

let mergeResult = (src, tar, rel) => {
    if (!src || !src.length || !rel) {
        return src;
    }
    let map = mapOfRelation(tar, rel);
    for (let i = 0; i < src.length; i++) {
        if(src[i][rel.localField] && src[i][rel.localField]["_id"]){
            let value = src[i][rel.localField]["_id"];
            delete src[i][rel.localField]["_id"];
            src[i][rel.localField] = map[value];
        }

    }
    return src;
}

let mapOfRelation = (tar, rel) => {
    let map = {}
    let f = rel["foreignKey"];
    for (let i = 0; i < tar.length; i++) {
        map[tar[i][f]] = tar[i];
    }
    return map;
}

let resolveSubqueryFields = (fields, table) => {
    let subqueryFields = {};
    let schema = getSchema(table).fields;
     console.log("schema>>>>>"+JSON.stringify(schema))
    for (let key in fields) {
        let mainKey = key;
        let secondPart = null;
        if (key && Object.keys(fields[key]).length > 0) {
            mainKey = key;
        }
        if (schema[mainKey].type == "fk") {
            if (!subqueryFields[schema[mainKey].table]) {
                subqueryFields[schema[mainKey].table] = subqueryFields[schema[mainKey].table] || {};
            }
            if (!subqueryFields[schema[mainKey].table]["fields"]) {
                subqueryFields[schema[mainKey].table]["fields"] = {};
                subqueryFields[schema[mainKey].table]["fields"] = fields[key];
                subqueryFields[schema[mainKey].table]["relation"] = {
                    localField: mainKey,
                    foreignKey: "_id"
                }
            } else {
                subqueryFields[schema[mainKey].table]["fields"] = subqueryFields[schema[mainKey].table]["fields"]
                subqueryFields[schema[mainKey].table]["fields"] = fields[key];
            }
        }
    }
    return subqueryFields;
}


let getSubqueryResult = async (subdata, subqueryFields, args) => {
    if (!subqueryFields || subqueryFields && Object.keys(subqueryFields).length == 0) {
        return;
    }
    let table = Object.keys(subqueryFields)[0];
    if (table) {
        let relation = clone(subqueryFields[table]["relation"]);
         console.log("relation>>>>>",relation)
        let filter = [];
        if (subdata && subdata.length > 0) {
            for (let i = 0; i < subdata.length; i++) {
                if (subdata[i][relation.localField] && subdata[i][relation.localField]["_id"]) {
                    filter.push(subdata[i][relation.localField]["_id"]);
                }

            }
        }
         console.log("filter>>>>>",filter)
        if (filter && filter.length > 0) {
            let data = await getTableData({
                filter: {_id: {$in: filter}},
                fields: clone(subqueryFields[table]["fields"])
            }, table, {}, args);
            return {data, relation}
        }
        return;

    }
}


let clone = (obj) => {
    let c = {};
    for (let k in obj)
        c[k] = obj[k]
    return c;
}

