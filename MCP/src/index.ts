//  MODULE 10: MODEL CONTEXT PROTOCOL - MCP

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "MCP-Server",
  version: "1.0.0",
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

server.registerTool(
  "weather",
  {
    title: "Weather Tool",
    description: "Get the weather for a given city",
    inputSchema: { city: z.string() },
  },
  async ({ city }) => {
    if (city === "katata") {
      return {
        content: [{ type: "text", text: "Weather for katata" }],
      };
    }
    return {
      content: [{ type: "text", text: "village not found" }],
    };
  }
);
main();
