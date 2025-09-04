import { css } from "@emotion/css";
import { tokens } from "@fluentui/react-components";

interface ServiceHealthStyles {
    statusBullet: string;
 
    gridContainer: string;
}

export const useServiceHealthStyles = (): ServiceHealthStyles => {
    

    return {
        statusBullet: css({
            display: "inline-block",
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            marginRight: "8px",
        
        }),
       
        gridContainer: css({
               
              display: "grid",
              gridTemplateColumns: "1fr",
              height: "calc(100vh - 280px)",
             
              overflowY: "auto",
              overflowX: "hidden",
        
              // Scrollbar styles
              "::-webkit-scrollbar": {
                width: "5px", // Width for vertical scrollbars
                height: "5px", // Height for horizontal scrollbars
              },
              "::-webkit-scrollbar-track": {
                background: tokens.colorNeutralBackground4, // Light gray for the track
                borderRadius: "10px",
              },
              "::-webkit-scrollbar-thumb": {
                background: tokens.colorBrandStroke2Hover, // Dark gray for the thumb
                borderRadius: "10px",
              },
              "::-webkit-scrollbar-thumb:hover": {
                background: tokens.colorNeutralStroke2, // Dark gray for the thumb
              },
            }),
    };
}
