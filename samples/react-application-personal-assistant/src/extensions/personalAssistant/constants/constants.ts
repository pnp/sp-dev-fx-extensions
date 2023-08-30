export const OPENAI_API_KEY = "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
export const OPENAI_API_ENDPOINT = "https://api.openai.com/v1/chat/completions";
// export const GPT_MODELTO_USE = "gpt-3.5-turbo-0613";
export const GPT_MODELTO_USE = "gpt-4-0613";
export const BOT_AVATAR_URL = "https://raw.githubusercontent.com/endore8/i-chatbot/master/assets/icon.png";
export const TRY_LATER_MESSAGE = "Sorry, I am unable to process your query at the moment. Please try again later.";
export const SYSTEM_MESSAGE = `
You are a personal assistant. 
Answer should be embedded in html tags surrounded in <span></span>. 
Use <b> or <i> tags to highlight the answer where needed. 
Use <ul> and <li> tags for lists. 
For events and tasks note that today is ${new Date()}.`;
export const CHAT_TEXT_PLACEHOLDER: string = "Enter your query here...";
export const FUNCTIONS = [
    {
        "name": "getMyDetails",
        "description": "Get the details of the current user",
        "parameters": {
            "type": "object",
            "properties": {
                "getNameOnly": {
                    "type": "boolean",
                    "description": "Get user's name only"
                }
            },
            "required": [
                "getNameOnly"
            ]
        }
    },
    {
        "name": "getMyEvents",
        "description": "Get the events in a calendar of the current user",
        "parameters": {
            "type": "object",
            "properties": {
                "getFutureEventsOnly": {
                    "type": "boolean",
                    "description": "Get future events only"
                }
            },
            "required": [
                "getFutureEventsOnly"
            ]
        }
    },
    {
        "name": "getMyTasks",
        "description": "Get the tasks from the Microsoft planner of the current user",
        "parameters": {
            "type": "object",
            "properties": {
                "getIncompleteTasksOnly": {
                    "type": "boolean",
                    "description": "Get incomplete only"
                }
            },
            "required": [
                "getIncompleteTasksOnly"
            ]
        }
    },
    {
        "name": "showFunnyMessage",
        "description": "If user's query is not related to work based personal assistance then show a funny message",
        "parameters": {
            "type": "object",
            "required": [
                "funnyMessage"
            ],
            "properties": {
                "funnyMessage": {
                    "type": "string",
                    "description": "A funny/sarcastic message to say why user's query is not related to work based personal assistance. Max 20 words."
                }
            }
        }
    }
];