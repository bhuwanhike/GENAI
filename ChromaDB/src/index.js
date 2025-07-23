"use strict";
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
const chromadb_1 = require("chromadb");
const genai_1 = require("@google/genai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const client = new chromadb_1.ChromaClient({
    host: "localhost",
    port: 8000,
});
const ai = new genai_1.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
class GeminiEmbedding {
    generate(texts) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield ai.models.embedContent({
                model: "gemini-embedding-001",
                contents: texts,
            });
            const embeddings = response
                .embeddings.filter((e) => Array.isArray(e.values))
                .map((e) => e.values);
            return embeddings;
        });
    }
}
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    const embedder = new GeminiEmbedding();
    const collection = yield client.getOrCreateCollection({
        name: "my_collection",
        embeddingFunction: embedder,
    });
    return collection;
    //   const collectionGet = await client.getCollection({
    //     name: "my_collection",
    //     embeddingFunction: embedder,
    //   });
    //   const embeddings = await embedder.generate(["document1", "document2"]);
});
const addMessages = (id, text) => __awaiter(void 0, void 0, void 0, function* () {
    const collection = yield init();
    yield collection.add({
        ids: [id],
        documents: [text],
    });
    console.log("Message added successfully");
});
const getSimilarMessages = (text, limit) => __awaiter(void 0, void 0, void 0, function* () {
    const collection = yield init();
    const results = yield collection.query({
        queryTexts: [text],
        nResults: limit,
    });
    console.log("Similar messages:", results.documents[0]);
    return results.documents[0];
});
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    yield addMessages("1", "Hello, how are you?");
    yield addMessages("2", "Sure, I can book your appointment");
    yield addMessages("3", "The weather is sunny and warm");
    yield getSimilarMessages("what's the weather info?", 1);
});
main();
