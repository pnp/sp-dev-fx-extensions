import * as React from 'react';
import { IDocumentChatProps } from '../interfaces/IDocumentChat';
import { DefaultButton, Panel, PanelType, Spinner, SpinnerSize } from '@fluentui/react';
import { useEffect, useState } from 'react';
import { useChatStyles } from '../styles/styles';
import { IChatMessage } from '../interfaces/IChatMessage';
import { useForceUpdate } from '@fluentui/react-hooks';
import { ChatMessage } from '../utils/ChatUtils';
import { AZURE_FUNCTION_BASE_URL, TRY_LATER_MESSAGE } from '../constants/constants';
import Messages from './Messages';
import { Input } from 'react-chat-elements'
import axios from 'axios';


let clearRef = (): void => { }
export const DocumentChatPanel: React.FC<IDocumentChatProps> = (props) => {

    const { siteUrl, listName, driveId, itemId, fileName, currentUser, fileIcon } = props;
    const [isOpen, setIsOpen] = useState(true);
    const classes = useChatStyles();
    const [chatMessages, setChatMessages] = React.useState<IChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [loading, setIsLoading] = React.useState<boolean>(false);
    const divRef = React.useRef(null);
    const inputReferance = React.useRef();
    const forceUpdate = useForceUpdate()

    useEffect(() => {
        // open panel when props change
        setChatMessages([]);
        setIsOpen(true);
    }, [props]);

    const closePanel = ():void => {
        setIsOpen(false);
    };

    const handleSendMessage = async ():Promise<void> => {
        if (inputMessage.trim() === '') return;
        try {
            setIsLoading(true);
            // Clear input field immediately after adding the user message
            clearRef()
            forceUpdate()

            // add the user message to the chatMessages array
            setChatMessages((prevChatMessages) => [
                ...prevChatMessages,
                ChatMessage(
                    "right",
                    true,
                    inputMessage,
                    `/_layouts/15/userphoto.aspx?size=S&username=${currentUser}`
                ),
            ]);

            setInputMessage('');

            const azureFunctionUrl: string = `${AZURE_FUNCTION_BASE_URL}?siteUrl=${siteUrl}&listName=${listName}&driveId=${driveId}&itemId=${itemId}&fileName=${fileName}&question=${inputMessage}`;
            console.log('AI Document Assitant Azure Function URL:', azureFunctionUrl);
            const response = await axios.get(azureFunctionUrl);
            const answer = response.data;

            if (answer) {
                setChatMessages((prevChatMessages) => [
                    ...prevChatMessages,
                    ChatMessage(
                        "left",
                        false,
                        answer.summary,
                        undefined,
                        undefined,
                        true
                    ),
                ]);
            }
            else {
                setChatMessages((prevChatMessages) => [
                    ...prevChatMessages,
                    ChatMessage(
                        "left",
                        false,
                        TRY_LATER_MESSAGE,
                        undefined,
                        undefined,
                        true
                    ),
                ]);
            }

            setIsLoading(false);

        } catch (error) {
            console.error('Error fetching answer:', error);
            setIsLoading(false);
        }
    };

    const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>):void => {
        setInputMessage(e.target.value);
    };

    // const onRenderFooterContent = () => {
    //     return (
    //         <div>
    //             <DefaultButton text="Cancel" onClick={closePanel} />
    //         </div>
    //     );
    // };

    return (
        <Panel isOpen={isOpen}
            type={PanelType.medium}
            isLightDismiss
            headerText="AI Document Assitant"
            // onRenderFooterContent={onRenderFooterContent}
            onDismiss={closePanel}
        >
            <div className={classes.chatWindowContainer} ref={divRef}>

                <div style={{ display: 'flex', alignItems: 'center', margin: '10px 0' }} >
                    <img src={fileIcon} style={{ marginRight: '8px', width: '20px', height: '20px' }} />
                    <span style={{ fontSize: '16px' }}>{fileName}</span>
                </div>

                <Messages loading={loading} chatMessages={chatMessages}></Messages>
                {/* {loading ? <Spinner size={SpinnerSize.medium} /> : null} */}
                <Input
                    className='rce-example-input'
                    referance={inputReferance}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    clear={(clear:(any)) => (clearRef = clear)}
                    defaultValue=''
                    onChange={handleQuestionChange}
                    placeholder="Ask a question..."
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onKeyPress={(e: any) => {
                        if (e.shiftKey && e.charCode === 13) {
                            return true
                        }
                        if (e.charCode === 13) {
                            clearRef()
                            handleSendMessage().catch(console.error)
                        }
                    }}
                    multiline={false}
                    inputStyle={{ backgroundColor: '#fff', padding: '10px', fontSize: '14px', border: '1px solid #dedede' }}
                    rightButtons={loading ? <Spinner size={SpinnerSize.medium} /> : <DefaultButton onClick={handleSendMessage}>Ask</DefaultButton>}
                />
            </div>
        </Panel>
    );
};