"use strict";
//  MODULE 10: MODEL CONTEXT PROTOCOL - MCP
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const zod_1 = require("zod");
const server = new mcp_js_1.McpServer({
    name: "MCP-Server",
    version: "1.0.0",
});
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const transport = new stdio_js_1.StdioServerTransport();
        yield server.connect(transport);
    });
}
server.registerTool("weather", {
    title: "Weather Tool",
    description: "Get the weather for a given city",
    inputSchema: { city: zod_1.z.string() },
}, (_a) => __awaiter(void 0, [_a], void 0, function* ({ city }) {
    if (city === "katata") {
        return {
            content: [{ type: "text", text: "Weather for katata" }],
        };
    }
    return {
        content: [{ type: "text", text: "village not found" }],
    };
}));
main();
