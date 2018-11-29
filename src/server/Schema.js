let tripSchema = {
    fields: {
        _id: {type: "objectId"},
        vehicle: {type: "fk", table: "vehicle"},
        transporter: {type: "fk", table: "entities"},
        customer: {type: "fk", table: "entities"},
        // imei_mapping: {type: "fk", table:"imei_mapping"},
        imei: {type: "string"},
        start_time: {type: "string"},
        status: {type: "string"},
    }
}
let truckSchema = {
    fields: {
        _id: {type: "objectId"},
        truck_no: {type: "string"},
        vehicle_type: {type: "string"},
        imei: {type: "string"},
        alert_time: {type: "string"},
        powercut: "boolean",
        transporter: {type: "fk", table: "transpoter"}
    }
}
let entitySchema = {
    fields: {
        _id: {type: "objectId"},
        name: {type: "string"},
        email: {type: "string"},
        branch: {type: "fk", table: "transpoterbranch"}
    }
}
let entityBranchSchema = {
    fields: {
        _id: {type: "objectId"},
        name: {type: "string"},
        email: {type: "string"},
        city: {type: "fk", table: "city"}
    }

}
let citySchema = {
    fields: {
        _id: {type: "objectId"},
        name: {type: "string"},
        state: {type: "fk", table: "state"}
    }

}
let stateSchema = {
    fields: {
        _id: {type: "objectId"},
        name: {type: "string"}
    }

}
let studentSchema = {
    fields: {
        _id: {type: "objectId"},
        name: {type: "string"},
    }
}

let employeeSchema={
    fields:{
        _id: {type: "objectId"},
        reportingTo: {type: "fk", table: "Resource"},
        functional_manager: {type: "fk", table: "Resource"},
        dob:{type:"date"},
        card_no:{type:"number"},
        employee_code:{type:"string"},
        employee_status: {type:"string"},
        name: {type:"string"},
        salary_payment_mode: {type:"string"},
        official_email_id: {type:"string"},
        photo:{type:"file"},
        bank_accounts:{
            type:"object",
            fields:{
                _id:{type: "objectId"},
                name_in_bank:{type:"string"},
                account_number:{type:"string"},
                branch:{type:"string"},
                nominee: {type: "fk", table: "Resource"},
                account_type_id:{type:"string"},
                date_of_opening:{type:"date"},
                ifsc_code:{type:"string"},
            }
        }
    }

}

let bloodGroupSchema={
    fields:{
        _id:{type:"objectId"},
        name:{type:"string"}
    }

}
let nomineeSchema={
    fields: {
        _id: {type: "objectId"},
        name: {type: "string"}
    }
}

let skillSchema={
    fields:{
    _id:{type:"objectId"},
    name:{type:"string"},
    skill_levels: {type:"fk",table:"SkillLevel"}
    }
}

let skillLevelSchema={
    fields: {
        _id: {type: "objectId"},
        level: {type: "string"}
    }
}

let bankAccountSchema={
    fields: {
        _id: {type: "objectId"},
        name_id: {type: "fk", table: "BankType"},
        name_in_bank: {type: "string"},
        branch: {type: "string"},
        account_no: {type: "string"},
        account_type_id: {type: "fk", table: "Account"}
    }
}

let bankTypeSchema={
    fields: {
        _id: {type: "objectId"},
        name: {type: "string"}
    }
}

let accountSchema={
    fields: {
        _id: {type: "objectId"},
        name: {type: "string"},
        is_bank: {type: "boolean"},
        description: {type: "string"},
        name_in_bank: {type: "string"},
        account_group_type: {type: "string"}
    }
}
let connectionSchema={
    fields: {
        _id: {type: "objectId"},
        user: {type: "json"},
        token: {type: "string"},
    }
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
    else if (table == "Connection") {
        return connectionSchema
    }
    return null;
}