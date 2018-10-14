let Employee = {
    _id :{type :"objectId"},
    department:{type: "fk", table:"department"},
    biometric_code: "string",
    name: "string",
}

let Attendance = {
    _id :{type :"objectId"},
    employee: {type: "fk", table:"employee"},
    type: "string",
    date: "string"
}
let Salary = {
    _id :{type :"objectId"},
    employee: {type: "fk", table:"employee"},
    date: "string",
    gross:"number",
    payable:"number",
}
let Department = {
    _id :{type :"objectId"},
    name:"string"
}

export default schema={
    Employee,
    Attendance,
    Salary,
    Department,
}