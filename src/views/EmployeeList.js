import React from "react";
import { observer, Provider, inject } from "mobx-react";
import List from "./../components/List"
import Form from "./../components/Form"
import Field from "./../components/field"


@inject("data")
@inject("meta")
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
            {id:"name",label:"Name",type:"string"},
            {id:"dob",label:"DOB",type:"date"},
            {id:"official_email_id",label:"Email",type:"string"},
            {id:"card_no",label:"Card No",type:"number"},
            {id:"functional_manager",label:"Functional Manager",type:"fk",display:"name"},
            // {id:"reportingTo",label:"Reporting Manager",type:"select",display:"name"},
            {id:"salary_payment_mode",label:"Salary Mode",type:"string"},

        ]
        return (
            <div className="flex-1">
                <List fields={meta} />
            </div>
        );
    }
}

@inject("data")
@inject("meta")
@observer
export class EmployeeForm extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const {data} = this.props;
        console.log("data in internal is>>>>"+JSON.stringify(data))
        let meta=[
            // {id:"photo",label:"Photo"},
            {id:"name",label:"Name",type:"string"},
            {id:"dob",label:"DOB",type:"date"},
            {id:"official_email_id",label:"Email",type:"string"},
            {id:"card_no",label:"Card No",type:"number"},
            {id:"functional_manager",label:"Functional Manager",type:"fk",display:"name"},
            // {id:"reportingTo",label:"Reporting Manager",type:"select",display:"name"},
            {id:"salary_payment_mode",label:"Salary Mode",type:"string"},

        ]
        return (
            <div className="flex-1">
                <Form fields={meta} rowData={data[0]} />
            </div>
        );
    }
}

export default EmployeeList;
