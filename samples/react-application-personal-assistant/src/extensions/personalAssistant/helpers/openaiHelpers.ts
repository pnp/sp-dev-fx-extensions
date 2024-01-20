// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-explicit-any
export const getAssistantMessage = (functionName: string, functionArguments: any) => {
    return {
        role: 'assistant',
        content: "",
        function_call: {
            name: functionName,
            arguments: JSON.stringify(functionArguments)
        }
    };
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-explicit-any
export const getFunctionMessage = (functionName: string, functionResult: any) => {
    return {
        role: 'function',
        name: functionName,
        content: JSON.stringify(functionResult)
    };
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getUserMessage = (userMessage: string) => {
    return {
        role: 'user',
        content: userMessage
    };
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getSystemMessage = (systemMessage: string) => {
    return {
        role: 'system',
        content: systemMessage
    };
}