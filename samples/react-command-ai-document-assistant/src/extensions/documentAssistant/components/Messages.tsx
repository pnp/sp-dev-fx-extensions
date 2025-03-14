import * as React from "react";
import { MessageList } from "react-chat-elements";
import { IChatMessage } from "../interfaces/IChatMessage";
import { makeStaticStyles } from "@griffel/react";
import { useChatStyles } from "../styles/styles";

export interface IMessagesProps {
  loading: boolean;
  chatMessages: IChatMessage[];
}

const useChatWindowGlobalStyles = makeStaticStyles([
  {
    "#chatWindow div.rce-container-mbox div.rce-mbox-title": {
      color: '#030303',
      cursor: "default",
      fontSize: "1.2em",
      fontWeight: "400",
    },
    "#chatWindow div.rce-container-mbox, div.rce-mbox-body .rce-mbox-text": {
      fontSize: "1.0em",
    },
    "#chatWindow div.rce-container-mbox div.rce-mbox": {
      boxShadow: "1px 1px 6px 3px rgba(0, 0, 0, .1)",
    },
    "#chatWindow div.rce-container-mbox div.message-focus": {
      animation: "none",
    },
    "#chatWindow div.rce-container-mbox div.message-focus *": {
      animation: "none",
    },
    "#chatWindow .rce-mbox-left-notch":{
        display: "none"
    },
    "#chatWindow .rce-mbox-right-notch":{
        display: "none"
    }
  },
]);

const Messages: React.FC<IMessagesProps> = (props) => {
  const { loading, chatMessages } = props;
  const classes = useChatStyles()
  useChatWindowGlobalStyles();

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = ():void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    // Scroll to the bottom of the div when the messages change.
    scrollToBottom();
  }, [chatMessages]);

  return (
    <div
      className={`${classes.chatWindow} ${loading ? classes.chatLoader : undefined
        } `}
      id="chatWindow"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          alert("ddd");
        }
      }}
    >
       

      <MessageList
        referance={messagesEndRef}
        className={classes.chatWindowMessageList}
        dataSource={chatMessages}
        lockable={true}
        isShowChild={true}
        toBottomHeight={"100%"}
      />
    </div>
  );
};
export default Messages;
