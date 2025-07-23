//  MODULE 2: STREAMING

import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

async function streamChat(prompt: string) {
  const stream = await openai.chat.completions.create({
    model: "gemini-2.5-pro", // streaming is best on "pro" models
    stream: true,
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: prompt },
    ],
  });

  process.stdout.write("Gemini: ");
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) process.stdout.write(delta);
  }
  console.log(); // new line at end
}

const input = require("prompt-sync")({ sigint: true });
async function main() {
  while (true) {
    const userInput = input("You: ");
    await streamChat(userInput);
  }
}

main().catch(console.error);


