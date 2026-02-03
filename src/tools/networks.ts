import { ZeroTierClient } from "../client.js";
import { z } from "zod";

export const networkTools = [
  {
    name: "zt_list_networks",
    description: "List all ZeroTier networks",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "zt_get_network",
    description: "Get detailed information about a specific network",
    inputSchema: {
      type: "object",
      properties: {
        networkId: { type: "string", description: "The ID of the network" },
      },
      required: ["networkId"],
    },
  },
  {
    name: "zt_create_network",
    description: "Create a new ZeroTier network",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "The name of the network" },
        description: { type: "string", description: "Description of the network" },
        private: { type: "boolean", description: "Whether the network is private (default: true)" },
      },
      required: ["name"],
    },
  },
  {
    name: "zt_delete_network",
    description: "Delete a ZeroTier network",
    inputSchema: {
      type: "object",
      properties: {
        networkId: { type: "string", description: "The ID of the network to delete" },
      },
      required: ["networkId"],
    },
  },
];

export const networkHandlers = {
  zt_list_networks: async (client: ZeroTierClient) => {
    const networks = await client.listNetworks();
    return {
      content: [{ type: "text", text: JSON.stringify(networks, null, 2) }],
    };
  },

  zt_get_network: async (client: ZeroTierClient, args: any) => {
    const { networkId } = z.object({ networkId: z.string() }).parse(args);
    const network = await client.getNetwork(networkId);
    return {
      content: [{ type: "text", text: JSON.stringify(network, null, 2) }],
    };
  },

  zt_create_network: async (client: ZeroTierClient, args: any) => {
    const { name, description, private: isPrivate } = z.object({
      name: z.string(),
      description: z.string().optional(),
      private: z.boolean().optional().default(true),
    }).parse(args);

    const network = await client.createNetwork({
      config: { name, private: isPrivate },
      description: description || ""
    });

    return {
      content: [{ type: "text", text: `Network created successfully:\n${JSON.stringify(network, null, 2)}` }],
    };
  },

  zt_delete_network: async (client: ZeroTierClient, args: any) => {
    const { networkId } = z.object({ networkId: z.string() }).parse(args);
    await client.deleteNetwork(networkId);
    return {
      content: [{ type: "text", text: `Network ${networkId} deleted successfully.` }],
    };
  },
};
