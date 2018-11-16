import React from "react";
import { observer, inject } from "mobx-react";
import List from "./../components/List";
import Form from "./../components/Form"
import TextInput from "./../components/TextBox"
import {deleteIcon} from "../images/images";

@inject("data")
@observer
class AccountList extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        let columns = [
            {
                Header: 'Name',
                headerStyle: {"text-align": "left"},
                accessor: 'name'
            },
            {
                Header: 'Description',
                headerStyle: {"text-align": "left"},
                accessor: 'description',

            },
            {
                Header: 'Type',
                headerStyle: {"text-align": "left"},
                accessor: 'account_group_type',

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
        return (<List onrowTouch={"/account-detail"} columns={columns}/>);
    }
}



export class AccountForm extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="flex-1">
                <Form>
                    <TextInput value="name" label="Name"/>
                    <TextInput value="description" label="Description"/>
                </Form>
            </div>
        );
    }
}

export default AccountList;
