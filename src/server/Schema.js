let tripSchema = {
    _id: {type: "objectId"},
    vehicle: {type: "fk", table: "vehicle"},
    transporter: {type: "fk", table: "entities"},
    customer: {type: "fk", table: "entities"},
    // imei_mapping: {type: "fk", table:"imei_mapping"},
    imei: "string",
    start_time: "date",
    status: "string",
}
let truckSchema = {
    _id: {type: "objectId"},
    truck_no: "string",
    vehicle_type: "string",
    imei: "string",
    alert_time: "date",
    powercut: "boolean",
    transporter: {type: "fk", table: "transpoter"},
}
let entitySchema = {
    _id: {type: "objectId"},
    name: "string",
    email: "string",
    branch: {type: "fk", table: "transpoterbranch"}
}
let entityBranchSchema = {
    _id: {type: "objectId"},
    name: "string",
    email: "string",
    city: {type: "fk", table: "city"}

}
let citySchema = {
    _id: {type: "objectId"},
    name: "string",
    state: {type: "fk", table: "state"}

}
let stateSchema = {
    _id: {type: "objectId"},
    name: "string",

}
let studentSchema = {
    _id: {type: "objectId"},
    name: "string",

}

let employeeSchema={
    _id: {type: "objectId"},
    reportingTo: {type: "fk", table: "Resource"},
    dob:"date",
    card_no:"number",
    employee_status: "string",
    name: "string",
    salary_payment_mode: "string",
    email: "string",
    photo:"file"
}

let bloodGroupSchema={
    _id:{type:"objectId"},
    name:"string"
}
let nomineeSchema={
    _id:{type:"objectId"},
    name:"string"
}

let skillSchema={
    _id:{type:"objectId"},
    name:"string",
    skill_levels: {type:"fk",table:"SkillLevel"},
}

let skillLevelSchema={
    _id: {type:"objectId"},
    level: "string",
}

let bankAccountSchema={
    _id:{type:"objectId"},
    name_id:{type:"fk", table:"BankType"},
    name_in_bank:"string",
    branch:"string",
    account_no:"string",
    account_type_id:{type:"fk" ,table:"Account"}
}

let bankTypeSchema={
    _id:{type:"objectId"},
    name:"string"
}

let accountSchema={
    _id:{type:"objectId"},
    name:"string",
    is_bank:"boolean",
    description:"string",
    account_group_type:"string"
}
export const getSchema = (table) => {
    if (table == "trip") {
        return tripSchema;
    } else if (table == "vehicle") {
        return truckSchema;
    } else if (table == "transpoter") {
        return entitySchema;
    } else if (table == "transpoterbranch") {
        return entityBranchSchema;
    }
    else if (table == "city") {
        return citySchema
    }
    else if (table == "state") {
        return stateSchema
    }
    else if (table == "student") {
        return studentSchema
    }
    else if (table == "Resource") {
        return employeeSchema
    }
    else if (table == "BloodGroup") {
        return bloodGroupSchema
    }
    else if (table == "NomineeRelation") {
        return nomineeSchema
    }
    else if (table == "skill") {
        return skillSchema
    }
    else if (table == "SkillLevel") {
        return skillLevelSchema
    }
    else if (table == "BankAccount") {
        return bankAccountSchema
    }
    else if (table == "BankType") {
        return bankTypeSchema
    }
    else if (table == "Account") {
        return accountSchema
    }

    return null;
}