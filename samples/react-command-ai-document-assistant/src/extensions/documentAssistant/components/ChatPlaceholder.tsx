// Copyright (c) Microsoft. All rights reserved.

import { Image, makeStyles } from "@fluentui/react-components";
import * as React from "react";
import placeholder from "./assets/chat-placeholder.png";
//import { INITIAL_MESSAGE_PLACEHOLDER } from "./constants/constants"
const useStyles = makeStyles({
  root: {},
  image: {
    width: "100%",
  },
});

const ChatPlaceholder: React.FunctionComponent<{}> = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div>
        {/* <p>{INITIAL_MESSAGE_PLACEHOLDER}</p> */}
        <Image
          role="presentation"
          className={classes.image}
          src={placeholder}
        />
      </div>
    </div>
  );
};
export default ChatPlaceholder;
