import React from "react";
import { observer, Provider, inject } from "mobx-react";
import List from "./../components/List"
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
            {id:"photo",label:"Photo"},
            {id:"name",label:"Name"},
            {id:"dob",label:"DOB"},
            {id:"email",label:"Email"},
            {id:"card_no",label:"Card No"},
            // {id:"reportingTo",label:"Reporting To"},
            {id:"salary_payment_mode",label:"Salary Mode"},

        ]
        return (
            <div className="flex-1">
                <List fields={meta} />
            </div>
        );
    }
}

export default EmployeeList;
