"use strict";
//  MODULE 3: TOOLS - FUNCTION CALLING
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const genai_1 = require("@google/genai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const getTime = (location) => {
    const date = new Date().toLocaleString("en-US", {
        timeZone: "America/New_York", // static for demo
    });
    return `Current time in ${location} is ${date}`;
};
// Configure the client
const ai = new genai_1.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
// Define the function declaration for the model
const timeFunctionDeclaration = {
    name: "get_time",
    description: "Gets the current time for a given location.",
    parameters: {
        type: genai_1.Type.OBJECT,
        properties: {
            location: {
                type: genai_1.Type.STRING,
                description: "The city name, e.g. San Francisco",
            },
        },
        required: ["location"],
    },
};
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    const context = [
        {
            role: "model",
            parts: [{ text: "You are a helpful assistant." }],
        },
        {
            role: "model",
            parts: [{ text: "Okay, I will help you." }],
        },
    ];
    const input = require("prompt-sync")({ sigint: true });
    while (true) {
        const userInput = input("You: ");
        if (userInput.toLowerCase() === "exit") {
            break;
        }
        context.push({ role: "user", parts: [{ text: userInput }] });
        const response = yield ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: context,
            config: {
                tools: [{ functionDeclarations: [timeFunctionDeclaration] }],
            },
        });
        const lastResponsePart = (_d = (_c = (_b = (_a = response.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d[0];
        if (!lastResponsePart) {
            console.log("Gemini: I am sorry, I could not generate a response.");
            continue;
        }
        context.push({ role: "model", parts: [lastResponsePart] });
        if (lastResponsePart.functionCall) {
            const call = lastResponsePart.functionCall;
            console.log(`Function to call: ${call.name}`);
            console.log(`Arguments:`, call.args);
            const result = getTime((_e = call.args) === null || _e === void 0 ? void 0 : _e.location);
            console.log("Function result:", result);
            context.push({
                role: "function",
                parts: [
                    {
                        functionResponse: {
                            name: "get_time",
                            response: { content: result },
                        },
                    },
                ],
            });
            const followupResponse = yield ai.models.generateContent({
                model: "gemini-1.5-flash",
                contents: context,
            });
            const followupText = (_k = (_j = (_h = (_g = (_f = followupResponse.candidates) === null || _f === void 0 ? void 0 : _f[0]) === null || _g === void 0 ? void 0 : _g.content) === null || _h === void 0 ? void 0 : _h.parts) === null || _j === void 0 ? void 0 : _j[0]) === null || _k === void 0 ? void 0 : _k.text;
            console.log("Gemini:", followupText);
            context.push({ role: "model", parts: [{ text: followupText }] });
        }
        else if (lastResponsePart.text) {
            console.log("Gemini:", lastResponsePart.text);
        }
        else {
            console.log("Gemini: No response text found.");
        }
    }
});
main();
