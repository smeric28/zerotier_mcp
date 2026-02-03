import axios, { AxiosInstance } from 'axios';
import { 
  ZeroTierNetwork, 
  ZeroTierMember, 
  UpdateNetworkPayload, 
  UpdateMemberPayload 
} from './types.js';

export class ZeroTierClient {
  private client: AxiosInstance;

  constructor(token: string) {
    this.client = axios.create({
      baseURL: 'https://api.zerotier.com/api/v1',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async listNetworks(): Promise<ZeroTierNetwork[]> {
    const response = await this.client.get<ZeroTierNetwork[]>('/network');
    return response.data;
  }

  async getNetwork(networkId: string): Promise<ZeroTierNetwork> {
    const response = await this.client.get<ZeroTierNetwork>(`/network/${networkId}`);
    return response.data;
  }

  async createNetwork(payload: UpdateNetworkPayload): Promise<ZeroTierNetwork> {
    const response = await this.client.post<ZeroTierNetwork>('/network', payload);
    return response.data;
  }

  async updateNetwork(networkId: string, payload: UpdateNetworkPayload): Promise<ZeroTierNetwork> {
    const response = await this.client.post<ZeroTierNetwork>(`/network/${networkId}`, payload);
    return response.data;
  }

  async deleteNetwork(networkId: string): Promise<void> {
    await this.client.delete(`/network/${networkId}`);
  }

  async listMembers(networkId: string): Promise<ZeroTierMember[]> {
    const response = await this.client.get<ZeroTierMember[]>(`/network/${networkId}/member`);
    return response.data;
  }

  async getMember(networkId: string, memberId: string): Promise<ZeroTierMember> {
    const response = await this.client.get<ZeroTierMember>(`/network/${networkId}/member/${memberId}`);
    return response.data;
  }

  async updateMember(networkId: string, memberId: string, payload: UpdateMemberPayload): Promise<ZeroTierMember> {
    const response = await this.client.post<ZeroTierMember>(`/network/${networkId}/member/${memberId}`, payload);
    return response.data;
  }

  async deleteMember(networkId: string, memberId: string): Promise<void> {
    await this.client.delete(`/network/${networkId}/member/${memberId}`);
  }
}
