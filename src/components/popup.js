
'use strict';
var React = require('react');
var ReactDOM = require('react-dom');

class Popup extends React.Component{
  constructor(p){
    super(p);
    this.onfocusout=this.onfocusout.bind(this);
    this.onclick=this.onclick.bind(this);
  document.addEventListener("click",this.onfocusout);
  }
  onfocusout(){
    this.props.onfocusout();
  }
  componentWillUnmount(){
          document.removeEventListener("click",this.onfocusout);
  }
  onclick(e,index,value){
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    value.onclick(index,value);
  }
  render(){
      var options;
      if(this.props && this.props.possibleValues.length>0){
       options = this.props.possibleValues.map((value,index)=>{
              return <div key={index} tabIndex={index}  style={value.style} onMouseDown={(e)=>{this.onclick(e,index,value)}} >{value.label}</div>;
          })
      }
      return <div className="autoSuggestList" style={this.props.dropDownStyle}  >{options} </div>
  }
}

export default Popup;