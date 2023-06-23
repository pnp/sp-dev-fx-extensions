import * as React from 'react';
import { ITfLStatusChatWindowProps } from './ITfLStatusChatWindowProps';
import 'react-chat-elements/dist/main.css';
import { MessageList } from 'react-chat-elements';
import { ActionButton, IconButton } from '@fluentui/react/lib/Button';
import { TextField } from '@fluentui/react/lib/TextField';
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner';
import { getStyles, chatButtonStyles, sendChatTextFiledStyles, chatMinimiseButtonStyles, loadingSpinnerStyles } from './styles';
import { IChatMessage, ILine } from '../interfaces';
import { useOpenAI, useTfL } from '../hooks';
import { FUNCTIONS, TRY_LATER_MESSAGE, SYSTEM_MESSAGE } from '../constants/constants';
import { getUserMessage, getSystemMessage, getAssistantMessage, getFunctionMessage } from '../helpers/openaiHelpers';

const TfLStatusChatWindow: React.FC<ITfLStatusChatWindowProps> = (props) => {

    const firstChatMessage: IChatMessage = {
        position: 'left',
        type: 'text',
        title: 'TfL Status Bot',
        text: <>Hi, I am the <b>TfL Status Bot</b>. I can help you with queries about the status of TfL lines. Please type your query below.</>,
        date: null,
        focus: true
    };
    const systemMessage = getSystemMessage(SYSTEM_MESSAGE);

    const [loading, setLoading] = React.useState<boolean>(false);
    const [query, setQuery] = React.useState<string>("");
    const [showChatWindow, setShowChatWindow] = React.useState<boolean>(false);
    const [chatMessages, setChatMessages] = React.useState<IChatMessage[]>([firstChatMessage]);
    const [openaiMessages, setOpenaiMessages] = React.useState<any[]>([systemMessage]);

    const { httpClient } = props;
    const { callOpenAI } = useOpenAI(httpClient);
    const { getLineStatus } = useTfL(httpClient);

    const styles = getStyles();

    // function to show generic message
    const showMessage = (genericMessage: string) => {
        let newChatMessage = {
            position: 'left',
            type: 'text',
            title: 'TfL Status Bot',
            text: <span dangerouslySetInnerHTML={{ __html: genericMessage }}>{ }</span>,
            date: null,
            className: styles.chatMessage,
            focus: true
        };

        // setChatMessages(prevChatMessages => [...prevChatMessages, newChatMessage]);
        setChatMessages(prevChatMessages =>
            [...prevChatMessages.map(chatMessage => ({
                ...chatMessage,
                focus: false
            })), newChatMessage]);
    }

    // function to extract relevant information from TfL API response
    const extractRelevantInformation = (tflAPIResponse: ILine[]) => {

        let relevantInformation: ILine[] = [];

        tflAPIResponse.forEach((line: ILine) => {

            let relevantLine: ILine = {
                id: line.id,
                name: line.name,
                modeName: line.modeName,
                created: line.created,
                modified: line.modified,
                lineStatuses: line.lineStatuses && line.lineStatuses.map((lineStatus) => {
                    return {
                        lineId: lineStatus.lineId,
                        statusSeverity: lineStatus.statusSeverity,
                        statusSeverityDescription: lineStatus.statusSeverityDescription,
                        reason: lineStatus.reason,
                        created: lineStatus.created,
                        disruption: {
                            category: lineStatus.disruption && lineStatus.disruption.category,
                            categoryDescription: lineStatus.disruption && lineStatus.disruption.categoryDescription,
                            description: lineStatus.disruption && lineStatus.disruption.description,
                            closureText: lineStatus.disruption && lineStatus.disruption.closureText
                        }
                    }
                })
            };

            relevantInformation.push(relevantLine);

        });

        return relevantInformation;
    }

    async function callFunction(functionName: string, functionArguments: any) {
        let functionResult;

        if (functionName === "getLineStatus") {
            const lineStatus = await getLineStatus(functionArguments.lineId);
            functionResult = extractRelevantInformation(lineStatus);
        }

        return functionResult;
    }

    // function to process the response from OpenAI
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
                    const function_name = response["choices"][0]["message"]["function_call"]["name"];
                    const function_arguments = response["choices"][0]["message"]["function_call"]["arguments"];
                    const function_arguments_json = JSON.parse(function_arguments);

                    switch (function_name) {
                        case "getLineStatus": {
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
    const onSendClick = async () => {
        setLoading(true);

        // add the user message to the chatMessages array
        let newChatMessage: IChatMessage = {
            position: 'right',
            type: 'text',
            title: 'You',
            text: query,
            date: null,
            status: 'read'
        };

        setChatMessages(prevChatMessages => [...prevChatMessages, newChatMessage]);

        const userMessage = getUserMessage(query);
        setOpenaiMessages(prevMessages => [...prevMessages, userMessage]);

        // clear the text field
        setQuery("");
    }

    // function to handle the text change in the text field
    const onTextChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        setQuery(newValue || "");
    }

    // function to handle the key press in the text field
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
                iconProps={{ iconName: 'ChatBot', className: styles.chatButtonIcon }}
                onClick={() => setShowChatWindow(!showChatWindow)}
                styles={chatButtonStyles}
                className={showChatWindow ? styles.hide : styles.show}>
                TfL Status Chat
            </ActionButton>
            <div className={`${showChatWindow ? styles.show : styles.hide}`}>
                {/* Insert a header with text and a minimise button */}
                <div className={styles.chatWindowHeader}>
                    <div className={styles.chatWindowHeaderText}>TfL Status Bot</div>
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
                        placeholder={loading ? "" : "Type your query here"}
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

export default TfLStatusChatWindow;