import images from './images/images.js';
var theme = {
    Color: {
        SHADOW:'rgba(0,0,0,0.2)',
        PRIMARY: "#e8382d", /*Selected button -> SubProj*/
        PRIMARY_LIGHT: "#FDEFEF", /*Selected button -> SubProj*/
        ACCENT: "yellow", /*Float button +*/
        TEXT_H: "#454545", /*H-HightLight, Project View - Autoload*/
        TEXT_H_L: "rgba(69, 69, 69, 0.8)",
        TEXT_N: "#A4A4A4", /*N-Normal, Project view - Damini Nagar*/
        PRIMARY_I: "#ffa526", /*I-Inverse, Normal Menu*/
        PRIMARY_I_H: "white", /*Menu Selected*/
        PRIMARY_I_L: "rgb(152, 219, 241)", /*Menu Text on web*/
        CARDS: "white",
        CONTAINER: "#F9F9F9", /*background behind card*/
        CAPTION: "#9ea8db",
        ERROR: "red",
        PROCESS: "ffba00",
        SUCCESS: "10c063",
        BANNER: "f79712",
        BORDER: "#E7E7E7",
        TRANSPARENT:"transparent",
        BORDER_DARK: "#8c8c8c",
        BORDER_LIGHT: "#e2e2e2",
        HEADER: "#EBEBEB",
        COLUMN_HEADER_TEXT: "red",
        setupView: "#57BA8B",
        THEME: "#000",
        PRIMARY_BORDER: "#A4A4A4",
        ELEVATION: "#898989",
        SELECTED_LEFT_BORDER: "#e8382d",
        PRIMARY_I_V_L: "#FFF8EE",
        NEWLABELCOLOR: "rgba(69,69,69,0.6)",
        TEXT_PRIMARY_COLOR: "#828282",
        HEADER_INVERSE: "#ffb142",
        HEADER_FILTER: "#DEDEDE",
        CHECKBOX_BORDER: "#2e3c54",
        FORM_GROUP_TITLE_BG: '#ebebeb',
        DASHBOARD_BORDER: 'rgba(0, 0, 0, 0.2)',
        LOGIN_BACKGROUND: "#263947",
        LOGIN_HIGHLIGHTED_PRIMARY: "rgba(230, 108, 105, 0.9)",
        LOGIN_HIGHLIGHTED_SECONDARY: "#e8382d",
        LOGIN_PRIMARY_INVERSE: "#ffb629",
        SELECTED_VERTICAL_MENU_BG: '#ba2d24',
        CHAT_COUNT_BACKGROUND:"#08CD14",
        CHAT_COUNT_TEXT:"white",
        CHAT_SEND_BUTTON:"grey",
        CHAT_BACKGROUND_COLOR:"#F7F7F7",
        CHAT_DATE_COLOR:"#C7C7C7",
        CHAT_TEXT_COLOR:"#A9A9A9",
        FOCUSED_FIELD: "blue",
        FOCUSED_ANIMATED_FIELD:"blue",
        ERROR_FIELD: "red",
        PLACEHOLDER_FIELD:'#c7c7cd'


    },
    Font: {
        Nav1: {
            fontFamily: "Roboto-Medium",
            fontSize: 16,
            fontWeight: "500"
        },
        Nav2: {
            fontFamily: "Roboto-Medium",
            fontSize: 14
        },
        Nav3: {
            fontFamily: "Roboto-Medium",
            fontSize: 12,
        },
        Nav4: {
            fontFamily: "Roboto-Medium",
            fontSize: 13,
            fontWeight: 'bold',
            letterSpacing: 0.5

        },
        Nav5: {
            fontFamily: "Roboto-Medium",
            fontSize: 15,
            padding: 5
        },
        Nav6: {
            fontFamily: "Roboto-Medium",
            fontSize: 20,
            fontWeight: "400"
        },
        Data1: {
            fontFamily: "Roboto-Medium",
            fontSize: 14,
            fontWeight: "normal"
        },
        Data2: {
            fontFamily: "Roboto-Medium",
            fontSize: 14,
            fontWeight: "normal",
            opacity: 0.6,
            marginBottom: 10,
            marginTop: 5,
            marginRight: 5
        },
        Data3: {
            fontFamily: "Roboto-Medium",
            fontSize: 13,
            fontWeight: "normal",
            marginBottom: 10,
            marginTop: 5
        },
        Data4: {
            fontFamily: "Roboto-Medium",
            fontSize: 13,
            opacity: 0.6,
            fontWeight: "bold",
            marginBottom: 10,
            marginTop: 5
        },
        Data5: {
            fontFamily: "Roboto-Medium",
            fontSize: 20,
            fontWeight: 500

        },
        Data6: {
            fontFamily: "Roboto-Medium",
            fontSize: 10,
            marginRight: 15
        },
        Data7: {
            fontFamily: "Roboto-Medium",
            fontSize: 14,
            fontWeight: "normal"
        },
        Data8: {
            fontFamily: "Roboto-Medium",
            fontSize: 10
        },
        Data9: {
            fontFamily: "Roboto-Medium",
            fontSize: 13,
            fontWeight: "normal"
        },
        FormLabel:{
            fontSize: 13
        }
    }
};
theme.setTheme = (userTheme)=> {
    if (userTheme && typeof  userTheme == 'object') {
        if (userTheme.Color && typeof userTheme.Color == 'object') {
            updateInRef(theme.Color, userTheme.Color)
        }
        if (userTheme.Font && typeof userTheme.Font == 'object') {
            updateInRef(theme.Font, userTheme.Font)
        }
        if (userTheme.Image && typeof userTheme.Image == 'object') {
            updateInRef(images, userTheme.Image)
        }
    }
};

const updateInRef = (src, dest)=> {
    for (let k in dest) {
        src[k] = dest[k];
    }
};
module.exports = theme;
