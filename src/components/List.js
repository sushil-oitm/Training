import React ,{Component} from "react";
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import { observer, Provider, inject } from "mobx-react";
import Field from './field';
import Checkbox from '@material-ui/core/Checkbox';
import  {umbrella,menuicon,detailIcon,insertIcon,deleteIcon} from '../images/images'
import Style from './../theme/styles'
import "../CSS/List.css"
import moment from "moment";

@inject("path")
@inject("params")
@inject("webConnect")
@inject("data")
@observer
class SimpleList extends Component {
    constructor(props){
        super(props);
        this.listdetail = this.listdetail.bind(this);
        this.deletedata = this.deletedata.bind(this);
        this.onScroll = this.onScroll.bind(this);
        // if(!this.state || !this.state.popupMENU){
        //     this.state={popupMENU:Style.menu.popupMENU,checked: []}
        // }
        if(!this.state){
            this.state={limit:20,checked: [],loading:false}
        }
    }
    handleToggle = (event,checked)=> {
        // console.log("event",event)
        // console.log("value",event.target.value)
        // console.log("current checked",this.state.checked)
        const value=event.target.value;
        const currentIndex = this.state.checked.indexOf(value);
        const newChecked = this.state.checked;
        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        this.setState({
            checked: newChecked,
        });
    };
    componentWillUnmount(){
         console.log("list unmount called>>>")

    }
    async onScroll(e) {
        const {webConnect,data}=this.props;
        let { scrollHeight, scrollTop, offsetHeight } = e.target;
        let load_data_threshold = scrollHeight - scrollTop - offsetHeight;
        console.log("load_data_threshold>>>>>"+load_data_threshold)
        if (!this.state.loading && scrollTop != 0 && load_data_threshold <= 100) {
            // console.log("get new data called>>>>"+JSON.stringify(data))
            // console.log("get new data called>>>>"+JSON.stringify(data))
            // console.log("get new data called>>>>"+JSON.stringify(data))
             console.log("state>>>>"+JSON.stringify(this.state.limit));
            let olddata=data.data;
            let param={table:data.meta.table,...data.meta.query,skip:this.state.limit,limit:this.state.limit+20};
            // console.log("param in list>>>>>"+JSON.stringify(param))
            this.setState({loading:true})
            let newdata=await webConnect.find(param);
            // console.log("newdata>>>>"+JSON.stringify(newdata));
            if(newdata && newdata.data){
               olddata.push(...newdata.data);
               data.data=olddata;
           }
            this.setState({loading:false,limit:this.state.limit+20})

        }
    }
    listdetail(detailpath){
        const {path,params}=this.props;
        params.reload=true;
        params.iscreate=true;
        params.filter={_id:"5bbfffe1ab06470200fe805d"}
        path.push({path:detailpath})
    }
    async deletedata(rowData,table) {
        let {params,webConnect,path}=this.props;
        let finalupdates= {table:table,updates:{remove:{_id:rowData._id}}}
         let deleterow= await webConnect.invoke({"id":"_save",param:finalupdates})
        if(!deleterow.result){
            alert("Error in delete "+deleterow);
            return;
        }
        console.log("deleterow>>>>"+JSON.stringify(deleterow))
        let newpath=path[path.length-1];
        path.pop()
        params["reload"]=true;
        path.push(newpath)

    }
    getHeader(childrendata,fields){
        let fieldsdata=[<Checkbox
            // checked={this.state.checked.indexOf(rowData._id) !== -1}
            onChange={this.handleToggle}
            // value={rowData._id}
            tabIndex={-1}
            disableRipple
        />];
        childrendata.map((child, i) => {
            let {value, label, display} = child.props;
           let  fieldinfo = fields[value];
            fieldsdata.push(
                <div key={i} class="list_wrapper">
                    <div class="list_inner_wrapper">
                        <span>{label}</span>
                    </div>
                </div>
            )
        })
        return fieldsdata;
    }
    render(){
        var  {data:{data,meta},onrowTouch}= this.props;
        const childrendata = React.Children.toArray(this.props.children)
        // console.log("props in list>>>>>"+JSON.stringify(children))
        //  console.log("meta in list>>>>>"+JSON.stringify(meta))
        //  console.log("fields in list>>>>>"+JSON.stringify(fields))
        // let finalfields=mergeFields(fields,meta.fieldsinfo);
        // console.log("finalfields>>>>"+JSON.stringify(finalfields))
        if(!data){
            return <div>loading.......</div>
        }
        return (<div style={{flex:1}}>
            <ul>
                <div style={{flexDirection:'row',flex:1,"display":'flex',"min-height": "50px", "background-color": "rgb(235, 235, 235)","align-items": "flex-end","text-align": "left","justify-content": "flex-end", "padding": "0px 10px"}}>

                        {this.getHeader(childrendata,meta.fieldsinfo)}

                </div> </ul>
            <ul style={{height:"100%", overflow:"auto"}} onScroll={this.onScroll}>
                <div class="wrapper">
                    {data.map((rowData,index)=>(<div class="list_data" key={index}>
                        <Checkbox
                            checked={this.state.checked.indexOf(rowData._id) !== -1}
                            onChange={this.handleToggle}
                            value={rowData._id}
                            tabIndex={-1}
                            disableRipple
                        />
                        <RenderRow detailpath={onrowTouch} rowData={rowData} childrendata={childrendata} fields={meta.fieldsinfo} ></RenderRow>

                        {<div style={{paddingLeft:"10"}}>
                            <img src={deleteIcon()}  onClick={(e)=>{this.deletedata(rowData,meta.table)}} height="35px" width="20px" style={{"padding-top":"15px"}}/>
                        </div>}

                    </div>))}

                </div>
            </ul>
                {<div class="add_wrapper">
                    <div onClick={(e)=>{this.listdetail(onrowTouch)}} class="add_button"><span>Add</span></div>
                </div>}
            </div>
              )
    }
}

@inject("path")
@inject("params")
@inject("webConnect")
@inject("data")
@observer
class List extends Component {
    constructor(props){
        super(props);
        this.listdetail = this.listdetail.bind(this);
        this.listinsert = this.listinsert.bind(this);
        this.deletedata = this.deletedata.bind(this);
        // if(!this.state || !this.state.popupMENU){
        //     this.state={popupMENU:Style.menu.popupMENU,checked: []}
        // }
        if(!this.state){
            this.state={limit:20,checked: [],loading:false}
        }
    }
    handleToggle = (event,checked)=> {
        // console.log("event",event)
        // console.log("value",event.target.value)
        // console.log("current checked",this.state.checked)
        const value=event.target.value;
        const currentIndex = this.state.checked.indexOf(value);
        const newChecked = this.state.checked;
        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        this.setState({
            checked: newChecked,
        });
    };

    listdetail(detailpath,rowData){
        const {path,params}=this.props;
        if(detailpath){
            params.reload=true
            params.isdetail=true
            params.filter={_id:rowData._id}
            path.push({path:detailpath})
        }
    }
    listinsert(detailpath){
        const {path,params}=this.props;
        params.reload=true;
        params.iscreate=true;
        params.filter={_id:"5bbfffe1ab06470200fe805d"}
        path.push({path:detailpath})
    }
    async deletedata(rowData,table) {
        let {params,webConnect,path}=this.props;
        let finalupdates= {table:table,updates:{remove:{_id:rowData._id}}}
        console.log("data delete called>>>>",rowData)
        //  let deleterow= await webConnect.invoke({"id":"_save",param:finalupdates})
        // if(!deleterow.result){
        //     alert("Error in delete "+deleterow);
        //     return;
        // }
        // console.log("deleterow>>>>"+JSON.stringify(deleterow))
        // let newpath=path[path.length-1];
        // path.pop()
        // params["reload"]=true;
        // path.push(newpath)

    }
    render(){
        var  {data:{data,meta},onrowTouch,columns=[]}= this.props;
        if(!data){
            return <div>loading.......</div>
        }
      columns.map(cdata=>{
            if(cdata.id=="actions"){
              cdata.Header= () => (<div onClick={(e) => {
                    this.listinsert(onrowTouch)
                }}><span>Add New Item</span></div>)
            }
            if(cdata.type && cdata.type=="date"){
                data.map(fdata=>{
                    if(fdata[cdata.id]){
                       let datedata=getDateToString(new Date(fdata[cdata.id]));
                     fdata[cdata.id]=datedata;
                    }
                    return fdata;
                })
            }
            return cdata;
        })
        return (
            <ReactTable
            data={data}
            style={{flex:1,"display":'flex'}}
            columns={columns}
            filterable={true}
            getTdProps={(state, rowInfo, column, instance) => {
                return {
                    onClick: (e, handleOriginal) => {
                        // console.log("A Td Element was clicked!");
                        // console.log("it produced this event:", e);
                        //  console.log("It was in this column:"+JSON.stringify(column));
                        // console.log("It was in this row:"+JSON.stringify(rowInfo));
                        // console.log("It was in this table instance:", instance);
                     let {original}=rowInfo
                        // IMPORTANT! React-Table uses onClick internally to trigger
                        // events like expanding SubComponents and pivots.
                        // By default a custom 'onClick' handler will override this functionality.
                        // If you want to fire the original onClick handler, call the
                        // 'handleOriginal' function.
                        if (handleOriginal) {
                            handleOriginal();
                        }
                        if(column && column.tdProps && column.tdProps=="delete"){
                                  this.deletedata(original._id,meta.table)
                        }else{
                            this.listdetail(onrowTouch,original)
                        }

                    }
                };
            }}
            />)
    }
}


@inject("path")
@inject("params")
@inject("data")
@observer
class RenderRow extends Component {
    constructor(props){
        super(props);
        this.getFields = this.getFields.bind(this);
        this.detail = this.detail.bind(this);
        this.state={checked:true}
    }
    detail(detailpath,rowData){
        const {path,params}=this.props;
        if(detailpath){
            params.reload=true
            params.isdetail=true
            params.filter={_id:rowData._id}
            path.push({path:detailpath})
        }

    }
    getFields(childrendata,fields,rowData={}) {
        let fieldsdata = [];
        // fields.sort(function(a, b) {
        //     return parseFloat(a.index) - parseFloat(b.index);
        // });

            childrendata.map((child, i) => {
                let {value, label, display} = child.props;
                let fieldinfo = fields[value];
                let props = {};
                if (fieldinfo && fieldinfo.type == "number") {
                    props = {
                        ...childrendata[i].props,
                        key: {i},
                        type: "number",
                        info: {...fieldinfo, id: value},
                        value: rowData[value],
                        onChange: this.handleChange
                    };
                } else if (fieldinfo && fieldinfo.type == "date") {
                    props = {
                        ...childrendata[i].props,
                        key: {i},
                        info: {...fieldinfo, id: value},
                        defaultValue: rowData[value],
                        onChange: (e) => {
                            this.onDateChange(e)
                        }
                    };
                } else if (fieldinfo && fieldinfo.type == "fk") {
                    props = {
                        ...childrendata[i].props,
                        key: {i},
                        info: {...fieldinfo, id: value, display: display},
                        defaultValue: rowData[value],
                        callFieldFocusOut: (e) => {
                            this.onFieldFocusOut(e)
                        },
                        onChange: this.handleChange
                    };
                } else {
                    props = {
                        ...childrendata[i].props,
                        key: {i},
                        info: {...fieldinfo, id: value},
                        value: rowData[value],
                        onChange: this.handleChange
                    };
                }

                let singlechild = React.cloneElement(child, props);

                fieldsdata.push(
                    <div key={i} class="list_wrapper">
                        <div class="list_inner_wrapper">
                            {singlechild}
                        </div>
                    </div>
                )
            })
            return fieldsdata;

    }
    render(){
        var  {fields,rowData,detailpath,childrendata}= this.props;
        // console.log("props in render row>>>>>"+JSON.stringify(this.props))
        // console.log("rowData in RenderRow>>>>>"+JSON.stringify(rowData))
         console.log("fields in RenderRow>>>>>"+JSON.stringify(fields))
        return (<div onClick={()=>{this.detail(detailpath,rowData)}} class="content">
            {this.getFields(childrendata,fields,rowData)}
        </div>)

    }
}

const mergeFields=(fields,sfields)=>{
    return fields.map(fdata=>{
        let key=fdata.id
        if(typeof sfields[key]== "object"){
            fdata={...fdata,...sfields[key]}
        }else{
            fdata={...fdata,type:sfields[key]}
        }
        fdata={...fdata}
        return fdata;
    })
}
const getDateToString=(date)=> {
    if (!date) {
        date = new Date();
    }
    let mm = date.getMonth() + 1;
    var dd = date.getDate();
    return [date.getFullYear() + "-", (mm > 9 ? "" : "0") + mm + "-", (dd > 9 ? "" : "0") + dd].join("");
}


export default List



