import { ZeroTierClient } from "../client.js";
import { z } from "zod";

export const memberTools = [
    {
        name: "zt_list_members",
        description: "List all members of a specific network",
        inputSchema: {
            type: "object",
            properties: {
                networkId: { type: "string", description: "The ID of the network" },
            },
            required: ["networkId"],
        },
    },
    {
        name: "zt_get_member",
        description: "Get detailed information about a specific network member",
        inputSchema: {
            type: "object",
            properties: {
                networkId: { type: "string", description: "The ID of the network" },
                memberId: { type: "string", description: "The ID of the member (node ID)" },
            },
            required: ["networkId", "memberId"],
        },
    },
    {
        name: "zt_authorize_member",
        description: "Authorize or deauthorize a member on a network",
        inputSchema: {
            type: "object",
            properties: {
                networkId: { type: "string", description: "The ID of the network" },
                memberId: { type: "string", description: "The ID of the member (node ID)" },
                authorized: { type: "boolean", description: "Whether the member should be authorized" },
            },
            required: ["networkId", "memberId", "authorized"],
        },
    },
    {
        name: "zt_update_member",
        description: "Update a network member (name, description, etc.)",
        inputSchema: {
            type: "object",
            properties: {
                networkId: { type: "string", description: "The ID of the network" },
                memberId: { type: "string", description: "The ID of the member" },
                name: { type: "string", description: "New name for the member" },
                description: { type: "string", description: "New description for the member" },
                noAutoAssignIps: { type: "boolean", description: "Whether to disable auto-assignment of IPs" },
                activeBridge: { type: "boolean", description: "Whether the member is an active bridge" },
            },
            required: ["networkId", "memberId"],
        },
    },
    {
        name: "zt_delete_member",
        description: "Delete (forget) a member from a network",
        inputSchema: {
            type: "object",
            properties: {
                networkId: { type: "string", description: "The ID of the network" },
                memberId: { type: "string", description: "The ID of the member to delete" },
            },
            required: ["networkId", "memberId"],
        },
    },
];

export const memberHandlers = {
    zt_list_members: async (client: ZeroTierClient, args: any) => {
        const { networkId } = z.object({ networkId: z.string() }).parse(args);
        const members = await client.listMembers(networkId);
        return {
            content: [{ type: "text", text: JSON.stringify(members, null, 2) }],
        };
    },

    zt_get_member: async (client: ZeroTierClient, args: any) => {
        const { networkId, memberId } = z.object({ networkId: z.string(), memberId: z.string() }).parse(args);
        const member = await client.getMember(networkId, memberId);
        return {
            content: [{ type: "text", text: JSON.stringify(member, null, 2) }],
        };
    },

    zt_authorize_member: async (client: ZeroTierClient, args: any) => {
        const { networkId, memberId, authorized } = z.object({
            networkId: z.string(),
            memberId: z.string(),
            authorized: z.boolean(),
        }).parse(args);
        const member = await client.updateMember(networkId, memberId, { config: { authorized } });
        return {
            content: [{ type: "text", text: `Member ${memberId} authorization set to ${authorized}:\n${JSON.stringify(member, null, 2)}` }],
        };
    },

    zt_update_member: async (client: ZeroTierClient, args: any) => {
        const { networkId, memberId, ...rest } = z.object({
            networkId: z.string(),
            memberId: z.string(),
            name: z.string().optional(),
            description: z.string().optional(),
            noAutoAssignIps: z.boolean().optional(),
            activeBridge: z.boolean().optional(),
        }).parse(args);

        const member = await client.updateMember(networkId, memberId, rest);
        return {
            content: [{ type: "text", text: `Member ${memberId} updated successfully:\n${JSON.stringify(member, null, 2)}` }],
        };
    },

    zt_delete_member: async (client: ZeroTierClient, args: any) => {
        const { networkId, memberId } = z.object({ networkId: z.string(), memberId: z.string() }).parse(args);
        await client.deleteMember(networkId, memberId);
        return {
            content: [{ type: "text", text: `Member ${memberId} deleted from network ${networkId}.` }],
        };
    },
};
