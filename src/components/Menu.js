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
@inject("params")
class SimpleMenu extends React.Component {
    state = {
        anchorEl: null,
    };

    handleClick = event => {
            this.setState({anchorEl: event.currentTarget});

    };

    handleClose = ({menuRoute}) => {
        let {path,params}=this.props;
        console.log("currentRoute >>>>",menuRoute)
        this.setState({ anchorEl: null });
        if(menuRoute) {
            console.log("currentRoute route if>>>>>>>>")
            let pathLength = path.length;
            params.reload = true;
            path.splice(0, pathLength, {"path": menuRoute})
        }
    };

    render() {
        const { anchorEl } = this.state;

        return (
            <div>
                <IconButton
                    style={{"color":"black","marginTop":"5px","marginLeft":"20px"}}
                    aria-label="More"
                    aria-owns={anchorEl ? 'long-menu' : null}
                    aria-haspopup="true"
                    onClick={this.handleClick}
                >
                    <MoreVertIcon />
                </IconButton>
                <Menu
                    id="long-menu"
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={this.handleClose}
                    PaperProps={{
                        style: {
                            maxHeight: ITEM_HEIGHT * 4.5,
                            width: 100,
                        },
                    }}
                >
                 {ProjectMenu.map(mdata=>{
                        return  <MenuItem  onClick={()=>{this.handleClose({menuRoute:mdata.route})}}>{mdata.label}</MenuItem>
                    })}

                </Menu>
            </div>
        );
    }
}

export default SimpleMenu;
