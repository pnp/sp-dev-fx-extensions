import * as React from "react";
import { MessageBar, MessageBarType } from "@fluentui/react/lib/MessageBar";
import { Stack } from "@fluentui/react/lib/Stack";
export var ErrorInfo = function (props) {
    var error = props.error, showStack = props.showStack, showError = props.showError;
    return (React.createElement(React.Fragment, null, showError ? (React.createElement(Stack, { tokens: { padding: 10, childrenGap: 10 } },
        React.createElement(MessageBar, { messageBarType: MessageBarType.error, isMultiline: true },
            error.message,
            showStack ? error.stack : ""))) : null));
};
//# sourceMappingURL=ErrorInfo.js.map