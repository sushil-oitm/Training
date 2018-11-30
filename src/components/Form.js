import React ,{Component} from "react";
import {observable, observe, isObservableArray,reaction, extendObservable} from "mobx";
import {inject, observer} from "mobx-react";


let viewstore = observable.object({});

@inject("path")
@inject("params")
@inject("data")
@inject("webConnect")
@observer
class Form extends Component {
    constructor(props){
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleFieldsChange = this.handleFieldsChange.bind(this);
        this.onInsert = this.onInsert.bind(this);
        this.getFields = this.getFields.bind(this);
        this.calcel = this.calcel.bind(this);
        this.updates = {};
        let vdta=this.props.rowData ? this.props.rowData:this.props.data && this.props.data.data && this.props.data.data.length > 0 ? this.props.data.data[0]:{};
        // this.viewdata = observable({...vdta});
        viewstore={};
        extendObservable(viewstore, { ...vdta,name:null,dob:null});
        const reaction3 = reaction(
            () => viewstore && viewstore.name,
            (name, reaction) => {
                console.log("name in reaction" , name);
                console.log("reaction name is"+JSON.stringify(reaction));
                viewstore["official_email_id"]=name
                // reaction.dispose();
            }
        );
        const reaction4 = reaction(
            () => viewstore && viewstore.dob,
            (dob, reaction) => {
                console.log("dob in reaction" + dob);
                console.log("reaction name is" + reaction);
                viewstore["joining_date"]=dob

            }
        );
    }
    handleChange(key,value) {
        if(this.updates[key]){
            value={...this.updates[key],...value};
        }
        this.updates[key] =value;
        console.log(" before viewstore>>>>"+JSON.stringify(viewstore))
            viewstore[key]=value;
        console.log("viewstore>>>>"+JSON.stringify(viewstore))
        console.log("after update>>>>"+JSON.stringify(this.updates))
    }
    handleFieldsChange(key,value) {
        this.updates[key] =value;
        console.log("update123>>>>"+JSON.stringify(this.updates))
        viewstore[key]=value;

        console.log("viewstore>>>>"+JSON.stringify(viewstore))
    }
    onDateChange({id,date}){
         // console.log("enter in onDateChange.........."+date);
         // console.log("enter in onDateChange.........."+id);
         // console.log("enter in id.........."+id);
         // console.log("Object.prototype.toString.call(date)............"+Object.prototype.toString.call(date));
       this.handleChange(id, date);
    }
    onFieldFocusOut({key,value}){
        this.handleChange(key, value);
    }

    componentWillUnmount(){
        // console.log("unmount from form")
        // this.props.unmount({dataname:"formdata"})
    } 
    calcel(){
        const {path,params}=this.props;
        // console.log("HIDEFORM from form"+JSON.stringify(this.props))
        // this.props.unmount({dataname:"formdata"})
        params.reload=true;
        delete params.isdetail;
        delete params.iscreate;
        delete params.filter;
        path.pop()
    }
    checkforarray(meta,isInsert){
      let {fieldsinfo}=meta;
      for(let f1 in fieldsinfo){
          let type=fieldsinfo[f1].type;
          if(type=="object"){
            let currentupdate=this.updates[f1];
            console.log("currentupdate>>>>>>"+JSON.stringify(currentupdate))
              if(isInsert){
                  let insertNestedArray=[];
                  for(let c1 in currentupdate){
                      let cdata=currentupdate[c1];
                      if(cdata.op=="insert"){
                          delete cdata.op;
                          delete cdata._id;
                          insertNestedArray.push(cdata)
                      }
                  }
                  if(insertNestedArray && insertNestedArray.length>0){
                      this.updates[f1]={insert:insertNestedArray};
                  }
              }else{
                  let finalupdate={};
                  let insertNestedArray=[];
                  let updateNestedArray=[];
                  let removeNestedArray=[];
                  for(let c1 in currentupdate){
                      let cdata=currentupdate[c1];
                      if(cdata.op=="insert"){
                          delete cdata.op;
                          delete cdata._id;
                          insertNestedArray.push(cdata)
                      }else if(cdata.op=="remove"){
                          delete cdata.op;
                          removeNestedArray.push(cdata)
                      }else if(cdata.op=="update"){
                          let updateid=cdata._id;
                          delete cdata.op;
                          delete cdata._id;
                          let newupdate={_id:updateid,changes:cdata}
                          updateNestedArray.push(newupdate)
                      }
                  }
                  if(insertNestedArray && insertNestedArray.length>0){
                      finalupdate.insert=insertNestedArray;
                  }
                  if(removeNestedArray && removeNestedArray.length>0){
                      finalupdate.remove=removeNestedArray;
                  }
                  if(updateNestedArray && updateNestedArray.length>0){
                      finalupdate.update=updateNestedArray;
                  }
                  this.updates[f1]=finalupdate;
              }
          }
      }

    }
   async onInsert(table,rowData){
        let {params,webConnect,path,data:{meta}}=this.props;
         // console.log("rowData>>>>"+JSON.stringify(rowData))
         // console.log("updates>>>>"+JSON.stringify(this.updates))

        if(rowData && rowData._id && params.isdetail){
            this.checkforarray(meta,false)
            console.log("checkforarray success>>>>"+JSON.stringify(this.updates))
            let finalupdates= {table:table,updates:{update:{_id:rowData._id,changes:{$set:this.updates}}}}
            let updaterow= await webConnect.invoke({"id":"_save",param:finalupdates})
            // console.log("updaterow>>>>"+JSON.stringify(updaterow))
            if(!updaterow.result){
                alert("Error in updaterow "+updaterow);
                return;
            }
        }else if(params.iscreate){
            this.checkforarray(meta,true)
            console.log("checkforarray success>>>>"+JSON.stringify(this.updates))
            let finalupdates= {table:table,updates:{insert:this.updates}}
            let insertrow= await webConnect.invoke({"id":"_save",param:finalupdates})
            // console.log("insertrow>>>>"+JSON.stringify(insertrow))
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
    getFields(fields,rowData={},childrendata){
        let fieldsdata=[];
        let fieldsObjectdata=[];
        let pre="";
        {childrendata.map((child, i) =>{
           let curr=""
            if(i % 2 == 0){
                let {value,label,display}=child.props;
                let fieldinfo=fields[value];
                 // console.log("fieldinfo>>>>>>"+JSON.stringify(fieldinfo));
                let props={ ...childrendata[i].props,key:{i},info:{...fieldinfo,id:value}};
                if(fieldinfo && fieldinfo.type=="number"){
                    props = {...props,type:"number",key:{i},value:rowData[value],onChange:this.handleFieldsChange};
                }else if(fieldinfo && fieldinfo.type=="date"){
                    props = {...props,defaultValue:rowData[value],key:{i},detail:"true",onChange:(e)=>{this.onDateChange(e)}};
                }else if(fieldinfo && fieldinfo.type=="fk"){
                    props = {...props,key:{i},info:{...fieldinfo,id:value,display:display},defaultValue:rowData[value],detail:"true",callFieldFocusOut:(e)=>{this.onFieldFocusOut(e)},onChange:this.handleChange};
                }else{
                    props = {...props,value:rowData[value],key:{i},onChange:this.handleFieldsChange};
                }


                if(fieldinfo && fieldinfo.type=="object"){
                    props = {...props,data:this.props.data,handleChange:this.handleChange,callFieldFocusOut:(e)=>{this.onFieldFocusOut(e)},onDateChange:(e)=>{this.onDateChange(e)}};
                    let singlechild=React.cloneElement(child, props);
                    pre=<div style={{flex:1,display:"flex"}}>
                        {singlechild}
                    </div>
                }else{
                    let singlechild=React.cloneElement(child, props);
                    pre=<div style={{flexDirection:'column',display:'flex', flex:1, margin:30 ,"background-color": "white", "cursor": "pointer"}}>
                        <div style={{flex:1,display:"flex",alignItems: "center"}}><span style={{fontWeight: 'bold', pading:10}}>{label}</span></div>
                        <div style={{flex:1,display:"flex",alignItems: "center"}}>
                            {singlechild}
                        </div>
                    </div>
                }


            }else{
                let {value,label,display}=child.props;
                let fieldinfo=fields[value];
                // console.log("fieldinfo>>>>>>"+JSON.stringify(fieldinfo));
                let props={ ...childrendata[i].props,key:{i},info:{...fieldinfo,id:value}};
                if(fieldinfo && fieldinfo.type=="number"){
                    props = {...props,type:"number",key:{i},value:rowData[value],onChange:this.handleFieldsChange};
                }else if(fieldinfo && fieldinfo.type=="date"){
                    props = {...props,defaultValue:rowData[value],key:{i},detail:"true",onChange:(e)=>{this.onDateChange(e)}};
                }else if(fieldinfo && fieldinfo.type=="fk"){
                    props = {...props,key:{i},info:{...fieldinfo,id:value,display:display},defaultValue:rowData[value],detail:"true",callFieldFocusOut:(e)=>{this.onFieldFocusOut(e)},onChange:this.handleChange};
                }else{
                    props = {...props,key:{i},value:rowData[value],onChange:this.handleFieldsChange};
                }
                if(fieldinfo && fieldinfo.type=="object"){
                    props = {...props,handleChange:this.handleChange,callFieldFocusOut:(e)=>{this.onFieldFocusOut(e)},onDateChange:(e)=>{this.onDateChange(e)}};
                    let singlechild=React.cloneElement(child, props);
                    curr= <div style={{flex:1,display:"flex",alignItems: "center"}}>
                        {singlechild}
                    </div>
                }else{
                    let singlechild=React.cloneElement(child, props);
                    curr=<div style={{flexDirection:'column',display:'flex', flex:1, margin:30 ,"background-color": "white", "cursor": "pointer"}}>
                        <div style={{flex:1,display:"flex",alignItems: "center"}}><span style={{fontWeight: 'bold', pading:10}}>{label}</span></div>
                        <div style={{flex:1,display:"flex",alignItems: "center"}}>
                            {singlechild}
                        </div>
                    </div>
                }

            }
        if((i % 2 != 0) || (i==childrendata.length-1)){
            fieldsdata.push(
                <div style={{flexDirection:'row',display:'flex',margin:30 , flex:1}}>
                    {pre}
                    {curr}
                </div>
            )
        }

        })}
        return fieldsdata;
    }
    render(){
        var  {rowData,data:{data,meta},children}= this.props;
        rowData=rowData ? rowData:data && data.length > 0 ? data[0]:{};
        rowData=viewstore;
        const childrendata = React.Children.toArray(children);
        console.log("fieldsinfo in form render>>>>>>"+JSON.stringify(meta.fieldsinfo))
        console.log("rowData in form render>>>>>>"+JSON.stringify(rowData))
        return (
                        <div style={{"min-height": 700,"background-color": "white",  "borderLeft": "0.5px solid rgb(231, 231, 231)", "borderBottom": "0.5px solid rgb(231, 231, 231)","borderTop": "0.5px solid rgb(231, 231, 231)", "cursor": "pointer"}}>
                            <div style={{flexDirection:'row',flex:1,"display":'flex',"min-height": "50px", "background-color": "rgb(235, 235, 235)","align-items": "center","text-align": "center","justify-content": "flex-end", "padding": "0px 10px"}}>
                            <div style={{"paddingLeft":20}} onClick={()=>{this.onInsert(meta.table,rowData)}}>Save</div>
                            <div style={{"paddingLeft":20}} onClick={()=>{this.calcel()}}>Cancel</div>
                            </div>
                            {this.getFields(meta.fieldsinfo,rowData,childrendata)}
                        </div>
                    )
    }
}

export default Form;