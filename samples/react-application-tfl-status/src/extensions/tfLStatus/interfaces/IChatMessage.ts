export interface IChatMessage {
    position: string;
    type: string;
    title: string;
    text: string | JSX.Element;
    date: Date;
    focus?: boolean;
    status? : "waiting" | "sent" | "received" | "read";
    className?: string;
}