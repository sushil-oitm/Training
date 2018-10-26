var React =require("react");
var ReactDOM=require('react-dom');
var moment=require('moment');
var cal_days_labels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
// these are human-readable month name labels, in order

var cal_months_labels = ['Jan', 'Feb', 'Mar', 'Apr',
                 'May', 'Jun', 'Jul', 'Aug', 'Sep',
                 'Oct', 'Nov', 'Dec'];
// these are the days of the week for each month, in order
var cal_years_labels=[2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020]
var cal_days_in_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var weekRows=[0,1,2,3,4,5];
var weekColumns=[0,1,2,3,4,5,6];
// this is the current date

var styles={'dropDown':{
                    display:"inline-block",
                    position: "absolute",
                    overflowY:"auto",
                    cursor:"pointer",
                    width:'260px',
                    backgroundColor:'beige',
                    zIndex:'1000',
                    boxShadow:"0px 8px 16px 0px rgba(0,0,0,0.2)"
            },
            inputStyle:{
                width  : 177,
              }
      }

class DateCom extends React.Component{
constructor(p){
	super(p);
	// console.log("enter in constructor of DateCom......"+p.defaultValue);
	var list=p.defaultValue.split('/');
	// console.log("list........."+list);
	if(p.defaultValue){
		var cal_current_date = new Date(list[1]+"/"+list[0]+"/"+list[2]);	
	}
	else{
		var cal_current_date = new Date();
	}
	console.log("cal_current_date............"+cal_current_date);
	var month=cal_current_date.getMonth();
	var year=cal_current_date.getFullYear();
	var firstday = new Date(year, month, 1);
	// console.log("firstday............"+firstday);
	var startingDay = firstday.getDay();
	var monthLength = cal_days_in_month[month];
	if (month == 1) { // February only!
	    if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
	        monthLength = 29;
	    }
	}
	this.onfocusout=this.onfocusout.bind(this);
	this.onYearChange=this.onYearChange.bind(this);
	this.onMonthClick=this.onMonthClick.bind(this);
	this.onYearClick=this.onYearClick.bind(this);
	this.onMonthChange=this.onMonthChange.bind(this);
	this.onDateClick=this.onDateClick.bind(this);
	this.state={month,year,startingDay,monthLength};
    document.addEventListener("click",this.onfocusout);
}
  onfocusout(){
    this.props.onfocusout();
  }
  componentWillUnmount(){
          document.removeEventListener("click",this.onfocusout);
  }
onDateClick(e,date){
	e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
	this.props.onDateClick(date,this.state.month,this.state.year);
}
onYearClick(event){
	event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
	var year=event.nativeEvent.target.selectedIndex;
	var month=this.state.month;
		var firstday = new Date(year, month, 1);
	var startingDay = firstday.getDay();
	var monthLength = cal_days_in_month[month];
	if (month == 1) { // February only!
	    if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
	        monthLength = 29;
	    }
	}
	this.setState({year,startingDay,monthLength});
}
onMonthClick(event){
	event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();

	var month=event.nativeEvent.target.selectedIndex;
	var year=this.state.year;
		var firstday = new Date(year, month, 1);
	var startingDay = firstday.getDay();
	var monthLength = cal_days_in_month[month];
	if (month == 1) { // February only!
	    if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
	        monthLength = 29;
	    }
	}
	this.setState({month,startingDay,monthLength});
}
onMonthChange(event,action){
	event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();

	var year=this.state.year;
	var month=this.state.month;
	if(action=="back"){
		month--;	
	}
	else{
		month++;
	}
	if(month<0){
		year--;
		month=11;
	}
	if(month>11){
		year++;
		month=0;
	}
	var firstday = new Date(year, month, 1);
	var startingDay = firstday.getDay();
	var monthLength = cal_days_in_month[month];
	if (month == 1) { // February only!
	    if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
	        monthLength = 29;
	    }
	}
	this.setState({month,year,startingDay,monthLength});
}
onYearChange(event,action){
	event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
	var year=this.state.year;
	var month=this.state.month;
	if(action=='back'){
		year--;
	}
	else{
		year++;
	}
	var firstday = new Date(year, month, 1);
	var startingDay = firstday.getDay();
	var monthLength = cal_days_in_month[month];
	if (month == 1) { // February only!
	    if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
	        monthLength = 29;
	    }
	}
	this.setState({month,year,startingDay,monthLength});
}
render(){
	var day=1;
	var monthName = cal_months_labels[this.state.month];
	// var yearName = cal_years_labels[this.state.year];
	var weekDays=cal_days_labels.map((value,index)=>{
		return <div style={{display:'inline-block',width:'35px'}} key={index}>{value}</div>
	});
	
	var Monthoptions=cal_months_labels.map((month,index)=>{
		if(month==monthName){
			return <option value={month} selected>{month}</option>;
		}
		else{
			return <option value={month}>{month}</option>;
		}
	})
	var Yearoptions=cal_years_labels.map((year,index)=>{
		if(year==this.state.year){
			return <option value={year} selected>{year}</option>;
		}
		else{
			return <option value={year}>{year}</option>;
		}
	})
	var monthsView= <select name="monthName" onChange={this.onMonthClick}>{Monthoptions}</select>;
	var yearsView= <select name="yearName" onChange={this.onYearClick}>{Yearoptions}</select>;
	var weekDaysrow=<div key="1">{weekDays}</div>;
	var header=<div key="122">
	<div style={{display:'inline-block',paddingBottom:"1.5em",width:'35px',cursor:'pointer'}} onClick={(e)=>{this.onMonthChange(e,'back')}}>←</div>
	<div style={{display:'inline-block',paddingBottom:"1.5em",width:'60px'}}>{monthsView}</div>
	<div style={{display:'inline-block',paddingBottom:"1.5em",width:'35px',cursor:'pointer'}} onClick={(e)=>{this.onMonthChange(e,'next')}}>→</div>
	<div style={{display:'inline-block',paddingBottom:"1.5em",width:'60px'}}>{yearsView}</div>
	</div>
	var calenderTable=weekRows.map((rowValue,rowIndex)=>{
		var row=weekColumns.map((columnValue,colIndex)=>{
					let printValue="";
					if (day <= this.state.monthLength && (rowValue > 0 || columnValue >= this.state.startingDay)) {
				            printValue= day;
				            day++;
				     }
					return <div width={"40px"} key={rowIndex+colIndex} style={{cursor:"pointer",display:'inline-block',width:'35px'}} onClick={(e)=>{this.onDateClick(e,printValue)}}>{printValue}</div>
			})
		return <div key={rowIndex}>{row}</div>
	})
	return (<div style={styles.dropDown}>{header}{weekDaysrow}{calenderTable}</div>);
}

}
export default DateCom;

// ReacdivOM.render((
// <div><DateCom /></div>
// 	),document.getElementById('root'))