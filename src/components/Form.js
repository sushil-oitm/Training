import React ,{Component} from "react";
import Field from './field';
import {inject, observer} from "mobx-react/index";


@inject("path")
@inject("params")
@inject("data")
@inject("webConnect")
@observer
class Form extends Component {
    constructor(props){
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.onInsert = this.onInsert.bind(this);
        this.getFields = this.getFields.bind(this);
        this.calcel = this.calcel.bind(this);
        this.updates = {};
    }
    handleChange(key,value) {
        console.log("update>>>>"+JSON.stringify(this.updates))
        this.updates[key] =value
            }
    componentWillUnmount(){
        // console.log("unmount from form")
        // this.props.unmount({dataname:"formdata"})
    } 
    calcel(){
        const {path,params}=this.props
        // console.log("HIDEFORM from form"+JSON.stringify(this.props))
        // this.props.unmount({dataname:"formdata"})
        params.reload=true;
        delete params.isdetail;
        delete params.iscreate;
        delete params.filter;
        path.pop()
    }
   async onInsert(table,rowData){
        let {params,webConnect,path}=this.props;
         // console.log("rowData>>>>"+JSON.stringify(rowData))
         // console.log("updates>>>>"+JSON.stringify(this.updates))
        if(rowData && rowData._id && params.isdetail){
            let finalupdates= {table:table,updates:{update:{_id:rowData._id,changes:{$set:this.updates}}}}
            let updaterow= await webConnect.invoke({"id":"_save",param:finalupdates})
            console.log("updaterow>>>>"+JSON.stringify(updaterow))
            if(!updaterow.result){
                alert("Error in updaterow "+updaterow);
                return;
            }
        }else if(params.iscreate){
            let finalupdates= {table:table,updates:{insert:this.updates}}
            let insertrow= await webConnect.invoke({"id":"_save",param:finalupdates})
            console.log("insertrow>>>>"+JSON.stringify(insertrow))
            if(!insertrow.result){
                alert("Error in insertrow "+insertrow);
                return;
            }
        }

       delete params.isdetail;
       delete params.iscreate;
       delete params.filter;
       params["reload"]=true;
       path.pop();
    }
    getFields(fields,rowData={}){
        let fieldsdata=[];
        fields.sort(function(a, b) {
            return parseFloat(a.index) - parseFloat(b.index);
        });
        for(let i=0;i<fields.length;i=i+2){
            fieldsdata.push(
                <div style={{flexDirection:'row',display:'flex',padding:10 , flex:1}}>
                    <div style={{flexDirection:'row',display:'flex', flex:1, margin:10 ,"background-color": "white", "cursor": "pointer"}}>
                        <div style={{width:90,display:"flex",alignItems: "center"}}><span style={{pading:10}}>{fields[i].label}</span></div>
                        <div style={{width:222,display:"flex",alignItems: "center","border": "0.5px solid rgb(231, 231, 231)"}}>
                            <Field id={fields[i].id} detail={true} value={rowData[fields[i].id]} info={fields[i]} onChange={this.handleChange}></Field>
                        </div>

                    </div>
                        {i+1<fields.length &&
                        <div style={{flexDirection:'row',display:'flex', flex:1, margin:10 ,"background-color": "white", "cursor": "pointer" }}>
                            <div style={{width:90,display:"flex",alignItems: "center"}}><span style={{pading:10}}>{fields[i+1].label}</span></div>
                            <div style={{width:222,display:"flex",alignItems: "center","border": "0.5px solid rgb(231, 231, 231)"}}>
                            <Field id={fields[i+1].id} detail={true} value={rowData[fields[i+1].id]} info={fields[i+1]} onChange={this.handleChange}></Field>
                        </div>
                        </div>
                            }
                </div>
            )
        }
        return fieldsdata;
    }
    render(){
        var  {fields,rowData,data:{data,meta}}= this.props;
        rowData=rowData ? rowData:data && data.length > 0 ? data[0]:{};
        let finalfields=mergeFields(fields,meta.fieldsinfo);
        return (
                        <div style={{"max-height": 900,"min-height": 900,"background-color": "white",  "borderLeft": "0.5px solid rgb(231, 231, 231)", "borderTop": "0.5px solid rgb(231, 231, 231)", "cursor": "pointer"}}>
                            <div style={{flexDirection:'row',flex:1,"display":'flex',"min-height": "50px", "background-color": "rgb(235, 235, 235)","align-items": "center","text-align": "center","justify-content": "flex-end", "padding": "0px 10px"}}>
                            <div style={{"paddingLeft":20}} onClick={()=>{this.onInsert(meta.table,rowData)}}>Save</div>
                            <div style={{"paddingLeft":20}} onClick={()=>{this.calcel()}}>Cancel</div>
                            </div>
                            {this.getFields(finalfields,rowData)}
                        </div>
                    )
    }
}
const mergeFields=(fields,sfields={})=>{
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

export default Form;