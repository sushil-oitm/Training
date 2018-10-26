
'use strict';

import Style from './../theme/styles'
import Field from './field';
var React = require('react');
var ReactDOM = require('react-dom');
// import {actions} from './../redux'
// import {connect, Provider} from 'react-redux';
class Popup extends React.Component{
  constructor(p){
    super(p);
     this.onclick=this.onclick.bind(this);
     this.handleChange=this.handleChange.bind(this);
     this.applyFilter=this.applyFilter.bind(this);
     this.resetFilter=this.resetFilter.bind(this);
      this.updates = {};
  // document.addEventListener("click",this.onfocusout);
      this.state={selectedField:{}}
  }
  // onfocusout(){
  //   this.props.onfocusout();
  // }
  componentWillUnmount(){
           document.removeEventListener("click",this.onfocusout);
  }
  onclick(e,renderField,index){
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    // this.props.onChange(index,value);
    // console.log("renderField>>>>>>"+JSON.stringify(renderField))
      this.setState({selectedField:renderField},()=>{
      });
  }
  handleChange(key,value) {
         console.log("update>>>>"+JSON.stringify(this.updates))
        this.updates[key] =value
    }

    applyFilter(dataset,filterFields) {
        console.log("update>>>>"+JSON.stringify(this.updates))
        console.log("filterFields>>>>"+JSON.stringify(filterFields))
        let filter={};
        for(let i in this.updates){
            let type=this.state.selectedField.type
            if(type && type=='string'){
                filter[i]=this.updates[i]
            }
            else if(type && type=='date'){
                let today=new Date(this.updates[i])
                 today.setUTCHours(0)
                 today.setUTCMinutes(0)
                 today.setUTCSeconds(0)
                // let yesterday = new Date(today.getDate()-1);
                let tomorrow = new Date();
                tomorrow.setUTCDate(today.getUTCDate()+1)
                filter[i]={"$gte":today,"$lt":tomorrow}
            }
            else if(type && type=='fk'){
                filter[i+"._id"]=this.updates[i]._id
            }
            else if(type && type=='select'){
                filter[i]=this.updates[i]
            }
            else{

            }
            console.log("filter>>>>>"+JSON.stringify(filter))
        }
        // this.props.onFilterHide()
        this.props.loadData({dataset:dataset,filter:filter,dataname:dataset+"-listdata"})
    }
    resetFilter(dataset) {
         // console.log("update>>>>"+JSON.stringify(this.updates))
        this.props.onFilterHide()
        this.updates = {};
        this.setState({selectedField:{}},()=>{
        });
        this.props.loadData({dataset:dataset,dataname:dataset+"-listdata"})
    }
  render(){
      let {actionStyle,filterFields,loadData,onFilterHide,dataset}=this.props;
       // console.log("actionStyle>>>>>",actionStyle)
       // console.log("filterFields>>>>>",filterFields)
      return (<div style={actionStyle}>
          <div style={Style.menu.innerpopupMENU}>
              <div style={Style.menu.rootdata}>
                  <div class="split6" style={{flex: 1}}>
                      <div style={{flex: 1, "background-color": "white",display:"flex","min-width": "350px","max-height": "200px","min-height": "200px",}}>
                          <div style={{"flex-direction": "row",flex: 1, "overflow": "auto", "border-right": "0.5px solid rgb(231, 231, 231)","display": "block"}}>
                              {filterFields.map((renderField,index)=>(
                                  renderField && renderField.filter && <div key={index} onClick={(e)=>{this.onclick(e,renderField, index)}} style={{flex:1}}>
                                      <div style={{"margin-bottom": "0px", "background-color": "white","padding": "10px", "border-bottom": "0.5px solid rgb(231, 231, 231)", "cursor": "pointer"}}>
                                          <div><span>{renderField.label}</span></div>
                                      </div>
                                  </div>
                              ))}
                          </div>

                          {this.state.selectedField && <div style={{"flex-direction": "row","min-width": "200px", "overflow": "auto",flex: 2, "display": "block", "border-bottom": "0.5px solid rgb(231, 231, 231)"}}>
                              <Field detail={true} key={this.state.selectedField.id +"__"} id={this.state.selectedField.id}  info={this.state.selectedField} onChange={this.handleChange}></Field>
                          </div>}
                      </div>
                      <div style={{flexDirection:'row',flex:1,"display":'flex',"min-height": "50px", "background-color": "rgb(235, 235, 235)","text-align": "center"}}>
                          <div style={{flex:1,"background-color": "rgb(235, 235, 235)"}} onClick={()=>{this.resetFilter(dataset)}}>Reset</div>
                          <div style={{flex:1,"background-color": "rgb(232, 56, 45)"}} onClick={()=>{this.applyFilter(dataset,filterFields)}}>Apply</div>
                      </div>
                  </div>
              </div>
          </div>
      </div>)
  }
}


export default Popup
//     = connect(store=> {
//     return {
//     }
// },{applyFilter:actions.applyFilter,unmount:actions.unmount})(Popup);