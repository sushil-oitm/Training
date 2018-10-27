import React ,{Component} from "react";
import { observer, Provider, inject } from "mobx-react";
import Field from './field';
import  {umbrella,menuicon,detailIcon,insertIcon,deleteIcon} from '../images/images'
import Style from './../theme/styles'
import "../CSS/List.css"


@inject("path")
@inject("params")
@inject("webConnect")
@inject("data")
@observer
class List extends Component {
    constructor(props){
        super(props);
        this.listdetail = this.listdetail.bind(this);
        this.deletedata = this.deletedata.bind(this);
        if(!this.state || !this.state.popupMENU){
            this.state={popupMENU:Style.menu.popupMENU}
        }
    }
    componentWillUnmount(){
         console.log("list unmount called>>>")

    }
    listdetail(detailpath){
        const {path,params}=this.props;
        params.reload=true;
        params.iscreate=true;
        params.filter={_id:"5bbfffe1ab06470200fe805d"}
        path.push({path:detailpath})
    }
    async deletedata(rowData,table) {
        let {params,webConnect,path}=this.props;
        let finalupdates= {table:table,updates:{remove:{_id:rowData._id}}}
         let deleterow= await webConnect.invoke({"id":"_save",param:finalupdates})
        if(!deleterow.result){
            alert("Error in delete "+deleterow);
            return;
        }
        console.log("deleterow>>>>"+JSON.stringify(deleterow))
        let newpath=path[path.length-1];
        path.pop()
        params["reload"]=true;
        path.push(newpath)

    }
    render(){
        var  {fields,data:{data,meta},onrowTouch,filter={}}= this.props;
        // console.log("props in list>>>>>"+JSON.stringify(this.props))
        //  console.log("meta in list>>>>>"+JSON.stringify(meta))
        //  console.log("fields in list>>>>>"+JSON.stringify(fields))
        let finalfields=mergeFields(fields,meta.fieldsinfo);
        // console.log("finalfields>>>>"+JSON.stringify(finalfields))
        if(!data){
            return <div>loading.......</div>
        }
        return (
            <div>
                <div class="wrapper">
                {data.map((rowData,index)=>(<div class="list_data" key={index}>
                    <RenderRow detailpath={onrowTouch} rowData={rowData} fields={finalfields}></RenderRow>

                        {<div style={{paddingLeft:"10"}}>
                        <img src={deleteIcon()}  onClick={(e)=>{this.deletedata(rowData,meta.table)}} height="35px" width="20px" style={{"padding-top":"15px"}}/>
                    </div>}

                </div>))}
                </div>
                {<div class="add_wrapper">
                    <div onClick={(e)=>{this.listdetail(onrowTouch)}} class="add_button"><span>Add</span></div>
                </div>}

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
    }
    detail(detailpath,rowData){
        const {path,params}=this.props;
        params.reload=true
        params.isdetail=true
        params.filter={_id:rowData._id}
        path.push({path:detailpath})
    }
    getFields(fields,rowData={}){
        let fieldsdata=[];
        fields.sort(function(a, b) {
            return parseFloat(a.index) - parseFloat(b.index);
        });
        for(let i=0;i<fields.length;i++){
            fieldsdata.push(
                    <div key={i} class="list_wrapper">
                    <div class="list_inner_wrapper">
                    <Field key={i+"__"} id={fields[i].id} value={rowData[fields[i].id]} info={fields[i]} onChange={this.handleChange}></Field>
                    </div>
                    </div>
            )
        }
        return fieldsdata;
    }
    render(){
        var  {fields,rowData,detailpath}= this.props;
        // console.log("props in render row>>>>>"+JSON.stringify(this.props))
        // console.log("rowData in RenderRow>>>>>"+JSON.stringify(rowData))
        // console.log("fields in RenderRow>>>>>"+JSON.stringify(fields))
        return (<div onClick={()=>{this.detail(detailpath,rowData)}} class="content">
            {this.getFields(fields,rowData)}
        </div>)

    }
}

const mergeFields=(fields,sfields)=>{
    return fields.map(fdata=>{
        let key=fdata.id
        if(typeof sfields[key]== "object"){
            fdata={...fdata,...sfields[key]}
        }else{
            fdata={...fdata,type:sfields[key]}
        }
        fdata={...fdata}
        return fdata;
    })
}


export default List



