'use strict';
import React from "react";
import  ReactDOM  from 'react-dom';
import Popup from './popup';
import  {downArrow,down} from '../images/images'
import {inject, observer} from "mobx-react/index";
let $ = require('jquery');
let maxHeightPopup=200;
let listItemHeight=18;
let styles={'dropDown':{
    display:"none",
    position: "absolute",
    width:200,
    maxHeight:maxHeightPopup,
    overflowY:"auto",
    cursor:"pointer",
    backgroundColor: "beige",
    zIndex:'1000',
    boxShadow:"0px 8px 16px 0px rgba(0,0,0,0.2)"
},
    inputStyle:{
        // width  : 206,
        border:'none',
        overflow:"hidden",
        // padding:"5px",
        color:"black",
        backgroundColor:"white",
        // height:40
          'borderBottom':'1px solid lightgray'
     }
}

@inject("webConnect")
@observer
class AutoSuggest extends React.Component {
    constructor(p) {
        super(p);
        this.state={"selectedValue":"", value:this.props.defaultValue|| {},  allValues:this.props.possibleValues||[],"focused":0 ,"selected":false ,"isFocused":false, "filter":this.props.filter ,possibleValues:[],'dropDownBehaviour':{}};
        this.onChange=this.onChange.bind(this);
        this.onArrowClick=this.onArrowClick.bind(this);
        this.onKeyDown=this.onKeyDown.bind(this);
        this.onfocusout=this.onfocusout.bind(this);
        this.onselect=this.onselect.bind(this);
        this.onOutSideClick=this.onOutSideClick.bind(this);
        // this.callFieldFocusOut=this.callFieldFocusOut.bind(this)

    }
    componentWillReceiveProps(newProps){
          // console.log("newProps>>>>"+JSON.stringify(newProps))
        this.setState({value:newProps.defaultValue},()=>{
        });
    }

    onOutSideClick(){
        this.setState({possibleValues:[],"dropDownBehaviour":[],"value":"","focused":0,"isFocused":false},()=>{
        });
    }
    componentWillUnmount(){
        // this.props.unmount({dataname:this.props.info.dataset+"-autodata"})
    }
   async onChange(e) {
       let {params,webConnect,path,info}=this.props;
        let elementValue=e.target.value;
        // console.log("elementValue>>>>"+elementValue)
       let possibleValues=[];
       let {table,display}=info;
       if(table && display){
           let paramValue={table:table,fields:{[display]:1}}
           let  allValues=await webConnect.find(paramValue);
           allValues=allValues.data || [];
           if(elementValue!=null &&  elementValue!=''){
               for(let i=0;i<allValues.length;i++){
                   if(allValues[i].name.toLowerCase().indexOf(elementValue.toLowerCase())==0){
                       possibleValues.push(allValues[i]);
                   }
               }
           }
           let dropDownBehaviour=JSON.parse(JSON.stringify(this.state.dropDownBehaviour));
           dropDownBehaviour['display']='block';
           this.setState({dropDownBehaviour,possibleValues,"value":{[display]:elementValue},"selected":false, "isFocused":true,"focused":0});
       }
   }
    async onArrowClick(info){
        let {params,webConnect,path}=this.props;
        let {table,display}=info;
        if(table && display){
            let paramValue={table:table,fields:{[display]:1}}
            let  possibleValues=await webConnect.find(paramValue);
            possibleValues=possibleValues.data || [];
            let dropDownBehaviour=JSON.parse(JSON.stringify(this.state.dropDownBehaviour));
                dropDownBehaviour['display']='block';
                this.refs.inputBox.focus();
                this.setState({dropDownBehaviour,possibleValues,"value":"","selected":false, "isFocused":true,"focused":0});
        }
    }
    onfocusout(){
        let focused=this.state.focused;
        let possibleValues=JSON.parse(JSON.stringify(this.state.possibleValues)) || [];
        if(possibleValues.length>0){
            // possibleValues[focused].isFocused=false;
        }
        let dropDownBehaviour=JSON.parse(JSON.stringify(this.state.dropDownBehaviour));
        dropDownBehaviour['display']='none';
        if(!this.state.selected){
            this.setState({possibleValues:[],dropDownBehaviour,"value":"","focused":0,"isFocused":false},()=>{
            });
            this.props.callFieldFocusOut(null);
        }
    }
    onKeyDown(e) {
        if(e.keyCode == 40 && this.state.possibleValues.length>0){
            let focused=this.state.focused;
            let possibleValues=JSON.parse(JSON.stringify(this.state.possibleValues));
            let scrollTop=0;
            let previousChild;
            let nextChild;
            if(this.state.focused>=this.state.possibleValues.length-1){
                nextChild=0;
                previousChild=this.state.possibleValues.length-1;
            }
            else{
                previousChild=focused;
                nextChild=focused+1;
                focused++;
                if((focused)*listItemHeight>=maxHeightPopup){
                    scrollTop=$("#dropDown").scrollTop()+listItemHeight;
                }
            }
            // possibleValues[previousChild].isFocused=false;
            // possibleValues[nextChild].isFocused=true;
            this.setState({possibleValues, "value":possibleValues[nextChild],"focused":nextChild});
            $("#dropDown").scrollTop(scrollTop);
        }
        else if(e.keyCode == 38){
            let focused=this.state.focused;
            if(focused>0){
                let top=$("#dropDown").scrollTop();
                let possibleValues=JSON.parse(JSON.stringify(this.state.possibleValues));
                if((possibleValues.length-focused)*listItemHeight>=maxHeightPopup){
                    $("#dropDown").scrollTop(top-listItemHeight);
                }
                // possibleValues[focused].isFocused=false;
                // possibleValues[focused-1].isFocused=true;
                this.setState({possibleValues, "value":possibleValues[focused-1],"focused":focused-1});
            }
        }
// keycode 13 is for enter press
        else if (e.keyCode == 13 && this.state.focused>-1) { // this focused check is for if user type something and then press enter without selecting a element
            let value=this.state.possibleValues[this.state.focused];
            let dropDownBehaviour=JSON.parse(JSON.stringify(this.state.dropDownBehaviour));
            dropDownBehaviour['display']='none';
            this.setState({"selectedValue":this.state.possibleValues[this.state.focused], "possibleValues":[],"selected":true,"value":value,"focused":0,dropDownBehaviour,isFocused:false},()=>{
                this.props.callFieldFocusOut({key:this.props.info.id,value:this.state.selectedValue});
            });
        }
    }
    onselect(index,value){
        let dropDownBehaviour=JSON.parse(JSON.stringify(this.state.dropDownBehaviour));
        dropDownBehaviour['display']='none';
        let possibleValues=JSON.parse(JSON.stringify(this.state.possibleValues));
        // console.log("possibleValues onselect>>>>>>"+JSON.stringify(possibleValues))
        this.setState({"selectedValue":possibleValues[index], "possibleValues":[],"selected":true,isFocused:false, value:possibleValues[index],"focused":0,dropDownBehaviour},()=>{
            this.props.callFieldFocusOut({key:this.props.info.id,value:this.state.selectedValue});
            this.props.onChange(this.props.info.id, possibleValues[index]);
        });
    }
    render() {
         // console.log("props for autoSelect "+JSON.stringify(this.props))
        let {info,detail}=this.props;
        let possibleValues=JSON.parse(JSON.stringify(this.state.possibleValues));
        let inputStyle=styles['inputStyle'];
        let dropDownStyle={};
        // inputStyle["height"]=info.height
        //   inputStyle["width"]=info.width
        // inputStyle["color"]="black"
        if(detail){
            // inputStyle["borderBottom"]='1px solid lightgray'
        }else{
            // inputStyle["borderBottom"]='none'
        }
        if(Object.keys(this.state.dropDownBehaviour).length>0){
            dropDownStyle=  Object.assign({},styles['dropDown'],this.state.dropDownBehaviour);
        }
        else{
            dropDownStyle=  Object.assign({},styles['dropDown']);
        }
        let arrowClickDivStyle={display:'inline-block',verticalAlign:'bottom',height:16,cursor:'pointer'};
        if(this.props.disabled){
            arrowClickDivStyle['pointerEvents']='none';
        }
        else{
            arrowClickDivStyle['pointerEvents']='auto';
        }

        let view;
        let list=[];
        let options=  possibleValues.map((value,index)=> {
            list.push({'label':value.name,'style':{...inputStyle,color:index==this.state.focused ?'green':'black'},'onclick':this.onselect});
        })
        let placeholder='Enter the '+(this.props.placeholder)? this.props.placeholder:'';
        view=<div >
            <input type="text" ref='inputBox' value={this.state.value && this.state.value[info.display] || ''} placeholder={info.label} style={inputStyle} onKeyDown={this.onKeyDown}   onChange={this.onChange}  disabled={this.props.disabled} />
            {detail && <div style={arrowClickDivStyle} onClick={(e)=>{this.onArrowClick(info)}}><img src={down()} height="20px" width="20px"/></div>}
        </div>;
        return (
            <div  style={{"position":"relative","display":"inlineBlock"}}>
                {view}
                {this.state.isFocused && <Popup  dropDownStyle={dropDownStyle} onfocusout={this.onfocusout} possibleValues= {list} /> }
            </div>
        )
    }
}


export default AutoSuggest;

