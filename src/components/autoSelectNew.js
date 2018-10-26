'use strict';
import React from "react";
import  ReactDOM  from 'react-dom';
import Popup from './popup';
import  {downArrow,down} from '../images/images'
var $ = require('jquery');
var maxHeightPopup=126;
var listItemHeight=18;
var styles={'dropDown':{
                    display:"none",
                    position: "absolute",
                    width:177,
                    maxHeight:maxHeightPopup,
                    overflowY:"auto",
                    cursor:"pointer",
                    backgroundColor: "beige",
                    zIndex:'1000',
                    boxShadow:"0px 8px 16px 0px rgba(0,0,0,0.2)"
            },
            inputStyle:{
                width  : 177,
                // height:40,
                border:'none',
                // 'borderBottom':'1px solid lightgray'
              
              }
      }


class AutoSuggest extends React.Component {
    constructor(p) {
        super(p);
        this.state={"selectedValue":"", value:this.props.defaultValue,  allValues:this.props.info.options||[],"focused":0 ,"selected":false ,"isFocused":false, "filter":this.props.filter ,possibleValues:[],'dropDownBehaviour':{}};
        this.onChange=this.onChange.bind(this);
        this.onArrowClick=this.onArrowClick.bind(this);
        this.onKeyDown=this.onKeyDown.bind(this);
        this.onfocusout=this.onfocusout.bind(this);
        this.onselect=this.onselect.bind(this);
        this.onOutSideClick=this.onOutSideClick.bind(this);    
    }

    onOutSideClick(){
          this.setState({possibleValues:[],'dropDownBehaviour':[],"value":"","focused":0,"isFocused":false},()=>{
        });
    }
    componentWillReceiveProps(newProps){
        // console.log("newProps>>>>"+JSON.stringify(newProps))
        this.setState({value:newProps.defaultValue},()=>{
        });
    }
    onChange(e) {
       
        var elementValue=e.target.value;       
        var possibleValues=[];
        var allValues=this.state.allValues;
        if(elementValue!=null &&  elementValue!=''){
                    for(var i=0;i<allValues.length;i++){
                        if(allValues[i].toLowerCase().indexOf(elementValue.toLowerCase())==0){
                            possibleValues.push(allValues[i]);
                        }
                    }
               }

           var dropDownBehaviour=JSON.parse(JSON.stringify(this.state.dropDownBehaviour));
             dropDownBehaviour['display']='block';
            this.setState({dropDownBehaviour,possibleValues,"value":elementValue,"selected":false, "isFocused":true,"focused":0});           

  }
    onArrowClick(){
           var possibleValues=JSON.parse(JSON.stringify(this.state.allValues));
           var dropDownBehaviour=JSON.parse(JSON.stringify(this.state.dropDownBehaviour));
             dropDownBehaviour['display']='block';
             this.refs.inputBox.focus();
            this.setState({dropDownBehaviour,possibleValues,"value":"","selected":false, "isFocused":true,"focused":0}); 

          //   var elementValue='';
          //   var dropDownBehaviour=JSON.parse(JSON.stringify(this.state.dropDownBehaviour));
          //   var collectionid=this.props.refBy;
          //   var error='';
          //    this.loadDataFromServer(elementValue,collectionid,this.props.displayColumn,(err,response)=>{
          //     if(err){
          //       error=err;
          //     }
          //     else{
          //        var possibleValues=JSON.parse(JSON.stringify(response));   
          //     }

          //    dropDownBehaviour['display']='block';
           
          //   this.setState({dropDownBehaviour,possibleValues,"value":elementValue,"selected":false, "isFocused":true,"focused":0});
          // });
    }
    onfocusout(){
            var focused=this.state.focused;
            var possibleValues=JSON.parse(JSON.stringify(this.state.possibleValues)) || [];
            if(possibleValues.length>0){
                // possibleValues[focused].isFocused=false;
            }
            var dropDownBehaviour=JSON.parse(JSON.stringify(this.state.dropDownBehaviour));
            dropDownBehaviour['display']='none';
            if(!this.state.selected){
                this.setState({possibleValues:[],dropDownBehaviour,"value":"","focused":0,"isFocused":false},()=>{
                });
                this.props.callFieldFocusOut(null);
            }
    }
    onKeyDown(e) {
       if(e.keyCode == 40 && this.state.possibleValues.length>0){
          var focused=this.state.focused;
          var possibleValues=JSON.parse(JSON.stringify(this.state.possibleValues));
          var scrollTop=0;
          var previousChild;
          var nextChild;
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
    var focused=this.state.focused;
       if(focused>0){
        var top=$("#dropDown").scrollTop();
        var possibleValues=JSON.parse(JSON.stringify(this.state.possibleValues));
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
        var value=this.state.possibleValues[this.state.focused];
        var dropDownBehaviour=JSON.parse(JSON.stringify(this.state.dropDownBehaviour));
        dropDownBehaviour['display']='none';
        this.setState({"selectedValue":this.state.possibleValues[this.state.focused], "possibleValues":[],"selected":true,"value":value,"focused":0,dropDownBehaviour,isFocused:false},()=>{
        this.props.callFieldFocusOut(this.state.selectedValue);  
        });
    }
}
    onselect(index,value){
        var dropDownBehaviour=JSON.parse(JSON.stringify(this.state.dropDownBehaviour));
        dropDownBehaviour['display']='none';
        var possibleValues=JSON.parse(JSON.stringify(this.state.possibleValues));
        this.setState({"selectedValue":possibleValues[index], "possibleValues":[],"selected":true,isFocused:false, value:possibleValues[index],"focused":0,dropDownBehaviour},()=>{
          this.props.callFieldFocusOut(this.state.selectedValue);
            this.props.onChange(this.props.info.id, possibleValues[index]);
        });  
    }
   render() {
       var {info,detail}=this.props;
        var possibleValues=JSON.parse(JSON.stringify(this.state.possibleValues));
        if(this.state.possibleValues.length>0 && this.state.focused<=0){
          // possibleValues[0].isFocused=true;
        }
       var inputStyle=styles['inputStyle'];
       inputStyle["height"]=info.height
       inputStyle["width"]=info.width
       inputStyle["color"]="black"
       if(detail){
           inputStyle["borderBottom"]='1px solid lightgray'
       }else{
           inputStyle["borderBottom"]='none'
       }
        if(Object.keys(this.state.dropDownBehaviour).length>0){
            var dropDownStyle=  Object.assign({},styles['dropDown'],this.state.dropDownBehaviour);  
        }
        else{
            var dropDownStyle=  Object.assign({},styles['dropDown']);   
        }
       var arrowClickDivStyle={display:'inline-block',verticalAlign:'bottom',height:16,cursor:'pointer'};
        if(this.props.disabled){
          arrowClickDivStyle['pointerEvents']='none'; 
        }
        else{
         arrowClickDivStyle['pointerEvents']='auto';
        }

        var view;
        var list=[];
         var options=  possibleValues.map((value,index)=> { 
          list.push({'label':value,'style':{color:index==this.state.focused?'green':'black'},'onclick':this.onselect});
        }) 
        var placeholder='Enter the '+(this.props.placeholder)? this.props.placeholder:''; 
          view=<div>
              <input type="text" ref='inputBox' placeholder={info.label} value={this.state.value || ''}  style={inputStyle} onKeyDown={this.onKeyDown}   onChange={this.onChange}  disabled={this.props.disabled} />
              {detail &&  <div style={arrowClickDivStyle} onClick={this.onArrowClick}><img src={down()} height="20px" width="20px"/></div> }
             </div>;
            return (
                <div  style={{"position":"relative","display":"inlineBlock"}}>
                {view}
          {this.state.isFocused && <Popup  dropDownStyle={dropDownStyle} onfocusout={this.onfocusout} possibleValues= {list} /> }
             </div>
            )
    }
}
// AutoSuggest.propTypes={
//   callFieldFocusOut :React.PropTypes.func.isRequired
// }

AutoSuggest.defaultProps = {
  disabled : false,
  defaultValue : ''
};


// AutoSuggest = connect(store=> {
//     // console.log("Store in fk>>>>>"+JSON.stringify(store))
//     let newstate={}
//     if(!store.onFieldFocusOut){
//         newstate.onFieldFocusOut=(value)=>{
//         }
//     }
//     newstate.disabled=false;
//     return newstate},{loadData:actions.loadData,unmount:actions.unmount})(AutoSuggest);





export default AutoSuggest;