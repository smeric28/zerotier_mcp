import { ZeroTierClient } from "../client.js";
import { z } from "zod";

export const advancedTools = [
    {
        name: "zt_add_route",
        description: "Add a managed route to a network",
        inputSchema: {
            type: "object",
            properties: {
                networkId: { type: "string", description: "The ID of the network" },
                target: { type: "string", description: "Target CIDR (e.g., 10.0.0.0/24)" },
                via: { type: "string", description: "Gateway IP address (optional)" },
            },
            required: ["networkId", "target"],
        },
    },
    {
        name: "zt_set_ip_range",
        description: "Configure the IPv4 assignment pool for a network",
        inputSchema: {
            type: "object",
            properties: {
                networkId: { type: "string", description: "The ID of the network" },
                start: { type: "string", description: "Start IP address" },
                end: { type: "string", description: "End IP address" },
            },
            required: ["networkId", "start", "end"],
        },
    },
    {
        name: "zt_set_dns",
        description: "Configure network-wide DNS settings",
        inputSchema: {
            type: "object",
            properties: {
                networkId: { type: "string", description: "The ID of the network" },
                domain: { type: "string", description: "Search domain" },
                servers: { type: "array", items: { type: "string" }, description: "List of DNS server IPs" },
            },
            required: ["networkId", "domain", "servers"],
        },
    },
    {
        name: "zt_update_rules",
        description: "Update the flow rules for a network",
        inputSchema: {
            type: "object",
            properties: {
                networkId: { type: "string", description: "The ID of the network" },
                rulesSource: { type: "string", description: "The raw rules source text" },
            },
            required: ["networkId", "rulesSource"],
        },
    },
    {
        name: "zt_generate_hosts_file",
        description: "Generate a hosts file content for a network based on member names and IPs",
        inputSchema: {
            type: "object",
            properties: {
                networkId: { type: "string", description: "The ID of the network" },
            },
            required: ["networkId"],
        },
    }
];

export const advancedHandlers = {
    zt_add_route: async (client: ZeroTierClient, args: any) => {
        const { networkId, target, via } = z.object({
            networkId: z.string(),
            target: z.string(),
            via: z.string().optional(),
        }).parse(args);

        const network = await client.getNetwork(networkId);
        const routes = network.config.routes || [];
        routes.push({ target, via: via || null });

        const updatedNetwork = await client.updateNetwork(networkId, { config: { routes } });
        return {
            content: [{ type: "text", text: `Route added successfully:\n${JSON.stringify(updatedNetwork, null, 2)}` }],
        };
    },

    zt_set_ip_range: async (client: ZeroTierClient, args: any) => {
        const { networkId, start, end } = z.object({
            networkId: z.string(),
            start: z.string(),
            end: z.string(),
        }).parse(args);

        const updatedNetwork = await client.updateNetwork(networkId, {
            config: {
                ipAssignmentPools: [{ ipRangeStart: start, ipRangeEnd: end }],
            },
        });
        return {
            content: [{ type: "text", text: `IP range set successfully:\n${JSON.stringify(updatedNetwork, null, 2)}` }],
        };
    },

    zt_set_dns: async (client: ZeroTierClient, args: any) => {
        const { networkId, domain, servers } = z.object({
            networkId: z.string(),
            domain: z.string(),
            servers: z.array(z.string()),
        }).parse(args);

        const updatedNetwork = await client.updateNetwork(networkId, {
            config: {
                dns: {
                    domain: domain,
                    servers: servers,
                },
            },
        } as any);
        return {
            content: [{ type: "text", text: `DNS settings updated successfully:\n${JSON.stringify(updatedNetwork, null, 2)}` }],
        };
    },

    zt_update_rules: async (client: ZeroTierClient, args: any) => {
        const { networkId, rulesSource } = z.object({
            networkId: z.string(),
            rulesSource: z.string(),
        }).parse(args);

        const updatedNetwork = await client.updateNetwork(networkId, {
            config: {
                rulesSource: rulesSource,
            },
        } as any);
        return {
            content: [{ type: "text", text: `Flow rules updated successfully:\n${JSON.stringify(updatedNetwork, null, 2)}` }],
        };
    },

    zt_generate_hosts_file: async (client: ZeroTierClient, args: any) => {
        const { networkId } = z.object({ networkId: z.string() }).parse(args);
        const members = await client.listMembers(networkId);
        const hosts = members
            .filter(m => m.config.authorized && m.ipAssignments.length > 0)
            .map(m => `${m.ipAssignments[0]}\t${m.id}.zt ${m.name || ''}`.trim())
            .join('\n');
        return {
            content: [{ type: "text", text: `# ZeroTier Hosts for network ${networkId}\n${hosts}` }],
        };
    }
};
