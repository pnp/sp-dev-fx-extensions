export const OPENAI_API_KEY = "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
export const OPENAI_API_ENDPOINT = "https://api.openai.com/v1/chat/completions";
// export const GPT_MODELTO_USE = "gpt-3.5-turbo-0613";
export const GPT_MODELTO_USE = "gpt-4-0613";
export const TRY_LATER_MESSAGE = "Sorry, I am unable to process your query at the moment. Please try again later.";
export const SYSTEM_MESSAGE = `
You are a TfL customer service agent. 
You are helping a customer with a query about the status of a line.
Your final reply must be in HTML format surrounded in <span></span>.
Make the status bold using <b></b>.
If user's query is not related to TfL status then show a funny message.`;
export const FUNCTIONS = [
    {
        "name": "getLineStatus",
        "description": "Get the status of a London Underground line",
        "parameters": {
            "type": "object",
            "required": [
                "lineId"
            ],
            "properties": {
                "lineId": {
                    "type": "string",
                    "description": "The id of the London Underground line",
                    "enum": ["bakerloo", "central", "circle", "district", "dlr", "elizabeth", "hammersmith-city", "jubilee", "london-overground", "metropolitan", "northern", "piccadilly", "tram", "victoria", "waterloo-city"]
                }
            }
        }
    }/* ,
    {
        "name": "showFunnyMessage",
        "description": "If user's query is not related to TfL status then show a funny message",
        "parameters": {
            "type": "object",
            "required": [
                "funnyMessage"
            ],
            "properties": {
                "funnyMessage": {
                    "type": "string",
                    "description": "A funny message to say why user's query is not related to TfL. Max 20 words."
                }
            }
        }
    } */
]