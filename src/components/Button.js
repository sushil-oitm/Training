import React ,{Component} from "react";
import {actions} from './../redux'
import {connect, Provider} from 'react-redux';

class Button extends Component {


    constructor(props){
        super(props)
    }
    render(){

        var  {rowData,rowActions,dataset}= this.props;
        rowData["dataset"]=dataset
        return (
            <div style={{flexDirection:'row'}}>
                {rowActions.map((renderAction,index)=>(<button  key={index} onClick={()=>{this.props[renderAction.action](rowData)}}>{renderAction.label}</button>))}
            </div>
        )
    }
}

export default Button = connect(store=> {
    return {
    }
}
,{DETAIL:actions.DETAIL,onDelete:actions.onDelete})(Button);


