//  MODULE 9: RAG

import dotenv from "dotenv";
dotenv.config();
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

import path from "node:path";
import { readFileSync, writeFileSync } from "node:fs";
import { Document } from "@langchain/core/documents";

import {
  GoogleGenerativeAIEmbeddings,
  ChatGoogleGenerativeAI,
} from "@langchain/google-genai";

const LoadFile = async (fileName: string) => {
  const filePath = path.resolve(__dirname, "../", fileName);
  const fileData = readFileSync(filePath, "utf-8");
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 100,
    chunkOverlap: 20,
  });
  const docs = await splitter.splitDocuments([
    new Document({ pageContent: fileData }),
  ]);
  // const embeddings = new GoogleGenerativeAIEmbeddings({
  //   apiKey: process.env.GEMINI_API_KEY || "",
  //   // If you need to specify a model name, you can add it here:
  //   // model: "gemini-embedding-001" // or "text-embedding-004" etc.
  // });
  // console.log(docs);
  const vectorStore = await MemoryVectorStore.fromDocuments(
    docs,
    new GoogleGenerativeAIEmbeddings()
  );

  const retriever = vectorStore.asRetriever();
  const ques = "when was the world cup?";
  const result = await retriever.getRelevantDocuments(ques);

  const context = result.map((doc, index) => {
    return `${index + 1}. ${doc.pageContent}`;
  });

  const prompt = `
You are a helpful assistant. Use the context below to answer the question: 
Context: ${context}

Question: ${ques}`;

  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
  });

  const response = await model.invoke(prompt);

  console.log(response.content);
};

LoadFile("docs.txt");
