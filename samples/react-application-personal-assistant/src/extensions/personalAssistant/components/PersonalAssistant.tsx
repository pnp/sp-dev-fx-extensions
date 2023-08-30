/* eslint-disable dot-notation */
import * as React from 'react';
import { IPersonalAssistantProps } from './IPersonalAssistantProps';
import 'react-chat-elements/dist/main.css';
import { MessageList } from 'react-chat-elements';
import { ActionButton, IconButton } from '@fluentui/react/lib/Button';
import { TextField } from '@fluentui/react/lib/TextField';
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner';
import { ProgressIndicator } from '@fluentui/react/lib/ProgressIndicator';
import { getStyles, chatButtonStyles, sendChatTextFiledStyles, chatMinimiseButtonStyles, loadingSpinnerStyles } from './styles';
import { IChatMessage } from '../interfaces';
import { useOpenAI, useMicrosoftGraph } from '../hooks';
import { FUNCTIONS, BOT_AVATAR_URL, TRY_LATER_MESSAGE, SYSTEM_MESSAGE, CHAT_TEXT_PLACEHOLDER } from '../constants/constants';
import { getUserMessage, getSystemMessage, getAssistantMessage, getFunctionMessage } from '../helpers/openaiHelpers';

const PersonalAssistant: React.FC<IPersonalAssistantProps> = (props) => {

    const avatar: string = BOT_AVATAR_URL;
    const firstChatMessage: IChatMessage = {
        position: 'left',
        type: 'text',
        title: 'Personal Assistant',
        text: <>Hi, I am your <b>personal assistant</b>. How can I help you today?</>,
        date: null,
        avatar
    };
    const systemMessage = getSystemMessage(SYSTEM_MESSAGE);

    const [loading, setLoading] = React.useState<boolean>(false);
    const [query, setQuery] = React.useState<string>("");
    const [showChatWindow, setShowChatWindow] = React.useState<boolean>(false);
    const [chatMessages, setChatMessages] = React.useState<IChatMessage[]>([firstChatMessage]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [openaiMessages, setOpenaiMessages] = React.useState<any[]>([systemMessage]);

    const { httpClient, msGraphClientFactory, currentUserEmail } = props;
    const { callOpenAI } = useOpenAI(httpClient);
    const { getMyDetails, getMyEvents, getMyTasks } = useMicrosoftGraph(msGraphClientFactory);

    const styles = getStyles();

    // function to show generic message
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const showMessage = (genericMessage: string, replaceLastMessage: boolean = true) => {

        if (replaceLastMessage) {

            // replace the last message's text with genericMessage
            setChatMessages(prevChatMessages => {
                const lastChatMessage = prevChatMessages[prevChatMessages.length - 1];
                lastChatMessage.text = <span dangerouslySetInnerHTML={{ __html: genericMessage }}>{ }</span>;

                return [...prevChatMessages.slice(0, prevChatMessages.length - 1), lastChatMessage];
            });
        } else {

            // add a new message with genericMessage
            const newChatMessage: IChatMessage = {
                position: 'left',
                type: 'text',
                title: 'Personal Assistant',
                text: <span dangerouslySetInnerHTML={{ __html: genericMessage }}>{ }</span>,
                date: null,
                className: styles.chatMessage,
                avatar
            };
            setChatMessages(prevChatMessages => [...prevChatMessages, newChatMessage]);
        }
    }

    // function to show loading message
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const showLoadingMessage = () => {
        const newChatMessage: IChatMessage = {
            position: 'left',
            type: 'text',
            title: 'Personal Assistant',
            text: <ProgressIndicator description="Thinking..." />,
            date: null,
            className: styles.chatMessage,
            avatar
        };

        setChatMessages(prevChatMessages => [...prevChatMessages, newChatMessage]);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-explicit-any
    async function callFunction(functionName: string, functionArguments: any) {
        let functionResult;

        if (functionName === "getMyDetails") {
            functionResult = await getMyDetails(functionArguments.getNameOnly);
        } else if (functionName === "getMyEvents") {
            functionResult = await getMyEvents(functionArguments.getFutureEventsOnly);
        } else if (functionName === "getMyTasks") {
            functionResult = await getMyTasks(functionArguments.getIncompleteTasksOnly);
        }

        return functionResult;
    }

    // function to process the response from OpenAI
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-explicit-any
    const processResponse = async (response: any) => {

        console.log(response);

        // if response is null or undefined then show an error message
        if (response === null || response === undefined) {
            showMessage(TRY_LATER_MESSAGE);
            return;
        }

        try {
            const response_finish_reason = response["choices"][0]["finish_reason"];
            switch (response_finish_reason) {
                case "stop": {
                    const responseText = response["choices"][0]["message"]["content"];
                    showMessage(responseText);
                    break;
                }
                case "function_call": {
                    // eslint-disable-next-line dot-notation
                    const function_name = response["choices"][0]["message"]["function_call"]["name"];
                    const function_arguments = response["choices"][0]["message"]["function_call"]["arguments"];
                    const function_arguments_json = JSON.parse(function_arguments);

                    switch (function_name) {
                        case "getMyDetails":
                        case "getMyEvents":
                        case "getMyTasks": {

                            const functionResult = await callFunction(function_name, function_arguments_json);
                            const assistantMessage = getAssistantMessage(function_name, function_arguments_json);
                            const functionMessage = getFunctionMessage(function_name, functionResult);
                            setOpenaiMessages(prevOpenaiMessages => [...prevOpenaiMessages, assistantMessage, functionMessage]);
                            break;
                        }
                        case "showFunnyMessage": {
                            const funnyMessage = function_arguments_json.funnyMessage;
                            showMessage(funnyMessage);
                            break;
                        }
                        default:
                            showMessage(TRY_LATER_MESSAGE);
                            break;
                    }
                    break;
                }
                default:
                    showMessage(TRY_LATER_MESSAGE);
            }

        } catch (error) {
            console.log(error);
            showMessage(TRY_LATER_MESSAGE);
        }

    }

    // function to send a message to OpenAI and get a response
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const onSendClick = async () => {
        // add the user message to the chatMessages array
        const newChatMessage: IChatMessage = {
            position: 'right',
            type: 'text',
            title: 'You',
            text: query,
            date: null,
            status: 'read',
            avatar: `/_layouts/15/userphoto.aspx?size=S&username=${currentUserEmail}`,
        };
        setChatMessages(prevChatMessages => [...prevChatMessages, newChatMessage]);

        // add the user message to the openaiMessages array
        const userMessage = getUserMessage(query);
        setOpenaiMessages(prevMessages => [...prevMessages, userMessage]);

        // show the loading message
        showLoadingMessage();

        // clear the text field
        setQuery("");
    }

    // function to handle the text change in the text field
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const onTextChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        setQuery(newValue || "");
    }

    // function to handle the key press in the text field
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const onKeyDown = async (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (event.key === 'Enter') {
            // if query is empty, then return
            if (query === "") {
                return;
            }
            await onSendClick();
        }
    }

    // function to scroll to the bottom of the chat window
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const scrollToBottom = () => {
        const chatWindow = document.getElementsByClassName('rce-mlist')[0];
        if (chatWindow) {
            chatWindow.scrollTop = chatWindow.scrollHeight;
        }
    }

    // useEffect scroll to the bottom of the chat window when messages change
    React.useEffect(() => {
        scrollToBottom();
    }, [chatMessages]);

    // useEffect to call OpenAI when openaiMessages change
    React.useEffect(() => {

        // if openaiMessages is empty or has only one message, then return
        if (openaiMessages.length === 0 || openaiMessages.length === 1) {
            return;
        }

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        const handleOpenAIResponse = async () => {
            setLoading(true);
            const response = await callOpenAI(openaiMessages, FUNCTIONS);
            await processResponse(response);
            setLoading(false);
        };

        handleOpenAIResponse()
            .catch((error) => {
                console.log(error);
                setLoading(false);
                showMessage(TRY_LATER_MESSAGE);
            });
    }, [openaiMessages]);


    return (
        <div className={styles.chatWindowContainer}>
            <ActionButton
                iconProps={{ iconName: 'Feedback', className: styles.chatButtonIcon }}
                onClick={() => setShowChatWindow(!showChatWindow)}
                styles={chatButtonStyles}
                className={showChatWindow ? styles.hide : styles.show}>
                Personal Assistant
            </ActionButton>
            <div className={`${showChatWindow ? styles.show : styles.hide}`}>
                {/* Insert a header with text and a minimise button */}
                <div className={styles.chatWindowHeader}>
                    <div className={styles.chatWindowHeaderText}>Personal Assistant</div>
                    <IconButton
                        iconProps={{ iconName: 'ChromeMinimize' }}
                        onClick={() => setShowChatWindow(!showChatWindow)}
                        styles={chatMinimiseButtonStyles}
                        style={{ backgroundColor: 'transparent' }}
                    />
                </div>
                <div className={`${styles.chatWindow}`} id="chatWindow">

                    <MessageList
                        className={styles.chatWindowMessageList}
                        lockable={false}
                        toBottomHeight={"100%"}
                        dataSource={chatMessages}
                    />
                </div>
                {/* Insert a textbox woth icon */}
                <div className={styles.chatWindowFooter}>
                    <TextField
                        placeholder={loading ? "" : CHAT_TEXT_PLACEHOLDER}
                        onChange={onTextChange}
                        onKeyDown={onKeyDown}
                        disabled={loading}
                        value={query}
                        autoComplete='off'
                        borderless={true}
                        multiline
                        rows={2}
                        resizable={false}
                        styles={sendChatTextFiledStyles} />
                    <div className={styles.chatWindowFooterButtons}>
                        {
                            loading ?
                                <Spinner size={SpinnerSize.small} styles={loadingSpinnerStyles} />
                                :
                                <IconButton
                                    iconProps={{ iconName: 'Send' }}
                                    onClick={() => onSendClick()}
                                    className={styles.sendChatButton}
                                />
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PersonalAssistant;