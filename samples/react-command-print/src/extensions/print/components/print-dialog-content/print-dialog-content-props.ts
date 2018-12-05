export default interface IPrintDialogContentProps {
    close: () => void;
    webUrl: string;
    listId: string;
    itemId: number;
    title: string;
}