'use strict';
import React from "react";
import  ReactDOM  from 'react-dom';
import AutoSelect from './autoSelect';
 import AutoSelectNew from './autoSelectNew';
import DateCom from './date';

class Field extends React.Component{
    constructor(p){
        super(p);
        // console.log("fiels state before>>>"+JSON.stringify(this.state))
        this.state={value:this.props.value},
            // console.log("fiels state>>>"+JSON.stringify(this.state))
        this.onFieldFocusOut=this.onFieldFocusOut.bind(this);
    }
    componentWillUnmount(){
        // this.props.unmount({dataname:"autoload"})
    }
    componentWillReceiveProps(newProps){
        // console.log("newProps>>>>"+JSON.stringify(newProps))
        if(newProps && newProps.id==this.props.info.id){
            this.setState({value:newProps.value},()=>{
            });
        }

    }
    onChange(e){
        // console.log("e.target.value>>>>>>"+e.target.value);
        this.setState({value:e.target.value},()=>{
        });
        if(this.props.info.type=='boolean'){
                this.props.onChange(this.props.info.id, e.target.checked);    
        }
        else{
         this.props.onChange(this.props.info.id, e.target.value);
         // console.log("called success")
        }
    }
    onDateChange(date){
        // console.log("enter in onDateChange.........."+date);
        // console.log("Object.prototype.toString.call(date)............"+Object.prototype.toString.call(date));
        this.props.onChange(this.props.info.id, date);
    }
    onFieldFocusOut(value){
     this.props.onChange(this.props.info.id, value);   
    }
    render(){
        var  {detail}= this.props;
        // console.log("fiels state render>>>"+JSON.stringify(this.state))
        // console.log("fields props are>>>>"+JSON.stringify(this.props))
        //  console.log("field render again")
        var dateStyle={};
        var stringStyle={};
        var numberStyle={};
        dateStyle['width']=this.props.info.width;
        dateStyle['border']='0px solid';
        dateStyle['color']='black';
        dateStyle['height']=this.props.info.height;

        stringStyle['width']=this.props.info.width;
        stringStyle['height']=this.props.info.height;
        stringStyle['color']="black";
        stringStyle['border']='0px solid';

        numberStyle['border']='0px solid';
        numberStyle['width']=this.props.info.width;
        numberStyle['color']="black";
        numberStyle['height']=this.props.info.height;
        if(detail){
            numberStyle['borderBottom']='1px solid lightgray';
            stringStyle['borderBottom']='1px solid lightgray';
            dateStyle['borderBottom']='1px solid lightgray';
        }else{
            delete numberStyle.borderBottom
            delete stringStyle.borderBottom
            delete dateStyle.borderBottom
        }
        var fieldView;
        var placeholder='Enter the '+this.props.info.label;

            if(this.props.info.type=="string"){
                fieldView=<input  style={stringStyle} key={this.props.info.id} placeholder={!this.props.value && placeholder} value={this.state.value} onChange={(e)=>{this.onChange(e)}} disabled={!this.props.info.is_edit}/>
            }
            else if(this.props.info.type=="number"){
                fieldView=<input   style={numberStyle} type="number" key={this.props.info.id} placeholder={!this.props.value && placeholder} value={this.props.value} onChange={(e)=>{this.onChange(e)}}  disabled={!this.props.info.is_edit}/>
            }
            else if(this.props.info.type=="date"){
                fieldView=<DateCom detail={detail || false} defaultValue={this.props.value} info={this.props.info} disabled={!this.props.info.is_edit} onChange={(e)=>{this.onDateChange(e)}}/>
            }
            else if(this.props.info.type=="select"){
                 fieldView=<AutoSelectNew  detail={detail || false} placeholder={this.props.info.label} onChange={this.props.onChange} info={this.props.info} callFieldFocusOut={this.onFieldFocusOut} possibleValues={this.props.info.possibleValues}  defaultValue={this.props.value || ''}  disabled={!this.props.info.is_edit} />
            }
            else if(this.props.info.type=="fk"){
                      fieldView=<AutoSelect  detail={detail || false}  callFieldFocusOut={this.onFieldFocusOut} info={this.props.info} onChange={this.props.onChange} defaultValue={this.props.value}  disabled={!this.props.info.is_edit}/>
            }
        return (
            <div>           
                {fieldView}
            </div>
            )
    }
}

// export default Field = connect(store=> {
//         return {
//         }
//     },{DETAIL:actions.DETAIL,unmount:actions.unmount})(Field);

export default Field;

