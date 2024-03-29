
import * as React from "react";
import sytles from "./Chat.module.scss";
import { useState, useEffect } from "react";


interface ChatProps {
  label:string
  userPhoto: string
}

const Chat: React.FC<ChatProps> = ({ label, userPhoto }) => {

  const [open, setOpen] = useState<boolean>();

  useEffect(() => {
    if (open === undefined){
      setOpen(false);  
    }     
  });

  function handleClick():void {
    if(open === false) {
			setOpen(true);
		} else {
			setOpen(false);
		}
  }

  return (
    <>
      <div className={`${open ? sytles.chatDrawerOpen : sytles.chatDrawerClose}`}>
        <div className={sytles.chatSlideButton} onClick={handleClick}>
          <div className={sytles.chatLabel}>
            <img className={sytles.chatPicture} src={userPhoto}></img>
            <span className={sytles.chatText}>{label}</span>
            <span className={sytles.openChatIcon}>
              {open === false && 
                <svg className={sytles.openChatSVG} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" data-supported-dps="16x16" fill="currentColor" width="16" height="16" focusable="false">
                  <path d="M15 11L8 6.39 1 11V8.61L8 4l7 4.61z"></path>
                </svg>
              }
              {open === true && 
                <svg className={sytles.openChatSVG} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" data-supported-dps="16x16" fill="currentColor" width="16" height="16" focusable="false">
                  <path d="M1 5l7 4.61L15 5v2.39L8 12 1 7.39z"></path>
                </svg>
              }
            </span>
          </div>          
        </div>
        <div className={sytles.chatContent}>
          <iframe className={sytles.chatFrame} src="https://teams.microsoft.com/embed-client/chats/list?layout=singlePane"></iframe>
        </div>
      </div>
    </>
  );
};

export default Chat;

