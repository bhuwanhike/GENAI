//  MODULE 6: EMBEDDINGS

import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

import path from "node:path";
import { readFileSync, writeFileSync } from "node:fs";

dotenv.config();

type Fruits = {
  id: string;
  name: string;
  description: string;
  embedding?: number[];
};

const LoadFile = (fileName: string) => {
  const filePath = path.resolve(__dirname, "../", fileName);
  const fileData = readFileSync(filePath, "utf-8");
  const jsonFile = JSON.parse(fileData);
  return jsonFile;
};

async function main(fruitDesc: string[]) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: fruitDesc,
  });
  return response;
}

const createFile = (fileName: string, data: any) => {
  const filePath = path.resolve(__dirname, "../", fileName);
  writeFileSync(filePath, JSON.stringify(data), "utf-8");
};

const dotProduct = (vector1: number[], vector2: number[]) => {
  return vector1.reduce((sum, value, index) => sum + value * vector2[index], 0);
};

const cosineSimilarity = (vector1: number[], vector2: number[]) => {
  const dotProd = dotProduct(vector1, vector2);
  const magnitudeA = Math.sqrt(dotProduct(vector1, vector1));
  const magnitudeB = Math.sqrt(dotProduct(vector2, vector2));
  return dotProd / (magnitudeA * magnitudeB);
};

const similaritySearch = (fruits: Fruits[], target: Fruits) => {
  const similarities = fruits.filter((fruit) => fruit.id !== target.id);
  const similarity = similarities.map((fruit) => ({
    ...fruit,
    similarity: cosineSimilarity(fruit.embedding!, target.embedding!),
  }));
  return similarity.sort((a, b) => b.similarity - a.similarity);
};

async function desc() {
  const fruits = LoadFile("fruits.json");
  const fruitDesc = fruits.map((fruit: any) => fruit.description);
  const embeddings = await main(fruitDesc);
  const fruitwithEmbeddings = fruits.map((fruit: any, index: number) => ({
    ...fruit,
    embedding: embeddings.embeddings![index].values,
  }));
  createFile("fruitswithEmbeddings.json", fruitwithEmbeddings);

  const target = fruitwithEmbeddings.find(
    (fruit: Fruits) => fruit.name === "Orange"
  );

  if (!target || !target.embedding) {
    console.log("Target not found or embedding not available");
    return;
  }

  const results = similaritySearch(fruitwithEmbeddings, target);

  results.forEach((similarity) => {
    console.log(similarity.name, similarity.similarity);
  });
}

desc();
