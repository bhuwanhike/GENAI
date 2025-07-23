//  MODULE 7: VECTOR DATABASE - CHROMADB

import { ChromaClient, EmbeddingFunction } from "chromadb";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const client = new ChromaClient({
  host: "localhost",
  port: 8000,
});

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

class GeminiEmbedding implements EmbeddingFunction {
  async generate(texts: string[]): Promise<number[][]> {
    const response = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: texts,
    });
    const embeddings: number[][] = response
      .embeddings!.filter((e) => Array.isArray(e.values))
      .map((e) => e.values as number[]);
    return embeddings;
  }
}

const init = async () => {
  const embedder = new GeminiEmbedding();
  const collection = await client.getOrCreateCollection({
    name: "my_collection",
    embeddingFunction: embedder,
  });
  return collection;

  //   const collectionGet = await client.getCollection({
  //     name: "my_collection",
  //     embeddingFunction: embedder,
  //   });

  //   const embeddings = await embedder.generate(["document1", "document2"]);
};

const addMessages = async (id: string, text: string) => {
  const collection = await init();
  await collection.add({
    ids: [id],
    documents: [text],
  });
  console.log("Message added successfully");
};

const getSimilarMessages = async (text: string, limit: number) => {
  const collection = await init();
  const results = await collection.query({
    queryTexts: [text],
    nResults: limit,
  });
  console.log("Similar messages:", results.documents[0]);
  return results.documents[0];
};

const main = async () => {
  await addMessages("1", "Hello, how are you?");
  await addMessages("2", "Sure, I can book your appointment");
  await addMessages("3", "The weather is sunny and warm");
  await getSimilarMessages("what's the weather info?", 1);
};

main();
