#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import dotenv from "dotenv";
import { ZeroTierClient } from "./client.js";
import { networkTools, networkHandlers } from "./tools/networks.js";
import { memberTools, memberHandlers } from "./tools/members.js";
import { advancedTools, advancedHandlers } from "./tools/advanced.js";
import path from "path";
import fs from "fs";
import os from "os";
import readline from "readline";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Constants for configuration
const CONFIG_DIR = path.join(os.homedir(), ".zerotier-mcp");
const CONFIG_FILE = path.join(CONFIG_DIR, ".env");

// --- Setup Command Handler ---
if (process.argv.includes("setup")) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("ZeroTier MCP Server Setup");
  console.log("-------------------------");
  console.log("This will store your ZeroTier Central Token in your home directory.");

  rl.question("Enter your ZeroTier Central Token: ", (token) => {
    if (!token.trim()) {
      console.error("Token cannot be empty.");
      process.exit(1);
    }

    try {
      if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true });
      }
      fs.writeFileSync(CONFIG_FILE, `ZEROTIER_CENTRAL_TOKEN=${token.trim()}\n`);
      console.log(`\nConfiguration saved to ${CONFIG_FILE}`);
      console.log("You can now run the server.");
    } catch (err) {
      console.error("Failed to save configuration:", err);
      process.exit(1);
    }
    rl.close();
    process.exit(0);
  });
} else {
  // --- Normal Server Mode ---

  // 1. Try loading from process.env (e.g. injected by OpenCode)
  let token = process.env.ZEROTIER_CENTRAL_TOKEN;

  // 2. If not found, try loading from local .env (development mode)
  if (!token) {
    dotenv.config({ path: path.resolve(__dirname, "../.env") });
    token = process.env.ZEROTIER_CENTRAL_TOKEN;
  }

  // 3. If still not found, try loading from home directory config (global install mode)
  if (!token && fs.existsSync(CONFIG_FILE)) {
    const config = dotenv.parse(fs.readFileSync(CONFIG_FILE));
    token = config.ZEROTIER_CENTRAL_TOKEN;
  }

  if (!token) {
    console.error("Error: ZEROTIER_CENTRAL_TOKEN not found.");
    console.error("Please run 'zerotier-mcp setup' to configure your API token.");
    process.exit(1);
  }

  const client = new ZeroTierClient(token);

  const server = new Server(
    {
      name: "zerotier-mcp",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  /**
   * Tool definitions
   */
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        ...networkTools,
        ...memberTools,
        ...advancedTools,
      ],
    };
  });

  /**
   * Tool execution handlers
   */
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    const allHandlers: Record<string, (client: ZeroTierClient, args: any) => Promise<any>> = {
      ...networkHandlers,
      ...memberHandlers,
      ...advancedHandlers,
    };

    try {
      const handler = allHandlers[name];
      if (handler) {
        return await handler(client, args);
      }
      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new McpError(ErrorCode.InvalidParams, `Invalid arguments: ${error.issues.map((e: z.ZodIssue) => e.message).join(", ")}`);
      }
      const axiosError = error as any;
      const errorMessage = axiosError.response?.data?.message || axiosError.message || String(error);
      return {
        isError: true,
        content: [{ type: "text", text: `Error: ${errorMessage}` }],
      };
    }
  });

  /**
   * Start the server using stdio transport.
   */
  const main = async () => {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("ZeroTier MCP server running on stdio");
  };

  main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
  });
}
