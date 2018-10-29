/*import React from 'react';
 import Button from '@material-ui/core/Button';
 import {inject} from "mobx-react"
 import Menu from '@material-ui/core/Menu';
 import MenuItem from '@material-ui/core/MenuItem';
 import {ProjectMenu } from "./../Routes";

 @inject("path")
 @inject("params")
 class SimpleMenu extends React.Component {
 state = {
 anchorEl: null,
 };

 handleClick = event => {
 this.setState({ anchorEl: event.currentTarget });
 };

 handleClose = (route) => {
 let {path,params}=this.props;
 console.log("route >>>>"+route)
 this.setState({ anchorEl: null });
 let pathLength=path.length;
 params.reload=true;
 if(route) {
 path.splice(0, pathLength, {"path": route})
 }
 };

 render() {
 const { anchorEl } = this.state;

 return (
 <div>
 <Button
 style={{"color":"white","background-color":"black","marginTop":"5px","marginLeft":"10px"}}
 aria-owns={anchorEl ? 'simple-menu' : null}
 aria-haspopup="true"
 onClick={this.handleClick}
 >
 Menu
 </Button>
 <Menu
 id="simple-menu"
 anchorEl={anchorEl}
 open={Boolean(anchorEl)}
 onClose={this.handleClose}
 >
 {ProjectMenu.map(mdata=>{
 return  <MenuItem onClick={()=>{this.handleClose(mdata.route)}}>{mdata.label}</MenuItem>
 })}

 </Menu>
 </div>
 );
 }
 }

 export default SimpleMenu;*/


import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import {inject} from "mobx-react"
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import {ProjectMenu } from "./../Routes";



const ITEM_HEIGHT = 48;

@inject("path")
@inject("webConnect")
@inject("userStore")
@inject("params")
class Logout extends React.Component {
    state = {
        anchorEl: null,
    };


    logout = async (route) => {
        let {path,params,webConnect,userStore}=this.props;
        this.setState({ anchorEl: null });
        let pathLength = path.length;
        await webConnect.removeLocalStorage("user")
        userStore.set("status","logged_out")
        params.reload = true;
       path.splice(0, pathLength, {"path": "/login"})

    };

    render() {
        const { anchorEl } = this.state;

        return (
            <div>
                <a  onClick={()=>{this.logout()}} style={{"float":"right","paddingTop":"15px","color":"black"}}>Logout</a>

            </div>
        );
    }
}

export default Logout;
