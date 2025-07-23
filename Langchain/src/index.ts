//  MODULE 8: Langchain

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import dotenv from "dotenv";
dotenv.config();

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0,
  maxOutputTokens: 100,
  streaming: true,
});
const main = async () => {
  const stream = await model.stream("how are you");

  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
    console.log(`${chunk.content}|`);
  }
};
main();
