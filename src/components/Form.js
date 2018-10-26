import React ,{Component} from "react";
import Button from "./Button"
import {actions} from './../redux'
import {connect, Provider} from 'react-redux';
import Field from './field';
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
        // console.log("update>>>>"+JSON.stringify(this.updates))
        this.updates[key] =value
            }
    componentWillUnmount(){
        // console.log("unmount from form")
        this.props.unmount({dataname:"formdata"})
    } 
    calcel(){
        // console.log("HIDEFORM from form"+JSON.stringify(this.props))
        this.props.unmount({dataname:"formdata"})
    }
    onInsert(dataset,rowData){
         // console.log("rowData>>>>"+JSON.stringify(rowData))
         // console.log("updates>>>>"+JSON.stringify(this.updates))
        if(rowData && rowData._id){
            this.props.onUpdate({data:this.updates,dataset:dataset,filter:{_id:rowData._id}});
        }else{
            this.props.onInsert({data:this.updates,dataset:dataset});
        }
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
        var  {fields,rowData,create,dataset}= this.props;
                // console.log("formdata>>>>>>"+JSON.stringify(this.props))
                    return (
                        <div style={{"max-height": 900,"min-height": 900,"background-color": "white",  "borderLeft": "0.5px solid rgb(231, 231, 231)", "borderTop": "0.5px solid rgb(231, 231, 231)", "cursor": "pointer"}}>
                            <div style={{flexDirection:'row',flex:1,"display":'flex',"min-height": "50px", "background-color": "rgb(235, 235, 235)","align-items": "center","text-align": "center","justify-content": "flex-end", "padding": "0px 10px"}}>
                            <div style={{"paddingLeft":20}} onClick={()=>{this.onInsert(dataset,rowData)}}>Save</div>
                            <div style={{"paddingLeft":20}} onClick={()=>{this.calcel()}}>Cancel</div>
                            </div>
                            {this.getFields(fields,rowData)}
                        </div>
                    )
    }
}

//connect to redux
export default Form = connect(state=>{
    // console.log("form state>>>>"+JSON.stringify(state))
    return state
}, {onInsert:actions.onInsert,onUpdate:actions.onUpdate,unmount:actions.unmount,HIDEFORM:actions.HIDEFORM})(Form);

/**
 * Created by root on 20/10/16.
 */

// <div style={{flex:1}}>{renderField}</div>
// <input type="text" name={renderField} defaultValue={rowData && rowData[renderField]} onChange={this.handleChange}/>
