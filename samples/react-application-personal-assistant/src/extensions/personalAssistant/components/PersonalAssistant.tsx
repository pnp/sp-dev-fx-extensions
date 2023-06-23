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

const PersonalAssistant: React.FC<IPersonalAssistantProps> = (props) => {

    const avatar: string = BOT_AVATAR_URL;

    const firstChatMessage: IChatMessage = {
        position: 'left',
        type: 'text',
        title: 'Personal Assistant',
        text: <>Hi, I am your <b>personal assistant</b>. How can I help you today?</>,
        date: null,
        focus: true,
        avatar
    };

    const [loading, setLoading] = React.useState<boolean>(false);
    const [query, setQuery] = React.useState<string>("");
    const [showChatWindow, setShowChatWindow] = React.useState<boolean>(false);
    const [chatMessages, setChatMessages] = React.useState<IChatMessage[]>([firstChatMessage]);

    const { httpClient, msGraphClientFactory, currentUserEmail } = props;
    const { callOpenAI } = useOpenAI(httpClient);
    const { callMicrosoftGraphAPI } = useMicrosoftGraph(msGraphClientFactory);

    const styles = getStyles();


    // function to show generic message
    const showGenericMessage = (genericMessage: string) => {

        // replace the last message's text with genericMessage
        // set the focus to false of all the messages except the last one
        setChatMessages(prevChatMessages => {
            let lastChatMessage = prevChatMessages[prevChatMessages.length - 1];
            lastChatMessage.text = <span dangerouslySetInnerHTML={{ __html: genericMessage }}>{ }</span>;
            lastChatMessage.focus = true;

            return [...prevChatMessages.slice(0, prevChatMessages.length - 1), lastChatMessage];
        });

        setLoading(false);
    }

    const showLoadingMessage = () => {
        let newChatMessage: IChatMessage = {
            position: 'left',
            type: 'text',
            title: 'Personal Assistant',
            text: <ProgressIndicator description="Thinking..." />,
            date: null,
            className: styles.chatMessage,
            focus: true,
            avatar
        };

        setChatMessages(prevChatMessages =>
            [...prevChatMessages.map(chatMessage => ({
                ...chatMessage,
                focus: false
            })), newChatMessage])
    }

    const getMyDetails = async (nameOnly: boolean) => {
        const userDetails = await callMicrosoftGraphAPI(
            "get",
            "/me",
            "v1.0"
        );
        if (nameOnly) {
            return {
                displayName: userDetails.displayName
            }
        } else {
            return userDetails;
        }
    }

    const getMyTasks = async (getIncompleteTasksOnly: boolean) => {

        // if getIncompleteTasksOnly is true, then get only incomplete tasks
        if (getIncompleteTasksOnly) {
            console.log("getIncompleteTasksOnly is true");
            // get incomplete tasks
        }

        const myTasks = await callMicrosoftGraphAPI(
            "get",
            "/me/planner/tasks",
            "v1.0",
            null,
            ["title", "startDateTime", "dueDateTime", "percentComplete"],
            [],
            "percentComplete ne 100"
        );

        return myTasks.value.map((task: any) => {
            return {
                title: task.title,
                start: task.startDateTime,
                end: task.dueDateTime,
                percentComplete: task.percentComplete
            };
        });
    }

    const getMyEvents = async (futureEventsOnly: boolean) => {

        // if futureEventsOnly is true, then get only future events
        if (futureEventsOnly) {
            console.log("futureEventsOnly is true");
            // get future events
        }

        const userEvents = await callMicrosoftGraphAPI(
            "get",
            "/me/events",
            "v1.0",
            null,
            ["subject", "start", "end", "attendees", "location"]
        );


        return userEvents.value.map((event: any) => {
            return {
                title: event.subject,
                start: event.start.dateTime,
                end: event.end.dateTime,
                attendees: event.attendees,
                location: event.location
            };
        });
    };

    async function callFunction(functionName: string, functionArguments: any, messages: any[]) {
        let functionResult;

        if (functionName === "getMyDetails") {
            functionResult = await getMyDetails(functionArguments.getNameOnly);
        } else if (functionName === "getMyEvents") {
            functionResult = await getMyEvents(functionArguments.getFutureEventsOnly);
        } else if (functionName === "getMyTasks") {
            functionResult = await getMyTasks(functionArguments.getIncompleteTasksOnly);
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
                        case "getMyDetails":
                        case "getMyEvents":
                        case "getMyTasks": {
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
            status: 'received',
            avatar: `/_layouts/15/userphoto.aspx?size=S&username=${currentUserEmail}`,
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

        showLoadingMessage();

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