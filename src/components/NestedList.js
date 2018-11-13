import React ,{Component} from "react";
import { observer, Provider, inject } from "mobx-react";
import Field from './field';
import Checkbox from '@material-ui/core/Checkbox';
import  {umbrella,menuicon,detailIcon,insertIcon,deleteIcon} from '../images/images'
import Style from './../theme/styles'
import "../CSS/List.css"

@inject("data")
@observer
export class NestedList extends Component {
    constructor(props){
        super(props);
        this.deletedata = this.deletedata.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }


    async deletedata(rowData,table) {
        // let {params,webConnect,path}=this.props;
        // let finalupdates= {table:table,updates:{remove:{_id:rowData._id}}}
        //  let deleterow= await webConnect.invoke({"id":"_save",param:finalupdates})
        // if(!deleterow.result){
        //     alert("Error in delete "+deleterow);
        //     return;
        // }
        // console.log("deleterow>>>>"+JSON.stringify(deleterow))
        // let newpath=path[path.length-1];
        // path.pop()
        // params["reload"]=true;
        // path.push(newpath)

    }
    handleChange(key,value) {
        console.log("key>>>>"+JSON.stringify(key))
        console.log("value>>>>"+JSON.stringify(value))
        console.log("props value>>>>"+JSON.stringify(this.props.value))

        this.props.handleChange(key,value)
    }
    getHeader(childrendata,fields){
        let fieldsdata=[]
        childrendata.map((child, i) => {
            let {value, label, display} = child.props;
            let  fieldinfo = fields[value];
            fieldsdata.push(
                <div key={i} class="list_wrapper">
                    <div class="list_inner_wrapper">
                        <span>{label}</span>
                    </div>
                </div>
            )
        })
        return fieldsdata;
    }
    render(){
        var  {value,data:{meta,data},callFieldFocusOut,onDateChange}= this.props;
        const childrendata = React.Children.toArray(this.props.children)
        console.log("props in NestedList>>>>>"+JSON.stringify(value))
        console.log("meta in NestedList>>>>>"+JSON.stringify(meta))
        data=value;
        let fieldinfo=meta.fieldsinfo.bank_accounts && meta.fieldsinfo.bank_accounts.fields || {};
        if(!data){
            return <div></div>
        }
        console.log("nested data>>>>"+JSON.stringify(data))
        return (<div style={{flex:1}}>

                <div style={{flexDirection:'row',flex:1,"display":'flex',"min-height": "50px", "background-color": "rgb(235, 235, 235)","align-items": "flex-end","text-align": "left","justify-content": "flex-end", "padding": "0px 10px"}}>
                    {this.getHeader(childrendata,meta.fieldsinfo)}

                </div>
                <div class="wrapper">
                    {data.map((rowData,index)=>(<div class="list_data" key={index}>
                        <RenderRow  rowData={rowData} handleChange={this.handleChange} onDateChange={onDateChange} callFieldFocusOut={callFieldFocusOut} childrendata={childrendata} fields={fieldinfo} ></RenderRow>

                        {<div style={{paddingLeft:"10"}}>
                            <img src={deleteIcon()}  onClick={(e)=>{this.deletedata(rowData,meta.table)}} height="35px" width="20px" style={{"padding-top":"15px"}}/>
                        </div>}

                    </div>))}

                </div>
            </div>
        )
    }
}

@inject("path")
@inject("params")
@inject("data")
@observer
class RenderRow extends Component {
    constructor(props){
        super(props);
        this.getFields = this.getFields.bind(this);
        this.state={checked:true}
    }
    getFields(childrendata,fields,rowData={}) {
        let fieldsdata = [];
    childrendata.map((child, i) => {
            let {value, label, display} = child.props;
            let {callFieldFocusOut,onDateChange,handleChange} = this.props;
            console.log("handleChange>>>>>",handleChange)
            console.log("callFieldFocusOut>>>>>",callFieldFocusOut)
            console.log("onDateChange>>>>>",onDateChange)
            let fieldinfo = fields[value];
            let props = {};
            if (fieldinfo && fieldinfo.type == "number") {
                props = {
                    ...childrendata[i].props,
                    key: {i},
                    type: "number",
                    info: {...fieldinfo, id: value},
                    value: rowData[value],
                    onChange: handleChange
                };
            } else if (fieldinfo && fieldinfo.type == "date") {
                props = {
                    ...childrendata[i].props,
                    key: {i},
                    info: {...fieldinfo, id: value},
                    defaultValue: rowData[value],
                    onChange: (e) => {
                        onDateChange(e)
                    }
                };
            } else if (fieldinfo && fieldinfo.type == "fk") {
                props = {
                    ...childrendata[i].props,
                    key: {i},
                    info: {...fieldinfo, id: value, display: display},
                    defaultValue: rowData[value],
                    callFieldFocusOut: (e) => {
                        callFieldFocusOut(e)
                    },
                    onChange: handleChange
                };
            } else {
                props = {
                    ...childrendata[i].props,
                    key: {i},
                    info: {...fieldinfo, id: value},
                    value: rowData[value],
                    onChange: handleChange
                };
            }

            let singlechild = React.cloneElement(child, props);

            fieldsdata.push(
                <div key={i} class="list_wrapper">
                    <div class="list_inner_wrapper">
                        {singlechild}
                    </div>
                </div>
            )
        })
        return fieldsdata;

    }
    render(){
        var  {fields,rowData,detailpath,childrendata}= this.props;
         // console.log("props in render row>>>>>"+JSON.stringify(this.props))
        // console.log("rowData in RenderRow>>>>>"+JSON.stringify(rowData))
        console.log("fields in RenderRow>>>>>"+JSON.stringify(fields))
        return (<div class="content">
            {this.getFields(childrendata,fields,rowData)}
        </div>)

    }
}




export default NestedList



