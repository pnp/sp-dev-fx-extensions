/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { css } from "@emotion/css";
import { tokens } from "@fluentui/react-components";

export const useIssueStyles = () => {
    return {
        issueContainer: css({
            display: 'flex',
            flexDirection: 'column',
            padding: '15px',
            borderRadius: '5px',
            backgroundColor:  tokens.colorNeutralBackground3,
            boxShadow: tokens.shadow4,
            marginBottom: '10px',
            
        }),
        
    };
    }