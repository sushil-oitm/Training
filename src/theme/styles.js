import Theme, {Color, Font} from "./theme"
var {FormLabel, Data1, Data2, Data3, Data5, Nav1, Nav2, Nav3, Nav5, Nav6, Data7, Data8, Data9}  = Font;
const newLabelColor = "rgba(69,69,69,0.6)";
const EMPTY_TEXT = {
    fontFamily: "Roboto",
    fontSize: "16px",
    fontWeight: "500",
    color: newLabelColor
};
const FIELD_CONTAINER_DEFAULT = {
    error: {text: {color: 'red'}},
    icon: {
        width: 10,
        marginRight: 5,
        height: 10
    }, labelText: {
        color: newLabelColor,
        ...FormLabel
    },
    labelContainer: {
        flexDirection: "row",
        alignItems: 'center'
    }, container: {
        //borderBottom: '1px solid',
        marginRight: 10
    }, lfContainer: {
        marginTop: 10,
    }

};

const menu = {
    "popupMENU": {
        "position": "fixed",
        "overflow": "visible",
        "zIndex": 1000,
        "top": "38px",
        "left": "185px",
        "bottom": "auto",
        "visibility": "hidden"
    },
    "innerpopupMENU": {
        "background": "white",
        "borderRadius": "2px",
        "boxShadow": "0 3px 10px rgba(0, 0, 0, 0.3)",
        "overflow": "auto",
        "display": "block"
    },
    "rootdata": {
        "maxHeight": "400px",
        "minHeight": "200px",
        "minWidth": "300px",
        "maxWidth": "700px",
        // "zIndex": 1,
        "border": "0.5px solid rgb(231, 231, 231)"
    }
}

module.exports = {
    menu: menu

};