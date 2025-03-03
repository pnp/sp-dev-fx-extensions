export interface IChatMessage {
  position: string;
  type: string;
  avatar?: string;
  title: string;
  text: string | JSX.Element;
  date: Date | undefined;
  focus?: boolean;
  status?: "waiting" | "sent" | "received" | "read";
  className?: string;
  statusColor?: string;
  statusColorType?: string;
}
