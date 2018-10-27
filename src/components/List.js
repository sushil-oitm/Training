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
    listdetail(rowData){
        const {path,params}=this.props;
        console.log("delete called>>>>",rowData);
        params.reload=true
        path.push({path:"/resources-detail"})
    }
    async deletedata(rowData) {
        let {params,webConnect}=this.props;
         console.log("delete called>>>>",rowData)
        let finalupdates= {table:"Resource",updates:{remove:{_id:rowData._id}}}
        let deleterow= await webConnect.invoke({"id":"_save",param:finalupdates})
        params.reload=true;
        console.log("params>>>>>",params)

    }
    render(){
        var  {dataset,fields,data,onrowTouch,filter={}}= this.props;
        console.log("props in list>>>>>"+JSON.stringify(this.props))
        console.log("data in list>>>>>"+JSON.stringify(data))
        console.log("fields in list>>>>>"+JSON.stringify(fields))
        if(!data){
            return <div>loading.......</div>
        }
        return (
            <div>
                <div class="wrapper">
                {data.map((rowData,index)=>(<div class="list_data" key={index}>
                    <RenderRow detailpath={onrowTouch} rowData={rowData} fields={fields}></RenderRow>

                        {<div style={{paddingLeft:"10"}}>
                        <img src={deleteIcon()}  onClick={(e)=>{this.deletedata(rowData,dataset)}} height="35px" width="20px" style={{"padding-top":"15px"}}/>
                    </div>}

                </div>))}
                </div>
                {<div class="add_wrapper">
                    <div onClick={(e)=>{this.detail({})}} class="add_button"><span>Add</span></div>
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
    detail(detailpath){
        const {path,params}=this.props;
        params.reload=true
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
        console.log("props in render row>>>>>"+JSON.stringify(this.props))
        console.log("rowData in RenderRow>>>>>"+JSON.stringify(rowData))
        console.log("fields in RenderRow>>>>>"+JSON.stringify(fields))
        return (<div onClick={()=>{this.detail(detailpath)}} class="content">
            {this.getFields(fields,rowData)}
        </div>)

    }
}


export default List



