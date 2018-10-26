import React ,{Component} from "react";
import { observer, Provider, inject } from "mobx-react";
import Field from './field';
import  {umbrella,menuicon,detailIcon,insertIcon,deleteIcon} from '../images/images'
import Style from './../theme/styles'
import Popup from './menupopup'


@inject("path")
@inject("params")
@inject("webConnect")
@inject("userStore")
@inject("data")
@observer
class List extends Component {
    constructor(props){
        super(props);
        this.detail = this.detail.bind(this);
        this.deletedata = this.deletedata.bind(this);
        if(!this.state || !this.state.popupMENU){
            this.state={popupMENU:Style.menu.popupMENU}
        }
    }
    componentWillUnmount(){
        // console.log("list unmount called>>>")
        this.props.unmount({dataname:"listdata"})
    }
    detail(rowData){
        this.props.DETAIL(rowData)
    }
    deletedata(rowData,dataset) {
        // console.log("delete called>>>>"+dataset)
        let data={_id:rowData._id,dataset:dataset}
        // console.log("data>>>>",data)
        this.props.onDelete(data)
    }
    render(){
        var  {dataset,fields,data,detail,filter={}}= this.props;
        console.log("data in list>>>>>"+JSON.stringify(data))
        console.log("fields in list>>>>>"+JSON.stringify(fields))
        // data=this.props[dataset+"-listdata"]
        // data=this.props["listdata"]
        //   console.log("list render called"+JSON.stringify(data))
         // console.log("dataset"+dataset)
        if(!data){
            return <div>loading.......</div>
        }
        return (
            <div>
                <div style={{"max-height": 900,"min-height": 700}}>
                {data.map((rowData,index)=>(<div style={{flexDirection:'row',flex:1,display:'flex',"margin-bottom": 0, "background-color": "white", "padding": "10px", "border-bottom": "0.5px solid rgb(231, 231, 231)", "cursor": "pointer"}} key={index}>
                    <RenderRow DETAIL={this.props.DETAIL} rowData={rowData} fields={fields}></RenderRow>

                        {/*{!detail &&<div style={{paddingLeft:"10"}}>*/}
                        {/*<img src={deleteIcon()}  onClick={(e)=>{this.deletedata(rowData,dataset)}} height="20px" width="20px"/>*/}
                    {/*</div>}*/}

                </div>))}
                </div>
                {/*{!detail && <div style={{paddingLeft:20,paddingTop:20,"justify-content": "flex-end","display": "flex"}}>*/}
                    {/*<div onClick={(e)=>{this.detail({})}} style={{display:"flex",height: 50,width: 50,"border-radius": 25, "background-color": "yellow","text-align": "center", "justify-content": "center", "align-items": "center"}}><span>Add</span></div>*/}
                {/*</div>}*/}

                </div>

            )
    }
}
class RenderRow extends Component {
    constructor(props){
        super(props);
        this.getFields = this.getFields.bind(this);
        this.detail = this.detail.bind(this);
    }
    detail(rowData){
        this.props.DETAIL(rowData)
    }
    getFields(fields,rowData={}){
        let fieldsdata=[];
        fields.sort(function(a, b) {
            return parseFloat(a.index) - parseFloat(b.index);
        });
        for(let i=0;i<fields.length;i++){
            fieldsdata.push(
                    <div key={i} style={{flexDirection:'row',display:'flex', flex:1 }}>
                    <div style={{flex:1}}>
                    <Field key={i+"__"} id={fields[i].id} value={rowData[fields[i].id]} info={fields[i]} onChange={this.handleChange}></Field>
                    </div>
                    </div>
            )
        }
        return fieldsdata;
    }
    render(){
        var  {fields,rowData}= this.props;
        console.log("rowData in RenderRow>>>>>"+JSON.stringify(rowData))
        console.log("fields in RenderRow>>>>>"+JSON.stringify(fields))
        return (<div onClick={()=>{this.detail(rowData)}} style={{flexDirection:'row',flex:1,display:'flex'}}>
            {this.getFields(fields,rowData)}
        </div>)

    }
}


export default List



