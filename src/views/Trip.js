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
       let fieldinfo=[
            {id:"status",label:"Status",type:"string"},
            {id:"imei",label:"Imei",type:"string"},
            {id:"3",label:"3",type:"number"},
            {id:"start_time",label:"Start",type:"date"},
            {id:"5",label:"5",type:"string"},

        ]
        return (
            <div className="flex-1">
               <List fields={fieldinfo} />
            </div>
        );
    }
}

export default Trip;