import React from 'react';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import {ProjectMenu } from "./../Routes";

class SimpleMenu extends React.Component {
    state = {
        anchorEl: null,
    };

    handleClick = event => {
        this.setState({ anchorEl: event.currentTarget });
    };

    handleClose = (route) => {
        console.log("route >>>>"+route)
        this.setState({ anchorEl: null });
    };

    render() {
        const { anchorEl } = this.state;

        return (
            <div>
                <Button
                    style={{"color":"white","background-color":"black","marginTop":"5px","marginLeft":"5px"}}
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

export default SimpleMenu;
