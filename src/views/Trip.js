import React from "react";
import { observer, Provider, inject } from "mobx-react";
import List from "./../components/List"
import Field from "./../components/field"


@inject("data")
@inject("meta")
@observer
class Trip extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const {data} = this.props;
        console.log("data in internal is>>>>"+JSON.stringify(data))
       let meta=[
            {id:"status",label:"Status"},
            {id:"imei",label:"Imei"},
            {id:"3",label:"3"},
            {id:"4",label:"4"},
            {id:"5",label:"5"},

        ]
        return (
            <div className="flex-1">
               <List fields={meta} />
            </div>
        );
    }
}

export default Trip;