//  MODULE 3: TOOLS - FUNCTION CALLING

import { GoogleGenAI, Type } from "@google/genai";

import dotenv from "dotenv";
dotenv.config();

const getTime = (location: string): string => {
  const date = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York", // static for demo
  });
  return `Current time in ${location} is ${date}`;
};

// Configure the client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Define the function declaration for the model
const timeFunctionDeclaration = {
  name: "get_time",
  description: "Gets the current time for a given location.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      location: {
        type: Type.STRING,
        description: "The city name, e.g. San Francisco",
      },
    },
    required: ["location"],
  },
};

const main = async () => {
  const context: any[] = [
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
    const userInput: string = input("You: ");
    if (userInput.toLowerCase() === "exit") {
      break;
    }

    context.push({ role: "user", parts: [{ text: userInput }] });

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: context,
      config: {
        tools: [{ functionDeclarations: [timeFunctionDeclaration] }],
      },
    });

    const lastResponsePart = response.candidates?.[0]?.content?.parts?.[0];
    if (!lastResponsePart) {
      console.log("Gemini: I am sorry, I could not generate a response.");
      continue;
    }

    context.push({ role: "model", parts: [lastResponsePart] });

    if (lastResponsePart.functionCall) {
      const call = lastResponsePart.functionCall;
      console.log(`Function to call: ${call.name}`);
      console.log(`Arguments:`, call.args);
      const result = getTime(call.args?.location as string);
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

      const followupResponse = await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: context,
      });

      const followupText =
        followupResponse.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log("Gemini:", followupText);
      context.push({ role: "model", parts: [{ text: followupText }] });
    } else if (lastResponsePart.text) {
      console.log("Gemini:", lastResponsePart.text);
    } else {
      console.log("Gemini: No response text found.");
    }
  }
};

main();
