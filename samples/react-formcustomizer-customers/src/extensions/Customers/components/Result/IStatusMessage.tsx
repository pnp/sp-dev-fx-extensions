import { ResultStatusType } from "antd/lib/result";

export interface IStatusMessage {
    resultType: ResultStatusType;
    title: string;
    subTitle?: string;
    onClose?: () => void;
}