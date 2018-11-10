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
        // this.listdetail = this.listdetail.bind(this);
        this.deletedata = this.deletedata.bind(this);
        // this.onScroll = this.onScroll.bind(this);
        if(!this.state){
            this.state={limit:20,checked: [],loading:false}
        }
    }
    handleToggle = (event,checked)=> {
        // console.log("event",event)
        // console.log("value",event.target.value)
        // console.log("current checked",this.state.checked)
        const value=event.target.value;
        const currentIndex = this.state.checked.indexOf(value);
        const newChecked = this.state.checked;
        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        this.setState({
            checked: newChecked,
        });
    };

    // async onScroll(e) {
    //     const {webConnect,data}=this.props;
    //     let { scrollHeight, scrollTop, offsetHeight } = e.target;
    //     let load_data_threshold = scrollHeight - scrollTop - offsetHeight;
    //     console.log("load_data_threshold>>>>>"+load_data_threshold)
    //     if (!this.state.loading && scrollTop != 0 && load_data_threshold <= 100) {
    //         // console.log("get new data called>>>>"+JSON.stringify(data))
    //         // console.log("get new data called>>>>"+JSON.stringify(data))
    //         // console.log("get new data called>>>>"+JSON.stringify(data))
    //          console.log("state>>>>"+JSON.stringify(this.state.limit));
    //         let olddata=data.data;
    //         let param={table:data.meta.table,...data.meta.query,skip:this.state.limit,limit:this.state.limit+20};
    //         // console.log("param in list>>>>>"+JSON.stringify(param))
    //         this.setState({loading:true})
    //         let newdata=await webConnect.find(param);
    //         // console.log("newdata>>>>"+JSON.stringify(newdata));
    //         if(newdata && newdata.data){
    //            olddata.push(...newdata.data);
    //            data.data=olddata;
    //        }
    //         this.setState({loading:false,limit:this.state.limit+20})
    //
    //     }
    // }

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
        var  {value,onrowTouch,data:{meta,data}}= this.props;
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
                        <RenderRow  rowData={rowData} childrendata={childrendata} fields={fieldinfo} ></RenderRow>

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
        this.detail = this.detail.bind(this);
        this.state={checked:true}
    }
    detail(detailpath,rowData){
        const {path,params}=this.props;
        if(detailpath){
            params.reload=true
            params.isdetail=true
            params.filter={_id:rowData._id}
            path.push({path:detailpath})
        }

    }
    getFields(childrendata,fields,rowData={}) {
        let fieldsdata = [];
        // fields.sort(function(a, b) {
        //     return parseFloat(a.index) - parseFloat(b.index);
        // });

        childrendata.map((child, i) => {
            let {value, label, display} = child.props;
            let fieldinfo = fields[value];
            let props = {};
            if (fieldinfo && fieldinfo.type == "number") {
                props = {
                    ...childrendata[i].props,
                    key: {i},
                    type: "number",
                    info: {...fieldinfo, id: value},
                    value: rowData[value],
                    onChange: this.handleChange
                };
            } else if (fieldinfo && fieldinfo.type == "date") {
                props = {
                    ...childrendata[i].props,
                    key: {i},
                    info: {...fieldinfo, id: value},
                    defaultValue: rowData[value],
                    onChange: (e) => {
                        this.onDateChange(e)
                    }
                };
            } else if (fieldinfo && fieldinfo.type == "fk") {
                props = {
                    ...childrendata[i].props,
                    key: {i},
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
                    key: {i},
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
        return (<div onClick={()=>{this.detail(detailpath,rowData)}} class="content">
            {this.getFields(childrendata,fields,rowData)}
        </div>)

    }
}




export default NestedList



