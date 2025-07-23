//  MODULE 1: MULTI TURN CHATBOT - TEXT GENERATION

import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  baseURL: "https://generativelanguage.googleapis.com/v1beta",
});

const getTime = (location: string): string => {
  const date = new Date();
  return `The current date in ${location} is ${date.toLocaleString("en-US", {
    timeZone: "America/New_York",
  })}`;
};

async function main(): Promise<void> {
  const tools: OpenAI.Chat.ChatCompletionTool[] = [
    {
      type: "function",
      function: {
        name: "get_time",
        description: "Get the time in a given location",
        parameters: {
          type: "object",
          properties: {
            location: {
              type: "string",
              description: "The city and state, e.g. New York, NY",
            },
          },
          required: ["location"],
        },
      },
    },
  ];
  const input = require("prompt-sync")({ sigInt: true });
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: "You are a helpful assistant.",
    },
  ];

  while (true) {
    const userInput = input("enter: ") as string;

    messages.push({
      role: "user",
      content: userInput,
    });

    const initialResponse = await openai.chat.completions.create({
      model: "gemini-2.5-flash",
      messages,
    });
    messages.push({
      role: "assistant",
      content: initialResponse.choices[0].message?.content,
    });
    console.log(initialResponse.choices[0].message?.content);
  }
}

main().catch((err) => console.error("Error:", err));
