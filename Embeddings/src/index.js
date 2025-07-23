"use strict";
//  MODULE 6: EMBEDDINGS
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
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = require("node:fs");
dotenv_1.default.config();
const LoadFile = (fileName) => {
    const filePath = node_path_1.default.resolve(__dirname, "../", fileName);
    const fileData = (0, node_fs_1.readFileSync)(filePath, "utf-8");
    const jsonFile = JSON.parse(fileData);
    return jsonFile;
};
function main(fruitDesc) {
    return __awaiter(this, void 0, void 0, function* () {
        const ai = new genai_1.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
        const response = yield ai.models.embedContent({
            model: "gemini-embedding-001",
            contents: fruitDesc,
        });
        return response;
    });
}
const createFile = (fileName, data) => {
    const filePath = node_path_1.default.resolve(__dirname, "../", fileName);
    (0, node_fs_1.writeFileSync)(filePath, JSON.stringify(data), "utf-8");
};
const dotProduct = (vector1, vector2) => {
    return vector1.reduce((sum, value, index) => sum + value * vector2[index], 0);
};
const cosineSimilarity = (vector1, vector2) => {
    const dotProd = dotProduct(vector1, vector2);
    const magnitudeA = Math.sqrt(dotProduct(vector1, vector1));
    const magnitudeB = Math.sqrt(dotProduct(vector2, vector2));
    return dotProd / (magnitudeA * magnitudeB);
};
const similaritySearch = (fruits, target) => {
    const similarities = fruits.filter((fruit) => fruit.id !== target.id);
    const similarity = similarities.map((fruit) => (Object.assign(Object.assign({}, fruit), { similarity: cosineSimilarity(fruit.embedding, target.embedding) })));
    return similarity.sort((a, b) => b.similarity - a.similarity);
};
function desc() {
    return __awaiter(this, void 0, void 0, function* () {
        const fruits = LoadFile("fruits.json");
        const fruitDesc = fruits.map((fruit) => fruit.description);
        const embeddings = yield main(fruitDesc);
        const fruitwithEmbeddings = fruits.map((fruit, index) => (Object.assign(Object.assign({}, fruit), { embedding: embeddings.embeddings[index].values })));
        createFile("fruitswithEmbeddings.json", fruitwithEmbeddings);
        const target = fruitwithEmbeddings.find((fruit) => fruit.name === "Orange");
        if (!target || !target.embedding) {
            console.log("Target not found or embedding not available");
            return;
        }
        const results = similaritySearch(fruitwithEmbeddings, target);
        results.forEach((similarity) => {
            console.log(similarity.name, similarity.similarity);
        });
    });
}
desc();
