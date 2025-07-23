"use strict";
// MODULE 4: TEXT TO SPEECH
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
const wav_1 = __importDefault(require("wav"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function saveWaveFile(filename_1, pcmData_1) {
    return __awaiter(this, arguments, void 0, function* (filename, pcmData, channels = 1, rate = 24000, sampleWidth = 2) {
        return new Promise((resolve, reject) => {
            const writer = new wav_1.default.FileWriter(filename, {
                channels,
                sampleRate: rate,
                bitDepth: sampleWidth * 8,
            });
            writer.on("finish", resolve);
            writer.on("error", reject);
            writer.write(pcmData);
            writer.end();
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f;
        const ai = new genai_1.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
        const response = yield ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: "Say cheerfully: Have a wonderful day!" }] }],
            config: {
                responseModalities: ["AUDIO"],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: "Kore" },
                    },
                },
            },
        });
        const data = (_f = (_e = (_d = (_c = (_b = (_a = response.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.inlineData) === null || _f === void 0 ? void 0 : _f.data;
        const audioBuffer = Buffer.from(data || "", "base64");
        const fileName = "out.wav";
        yield saveWaveFile(fileName, audioBuffer.toString());
    });
}
main();
