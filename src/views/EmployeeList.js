import React from "react";
import { observer, Provider, inject } from "mobx-react";
import List from "./../components/List"
import Form from "./../components/Form"

@inject("data")
@observer
class EmployeeList extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const {data} = this.props;
        console.log("data in internal is>>>>"+JSON.stringify(data))
        let meta=[
            // {id:"photo",label:"Photo"},
            {id:"name",label:"Name"},
            {id:"dob",label:"DOB"},
            {id:"official_email_id",label:"Email"},
            {id:"card_no",label:"Card No"},
            {id:"functional_manager",label:"Functional Manager",display:"name"},
            {id:"salary_payment_mode",label:"Salary Mode"},
            {id:"employee_status",label:"Status"}

        ]
        return (
            <div className="flex-1">
                <List fields={meta} onrowTouch={"/resources-detail"} />
            </div>
        );
    }
}


@observer
export class EmployeeForm extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        let meta=[
            // {id:"photo",label:"Photo"},
            {id:"name",label:"Name"},
            {id:"dob",label:"DOB"},
            {id:"official_email_id",label:"Email"},
            {id:"card_no",label:"Card No"},
            {id:"functional_manager",label:"Functional Manager",display:"name"},
            {id:"salary_payment_mode",label:"Salary Mode"},
            {id:"employee_status",label:"Status"}
        ]
        return (
            <div className="flex-1">
                <Form fields={meta} />
            </div>
        );
    }
}

export default EmployeeList;
