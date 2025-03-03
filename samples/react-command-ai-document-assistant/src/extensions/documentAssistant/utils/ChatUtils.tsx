import { IChatMessage } from "../interfaces/IChatMessage";
import { App_NAME } from "../constants/constants";
import bIcon from "../assets/icon-bot.png";
export function ChatMessage(
  position: string,
  isUser: boolean,
  text: string | JSX.Element,
  avatar?: string,
  className?: string,
  focus?: boolean
): IChatMessage {
  return {
    position: position || "left",
    type: "text",
    title: isUser ? "You" : App_NAME,
    text: text || "",
    date: new Date(),
    avatar: avatar || bIcon,
    statusColorType: "encircle",
    className: className || undefined,
    focus: focus || true,
  };
}
