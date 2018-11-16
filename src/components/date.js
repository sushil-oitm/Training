import React from "react";
import  ReactDOM  from 'react-dom';
import DatePopup from './datePopup';
import  {downArrow,down} from '../images/images'



class DateCom extends React.Component{
  constructor(p){
    super(p);
    this.onChange=this.onChange.bind(this);
    this.onArrowClick=this.onArrowClick.bind(this);
    this.onDateClick=this.onDateClick.bind(this);
    this.onfocusout=this.onfocusout.bind(this);
    if(this.props.defaultValue){
        var dateValue=new Date(this.props.defaultValue);
        var month=dateValue.getMonth()+1;
        if(parseInt(month)<9){
          month="0"+month;
        }
        var printValue=dateValue.getDate()+"/"+month+"/"+dateValue.getFullYear();
         this.state={value:printValue ,"focused":0 ,"selected":true ,"isFocused":false,'dropDownBehaviour':{}};
        }
        else{
         this.state={value:"", "focused":0 ,"selected":false ,"isFocused":false,'dropDownBehaviour':{}}; 
        }
  }

    componentWillReceiveProps(newProps){
      // console.log("newProps>>>>>>"+JSON.stringify(newProps))
        if(newProps.defaultValue){
            var dateValue=new Date(newProps.defaultValue);
            var month=dateValue.getMonth()+1;
            if(parseInt(month)<9){
                month="0"+month;
            }
            var printValue=dateValue.getDate()+"/"+month+"/"+dateValue.getFullYear();
            this.setState({value:printValue},()=>{
            });
        }

    }

  onDateClick(day,month,year){
      console.log("onDateClick called>>>>>>")
    var dayParam=day;
    var monthParam=month+1;
    if(day<9){
      dayParam="0"+dayParam;
    }
    if(month<9){
      monthParam="0"+monthParam;
    }

    var date=dayParam+"/"+monthParam+"/"+year;
    var dateObj=new Date((month+1)+"/"+day+"/"+year);
    
    var today=new Date();
        today.setUTCFullYear(dateObj.getFullYear());
        today.setUTCMonth(dateObj.getMonth());
        today.setUTCDate(dateObj.getDate());
        today.setUTCMilliseconds(0);
    var utcDate=today.toISOString();
    this.setState({value:date,isFocused:false},()=>{
        console.log("final utcDate>>>>>",utcDate)
      this.props.onChange({id:this.props.info.id,date:utcDate});
    });
  }
  onfocusout(){
    this.setState({isFocused:false});
  }
  onChange(e){
      console.log("date onchange called>>>>>>")
    var elementValue=e.target.value;
    var list=elementValue.split('/');
    var finalValue="";
    var day="";
    var month="";
    var year="";
    var dayMonthSeprator="";
    var isDateTrue=true;
    if(elementValue.length>0 && elementValue.length<=12){
        if(!isNaN(parseInt(elementValue[0])) && parseInt(elementValue[0])<=3){
          // day+=day;
          finalValue=elementValue[0];
        }
        else{
          isDateTrue=false;
        }
        if(isDateTrue && elementValue[1] && !isNaN(parseInt(elementValue[1])) && ((parseInt(elementValue[0])<=2 && parseInt(elementValue[1])<=9) || (parseInt(elementValue[0])==3 && parseInt(elementValue[1])<=1))){
          day+=day;
          finalValue+=elementValue[1];
        }
        else{
          isDateTrue=false;
        }
        if(isDateTrue && elementValue[2] && elementValue[2]=="/"){
          finalValue+="/";
        }
        else{
          isDateTrue=false;
        }
        if(isDateTrue && elementValue[3] && !isNaN(parseInt(elementValue[3])) && parseInt(elementValue[3])<=1){
          finalValue+=elementValue[3];
        }
        else{
          isDateTrue=false;
        }
        if(isDateTrue && elementValue[4] && (((parseInt(elementValue[3])==0) && parseInt(elementValue[4])<=9) || (parseInt(elementValue[3])==1 && parseInt(elementValue[4])<=2))){
          finalValue+=elementValue[4];
        }
        else{
          isDateTrue=false;
        }
        if(isDateTrue && elementValue[5] &&  elementValue[5]=="/"){
          finalValue+="/";
        }
        else{
          isDateTrue=false;
        }
        if(isDateTrue && !isNaN(parseInt(elementValue[6])) && elementValue[6]>=1){
          finalValue+=elementValue[6];
        }
        else{
          isDateTrue=false;
        }
       if(isDateTrue && !isNaN(parseInt(elementValue[7]))){
          finalValue+=elementValue[7];
        }
        else{
          isDateTrue=false;
        }
       if(isDateTrue && !isNaN(parseInt(elementValue[8]))){
          finalValue+=elementValue[8];
        }
        else{
          isDateTrue=false;
        }
       if(isDateTrue && !isNaN(parseInt(elementValue[9]))){
          finalValue+=elementValue[9];
        }
    }
    this.setState({value:finalValue},()=>{
      if(finalValue.length==10){
        var list=finalValue.split('/');
        var dateObj=new Date(list[1]+"/"+list[0]+"/"+list[2]);
          console.log("final dateObj>>>>>",dateObj)
          this.props.onChange({id:this.props.info.id,date:dateObj});
      }
    });
  }
  onArrowClick(){
    this.setState({isFocused:true});
  }
  render(){
      var {info,detail}=this.props;
      // console.log("date props are>>>>>"+JSON.stringify(this.props))
      let inputStyle={
          width  : info.width,
          height:info.height,
          border:'none',
          color:"black",
          backgroundColor:"white"
          // 'borderBottom':'1px solid lightgray'
      }
      if(detail){
          inputStyle["borderBottom"]='1px solid lightgray'
      }else{
          inputStyle["borderBottom"]='none'
      }
      let view=<div>
          <input style={inputStyle}  placeholder={info.label} onChange={this.onChange} value={this.state.value} disabled={this.props.disabled} />
          {detail && <div style={{display:'inline-block',verticalAlign:'bottom',height:16,cursor:'pointer'}} onClick={this.onArrowClick}><img src={down()} height="20px" width="20px"/></div> }
          </div>;
    return (<div>{view}
    {this.state.isFocused && <DatePopup onDateClick={this.onDateClick} onfocusout={this.onfocusout}  defaultValue={this.state.value} />}
    </div>
      );   
  }
}

export default DateCom;