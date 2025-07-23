"use strict";
//  MODULE 9: RAG
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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const textsplitters_1 = require("@langchain/textsplitters");
const memory_1 = require("langchain/vectorstores/memory");
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = require("node:fs");
const documents_1 = require("@langchain/core/documents");
const google_genai_1 = require("@langchain/google-genai");
const LoadFile = (fileName) => __awaiter(void 0, void 0, void 0, function* () {
    const filePath = node_path_1.default.resolve(__dirname, "../", fileName);
    const fileData = (0, node_fs_1.readFileSync)(filePath, "utf-8");
    const splitter = new textsplitters_1.RecursiveCharacterTextSplitter({
        chunkSize: 100,
        chunkOverlap: 20,
    });
    const docs = yield splitter.splitDocuments([
        new documents_1.Document({ pageContent: fileData }),
    ]);
    // const embeddings = new GoogleGenerativeAIEmbeddings({
    //   apiKey: process.env.GEMINI_API_KEY || "",
    //   // If you need to specify a model name, you can add it here:
    //   // model: "gemini-embedding-001" // or "text-embedding-004" etc.
    // });
    // console.log(docs);
    const vectorStore = yield memory_1.MemoryVectorStore.fromDocuments(docs, new google_genai_1.GoogleGenerativeAIEmbeddings());
    const retriever = vectorStore.asRetriever();
    const ques = "when was the world cup?";
    const result = yield retriever.getRelevantDocuments(ques);
    const context = result.map((doc, index) => {
        return `${index + 1}. ${doc.pageContent}`;
    });
    const prompt = `
You are a helpful assistant. Use the context below to answer the question: 
Context: ${context}

Question: ${ques}`;
    const model = new google_genai_1.ChatGoogleGenerativeAI({
        model: "gemini-2.5-flash",
    });
    const response = yield model.invoke(prompt);
    console.log(response.content);
});
LoadFile("docs.txt");
