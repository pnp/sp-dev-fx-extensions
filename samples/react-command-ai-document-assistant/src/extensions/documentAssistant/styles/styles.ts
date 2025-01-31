import { makeStyles } from "@fluentui/react";

export const useChatStyles = makeStyles({
    chatWindowContainer: {
        position: "relative",
        // bottom: "20px",
        // right: "0px",
        // left: 0
    },
    chatWindow: {
        backgroundColor: '#f8f8f8',
        color: '',
        padding: "2px 10px 0 10px",
        width: "100%", //1140px
        minHeight: "83vh",
        boxSizing: "border-box",
        overflow: "auto",
        ".rce-container-mbox": {
            marginBottom: "15px",
        },
        ".rce-avatar": {
            borderRadius: "50%",
        },
        // ".rce-mbox-title": {
        //   cursor: "default",
        //   color: customTokens.kpmgPrimaryBackground,
        // },
        ".rce-mbox-title:hover": {
            textDecoration: "none",
        }

    },
    chatLoader: {        
        justifyContent: "center",
        alignItems: "center",
    },
    chatWindowMessageList: {
        maxHeight: "83vh",
        padding: "0px 2px",
        borderRadius: "5px",
        backgroundColor: '#f8f8f8',
    },


});