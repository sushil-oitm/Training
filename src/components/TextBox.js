'use strict';
import React from "react";
import  ReactDOM  from 'react-dom';


class TextInput extends React.Component{
    constructor(p){
        super(p);
        // this.state={value:this.props.value}
    }
    componentWillUnmount(){
        // this.props.unmount({dataname:"autoload"})
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
    render(){
        var  {detail}= this.props;
         // console.log("field render called>>>"+JSON.stringify(this.state))
        //  console.log("fields props are>>>>"+JSON.stringify(this.props))
        // console.log("field render again")
        var stringStyle={};
        stringStyle['width']=this.props.info.width;
        stringStyle['height']=this.props.info.height;
        stringStyle['color']="black";
        stringStyle['backgroundColor']='white';
        stringStyle['border']='0px solid';
        if(detail){
            stringStyle['borderBottom']='1px solid lightgray';
        }else{
            delete stringStyle.borderBottom
        }
        var placeholder='Enter the value '+(this.props.info && this.props.info.label && this.props.info.label || "");
        var fieldView=<input  style={stringStyle} key={this.props.info.id} placeholder={!this.props.value && placeholder} value={this.props.value} onChange={(e)=>{this.onChange(e)}} />
        return (
            <div style={{flex:1}}>
                {fieldView}
            </div>
        )
    }
}


export default TextInput;

