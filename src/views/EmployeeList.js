import React from "react";
import { observer, Provider, inject } from "mobx-react";
import List from "./../components/List";
import NestedList from "./../components/NestedList"
import Form from "./../components/Form"
import TextInput from "./../components/TextBox"
import DateCom from "../components/date";
import AutoSelect from '../components/autoSelect';

@inject("data")
@observer
class EmployeeList extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const {data:{data}} = this.props;
        // console.log("data in internal is>>>>"+JSON.stringify(data))
        let meta=[
            // {id:"photo",label:"Photo"},
            {id:"name",label:"Name"},
            {id:"dob",label:"DOB"},
            {id:"official_email_id",label:"Email"},
            {id:"employee_code",label:"Card No"},
            {id:"functional_manager",label:"Functional Manager",display:"name"},
            {id:"salary_payment_mode",label:"Salary Mode"},
            {id:"employee_status",label:"Status"},
            {id:"bank_accounts",label:"Bank Details"}
        ]
        return (
            <div className="flex-1">
                <List onrowTouch={"/resources-detail"}>
                        <TextInput value="name" label="Name"/>
                        <TextInput value="official_email_id" label="Email"/>
                        <TextInput value="employee_code" label="Card No"/>
                        <TextInput value="salary_payment_mode" label="Salary Mode"/>
                        <DateCom value="dob" label="DOB" />
                        <AutoSelect value="functional_manager" label="Functional Manager" display="name" />
                </List>
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
        return (
            <div className="flex-1">
                <Form>
                    <TextInput value="name" label="Name"/>
                    <TextInput value="official_email_id" label="Email"/>
                    <TextInput value="employee_code" label="Card No"/>
                    <TextInput value="salary_payment_mode" label="Salary Mode"/>
                    <DateCom value="dob" label="DOB" />
                    <AutoSelect value="functional_manager" label="Functional Manager" display="name" />
                    <NestedList value="bank_accounts">
                        <TextInput value="name_in_bank" label="Name in Bank"/>
                        <TextInput value="account_number" label="Account Number"/>
                        <TextInput value="branch" label="Branch"/>
                        <DateCom value="date_of_opening" label="Date of Opening" />
                        <AutoSelect value="nominee" label="Nominee" display="name" />
                    </NestedList>

                </Form>
            </div>
        );
    }
}

export default EmployeeList;
