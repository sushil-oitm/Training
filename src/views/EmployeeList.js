import React from "react";
import { observer, Provider, inject } from "mobx-react";
import List from "./../components/List";
import NestedList from "./../components/NestedList"
import Form from "./../components/Form"
import TextInput from "./../components/TextBox"
import DateCom from "../components/date";
import AutoSelect from '../components/autoSelect';
import {deleteIcon} from "../images/images";

@inject("data")
@observer
class EmployeeList extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const {data:{data}} = this.props;
   let columns = [
           {
            Header: 'Name',
            headerStyle: {"text-align": "left"},
            accessor: 'name'
           },
            {
                Header: 'Email',
                headerStyle: {"text-align": "left"},
                accessor: 'official_email_id',

            },
            {
                headerStyle: {"text-align": "left"},
                id: 'dob', // Required because our accessor is not a string
                Header: 'DOB',
                type:"date",
                accessor: 'dob'
            },
            {
                Header: 'Code',
                headerStyle: {"text-align": "left"},
                accessor: 'employee_code',

            },
            {
                Header: 'Payment Mode',
                headerStyle: {"text-align": "left"},
                accessor: 'salary_payment_mode',
            },
            {
                headerStyle: {"text-align": "left"},
                id: 'functional_manager', // Required because our accessor is not a string
                Header: 'Function Manager',
                accessor: 'functional_manager.name'
            },
            {
                id:"actions",
                columns: [
                    {
                        id: '_id',
                        width:120,
                        tdProps: 'delete',
                        Cell: props => {
                            return  <img src={deleteIcon()}  height="35px" width="20px" style={{"padding-top":"15px"}}/>
                        }
                    }
                ]
            }
        ]
        return (<List onrowTouch={"/resources-detail"} columns={columns}/>);
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
