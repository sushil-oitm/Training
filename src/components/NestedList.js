import React ,{Component} from "react";
import { observer, Provider, inject } from "mobx-react";
import Field from './field';
import Checkbox from '@material-ui/core/Checkbox';
import  {umbrella,menuicon,detailIcon,insertIcon,deleteIcon} from '../images/images'
import Style from './../theme/styles'
import "../CSS/List.css"


export class NestedList extends Component {
    constructor(props){
        super(props);
        this.deletedata = this.deletedata.bind(this);
        this.insertdata = this.insertdata.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.updates = {};
        this.state={value:this.props.value || []}
    }
   deletedata(rowData) {
        // let {params,webConnect,path}=this.props;
       console.log("rowData in delete>>>>>"+JSON.stringify(rowData))
         let value=this.state.value;
        let newValue=value.filter(vdata=>{
            if(vdata._id !=rowData._id){
              return vdata;
            }
        })
       console.log("new Data>>>>"+JSON.stringify(newValue))
       this.handleChange(rowData._id,{op:"remove",_id:rowData._id})
       this.setState({value:newValue})
   }
    insertdata() {
        // let {params,webConnect,path}=this.props;
         let value=this.state.value;
        let newkey=this.props.info.id;
        let rowData={_id:new Date().getTime()}
       value.push(rowData)
        this.handleChange(rowData._id,{op:"insert",_id:rowData._id})
        this.setState({value:value})
    }
    handleChange(key,value) {
         console.log("key>>>>"+JSON.stringify(key))
         console.log("value>>>>"+JSON.stringify(value))
         console.log("props value>>>>"+JSON.stringify(this.props.info.id))
         let newkey=this.props.info.id;
         console.log("pre update>>>>"+JSON.stringify(this.props[key]))

         if(this.updates[key]){
             value={...this.updates[key],...value};
         }
        if(!value.op){
            value["op"]="update";
        }
        console.log("final value>>>>"+JSON.stringify(value))
        this.updates[key]=value;
        console.log("final nested key is>>>>>"+JSON.stringify(value))
        this.props.handleChange(newkey,{[key]:value})
    }
    getHeader(childrendata,fields){
        let fieldsdata=[];
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
        var  {data:{meta,data},callFieldFocusOut,onDateChange}= this.props;
        const childrendata = React.Children.toArray(this.props.children)
        // console.log("props in NestedList>>>>>"+JSON.stringify(value))
        console.log("meta in NestedList>>>>>"+JSON.stringify(meta))
        data=this.state.value;
        let fieldinfo=meta.fieldsinfo.bank_accounts && meta.fieldsinfo.bank_accounts.fields || {};
        console.log("nested data>>>>"+JSON.stringify(data))
        return (<div style={{flex:1}}>
                <div style={{flexDirection:'row',flex:1,"display":'flex',"min-height": "50px", "background-color": "rgb(235, 235, 235)","align-items": "flex-end","text-align": "left","justify-content": "flex-end", "padding": "0px 10px"}}>
                    {this.getHeader(childrendata,meta.fieldsinfo)}

                </div>

                <div class="wrapper">
                    {data && data.map((rowData,index)=>(<div class="list_data" key={index}>
                        <RenderRow  rowData={rowData} handleChange={this.handleChange} onDateChange={onDateChange} callFieldFocusOut={callFieldFocusOut} childrendata={childrendata} fields={fieldinfo} ></RenderRow>

                        {<div style={{paddingLeft:"10"}}>
                            <img src={deleteIcon()}  onClick={(e)=>{this.deletedata(rowData,meta.table)}} height="35px" width="20px" style={{"padding-top":"15px"}}/>
                        </div>}

                    </div>))}
                    <div style={{"paddingLeft":20,paddingTop:20}} onClick={()=>{this.insertdata()}}>Add Data</div>

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
        this.handleChange = this.handleChange.bind(this);
        this.onDateChange = this.onDateChange.bind(this);
        this.onFieldFocusOut = this.onFieldFocusOut.bind(this);
        this.state={checked:true}
        this.updates = {};
    }
    handleChange(key,value) {
        let {rowData}=this.props;
        if(this.updates[rowData._id]){
            value={...this.updates[rowData._id],...value};
        }
        this.updates[key]=value;
        let newValue={_id:rowData._id,[key]:value}
        this.props.handleChange(rowData._id,newValue)
    }
    onFieldFocusOut({key,value}){
        this.handleChange(key, value);
    }
    onDateChange({id,date}){
        // console.log("enter in onDateChange.........."+date);
        // console.log("enter in onDateChange.........."+id);
        // console.log("enter in id.........."+id);
        // console.log("Object.prototype.toString.call(date)............"+Object.prototype.toString.call(date));
        this.handleChange(id, date);
    }
    getFields(childrendata,fields,rowData={}) {
        let fieldsdata = [];
    childrendata.map((child, i) => {
            let {value, label, display} = child.props;
            let {callFieldFocusOut,onDateChange} = this.props;
            // console.log("handleChange>>>>>",handleChange)
            // console.log("callFieldFocusOut>>>>>",callFieldFocusOut)
            // console.log("onDateChange>>>>>",onDateChange)
            let fieldinfo = fields[value];
            let props = {};
            if (fieldinfo && fieldinfo.type == "number") {
                props = {
                    ...childrendata[i].props,
                    key: new Date().getTime(),
                    type: "number",
                    info: {...fieldinfo, id: value},
                    value: rowData[value],
                    onChange: this.handleChange
                };
            } else if (fieldinfo && fieldinfo.type == "date") {
                props = {
                    ...childrendata[i].props,
                    key: new Date().getTime(),
                    detail:"true",
                    info: {...fieldinfo, id: value},
                    defaultValue: rowData[value],
                    onChange: (e) => {
                        this.onDateChange(e)
                    }
                };
            } else if (fieldinfo && fieldinfo.type == "fk") {
                props = {
                    ...childrendata[i].props,
                    key: new Date().getTime(),
                    detail:"true",
                    info: {...fieldinfo, id: value, display: display},
                    defaultValue: rowData[value],
                    callFieldFocusOut: (e) => {
                        this.onFieldFocusOut(e)
                    },
                    onChange: this.handleChange
                };
            } else {
                props = {
                    ...childrendata[i].props,
                    key: new Date().getTime(),
                    info: {...fieldinfo, id: value},
                    value: rowData[value],
                    onChange: this.handleChange
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



