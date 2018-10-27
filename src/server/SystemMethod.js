import crypto from "crypto";
import {findData} from "./DbQuery";
let objectID = require("mongodb").ObjectID;

const _find = async (paramValue, args) => {
    console.log("paramValue>>>>" + JSON.stringify(paramValue))
    // console.log("args>>>>"+JSON.stringify(args))
    let data = await findData(paramValue, args)
    console.log("data>>>>>>" + JSON.stringify(data));
    return data;
};

const transactiontest = async (paramValue, args) => {
    console.log("transactiontest>>>>>")
    let studentupdate = await _save({
        table: "student",
        updates: {update: {_id: "5bcf1da062d2e24328b0f63d", changes: {$set: {name: "jyoti-5"}}}}
    }, args)
    // let studentremove=await _save({table:"student",updates:{remove:{name:"jyoti-2"}}},args)
    // let studentinsert1=await _save({table:"student",updates:{insert:{name:"jyoti-1"}}},args)
    // let studentinsert2=await _save({table:"student",updates:{insert:{name:"jyoti-2"}}},args)
    throw  new Error("stop")
};

const _save = async (paramValue, args) => {
    let {table, updates, option} = paramValue || {};
    let {insert, update, remove} = updates || {};
    if (!insert && !update && !remove) {
        throw new Error("operation is mandetory in save")
    }
    if (!table) {
        throw new Error("table is mandetory in save")
    }
    if (insert) {
       return  await insertData(table, insert, args._dbConnect)
    } else if (remove) {
        let old = await args._dbConnect.find(table, {filter: remove})
        old = old.result;
        // console.log("old>>>>" + JSON.stringify(old))
        if (old && old.length > 0) {
            old = old[0]
        }
        let removedata=await removeData(table, remove, {old}, args._dbConnect)
        console.log("removedata>>>>>>"+JSON.stringify(removedata))
        return removedata;
    } else if (update) {
        let updatedata=  await updateData(table, update, args._dbConnect)
        return updatedata;
    }
};

let insertData = async (table, insert, db) => {
   let insertedData= await db.insert(table, insert)
    return insertedData;
};

let removeData = async (table, filter, option, db) => {
    let removeData= await db.remove(table, filter, {...option});
    console.log("removeData>>>>>>"+JSON.stringify(removeData))
    return {result:removeData};
};

let updateData = async (table, update, db) => {
    let {_id, changes} = update;
    if (!_id) {
        throw new Error("_id is mandetory in update")
    }
    if (!changes) {
        throw new Error("changes not found in update")
    }
    let filter = {_id: _id}
    let old = await db.find(table, {filter})
    old = old.result;
    // console.log("old>>>>" + JSON.stringify(old))
    if (old && old.length > 0) {
        old = old[0]
    }
    let updateData= await db.update(table, filter, changes, {old});
    return updateData;
};

let _authenticateUser = async(params, args) => {
       let {_dbConnect}=args;
        let { email, password, _google_authenticated_, mobile } = params;
        let filter={};
        if (!_google_authenticated_) {
            if ((!email && !mobile) ||  !password) {
                throw new Error("Provide credential");
            }
        }

        if (!_google_authenticated_) {
            password = encryptPassword({ password });
            filter["enc_p"] = password.encPassword;
        }
    filter["email"] = email;
    let user = await _dbConnect.find("User", {filter})
           user = user.result && user.result.length > 0 && user.result[0] || void 0;

        let token = getToken();

    if (!user) {
        throw new Error("Not authorised");
    }
    await insertData("Connection", {user: { _id: user._id }, token}, args._dbConnect)
console.log("user>>>>>",JSON.stringify(user))
    return {result: {user: {...user}, token}};

};

const createUser = async (params, args) => {
        let { password, firstName = "", lastName = "", email, mobile } = params;
        const { _dbConnect} = args;
        if (!email || !password) {
            throw new Error(`Please provide value of mandatory parameters [email/password]`);
        }
       let otp = getOtp();
        let user = await _dbConnect.find("User", {filter:{email}})
        user = user.result && user.result.length > 0 && user.result[0] || void 0;
        // console.log("user>>>>",user)
        if (user) {
            throw new Error(`User [${email}] is already exists`);
        }
        if (mobile) {
            let mobileResult = await _dbConnect.find("User", {filter:{mobile}})
            mobileResult = mobileResult.result && mobileResult.result.length > 0 && mobileResult.result[0] || void 0;
            if (mobileResult) {
                throw new Error(`User [${mobile}] is already exists`);
            }
        }
        let encPwd = encryptPassword({ password });
        let userInsert = {
            email,
            otp,
            enc_p: encPwd && encPwd.encPassword,
            username: firstName + " " + lastName
        };
        if (mobile) {
            userInsert.mobile = mobile;
        }
        let userResult =  await insertData("User", userInsert, args._dbConnect)
        // userResult=userResult;
        // console.log("userResult>>>>>>"+JSON.stringify(userResult))
        return userResult;
};

var getOtp = _ => {
    var digit = void 0;
    do {
        digit = Number(Math.random() * 999999).toFixed();
    } while (digit.length != 6);
    return digit;
};

var encryptPassword = ({ password }) => {
    if (password == undefined || password === null) {
        return;
    }
    if (typeof password !== "string") {
        password += "";
    }
    let _encPassword = crypto.createHash("sha256").update(password).digest("hex");
    return {
        encPassword: _encPassword
    };
};

var getToken = _ => {
    return require("crypto").createHash("sha1").update(objectID().toString()).digest("hex");
};

let allmethod = {
    transactiontest,
    _authenticateUser,
    createUser,
    _find,
    _save
}

export default allmethod;