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

const TfLStatusChatWindow: React.FC<ITfLStatusChatWindowProps> = (props) => {

    const firstChatMessage: IChatMessage = {
        position: 'left',
        type: 'text',
        title: 'TfL Status Bot',
        text: <>Hi, I am the <b>TfL Status Bot</b>. I can help you with queries about the status of TfL lines. Please type your query below.</>,
        date: null,
        focus: true
    };

    const [loading, setLoading] = React.useState<boolean>(false);
    const [query, setQuery] = React.useState<string>("");
    const [showChatWindow, setShowChatWindow] = React.useState<boolean>(false);
    const [chatMessages, setChatMessages] = React.useState<IChatMessage[]>([firstChatMessage]);

    const { httpClient } = props;
    const { callOpenAI } = useOpenAI(httpClient);
    const { getLineStatus } = useTfL(httpClient);

    const styles = getStyles();

    // function to scroll to the bottom of the chat window
    const scrollToBottom = () => {
        const chatWindow = document.getElementsByClassName('rce-mlist')[0];
        if (chatWindow) {
            chatWindow.scrollTop = chatWindow.scrollHeight;
        }
    }

    // function to show generic message
    const showGenericMessage = (genericMessage: string) => {
        let newChatMessage = {
            position: 'left',
            type: 'text',
            title: 'Personal Assistant',
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
            })), newChatMessage])

        setLoading(false);
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

    async function callFunction(functionName: string, functionArguments: any, messages: any[]) {
        let functionResult;

        if (functionName === "getLineStatus") {
            const lineStatus = await getLineStatus(functionArguments.lineId);
            functionResult = extractRelevantInformation(lineStatus);
        }

        const assistantMessage = {
            role: 'assistant',
            content: "",
            function_call: {
                name: functionName,
                arguments: JSON.stringify(functionArguments)
            }
        };

        // add the assistant message to the messages array
        messages.push(assistantMessage);

        const functionMessage = {
            role: 'function',
            name: functionName,
            content: JSON.stringify(functionResult)
        };

        // add the function message to the messages array
        messages.push(functionMessage);

        return messages;
    }


    // function to process the response from OpenAI
    const processResponse = async (response: any, openaiMessages: any[]) => {

        console.log(response);

        // if response is null or undefined then show an error message
        if (response === null || response === undefined) {
            showGenericMessage(TRY_LATER_MESSAGE);
            return;
        }

        try {

            const response_finish_reason = response["choices"][0]["finish_reason"];

            switch (response_finish_reason) {
                case "stop": {
                    const responseText = response["choices"][0]["message"]["content"];
                    showGenericMessage(responseText);
                    break;
                }
                case "function_call": {
                    const function_name = response["choices"][0]["message"]["function_call"]["name"];
                    const function_arguments = response["choices"][0]["message"]["function_call"]["arguments"];
                    const function_arguments_json = JSON.parse(function_arguments);

                    switch (function_name) {
                        case "getLineStatus": {
                            openaiMessages = await callFunction(function_name, function_arguments_json, openaiMessages);
                            const secondResponse = await callOpenAI(openaiMessages, FUNCTIONS);
                            await processResponse(secondResponse, openaiMessages);
                            break;
                        }
                        case "showFunnyMessage": {
                            const funnyMessage = function_arguments_json.funnyMessage;
                            showGenericMessage(funnyMessage);
                            break;
                        }
                        default:
                            showGenericMessage(TRY_LATER_MESSAGE);
                            break;
                    }
                    break;
                }
                default:
                    showGenericMessage(TRY_LATER_MESSAGE);
            }

        } catch (error) {
            console.log(error);
            showGenericMessage(TRY_LATER_MESSAGE);
            setLoading(false);
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
            status: 'received'
        };

        setChatMessages(prevChatMessages => [...prevChatMessages, newChatMessage]);

        // messages array to send to OpenAI
        let openaiMessages: any[] = [
            {
                role: 'system',
                content: SYSTEM_MESSAGE
            }
        ];

        // add the user message to the messages array
        const userMessage = {
            role: 'user',
            content: query
        };

        openaiMessages.push(userMessage);

        // clear the text field
        setQuery("");

        // call OpenAI
        const response = await callOpenAI(openaiMessages, FUNCTIONS);

        // set status of the last message to read
        setChatMessages(prevChatMessages => {
            const lastChatMessageIndex = prevChatMessages.length - 1;
            const lastChatMessage = prevChatMessages[lastChatMessageIndex];
            const updatedLastChatMessage = {
                ...lastChatMessage,
                status: 'read'
            };
            const updatedChatMessages = [
                ...prevChatMessages.slice(0, lastChatMessageIndex),
                updatedLastChatMessage
            ];
            return updatedChatMessages as IChatMessage[];
        });

        await processResponse(response, openaiMessages);
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


    // useEffect scroll to the bottom of the chat window when messages change
    React.useEffect(() => {
        scrollToBottom();
    }, [chatMessages]);


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