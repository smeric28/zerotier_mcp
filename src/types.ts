export interface ZeroTierNetwork {
    id: string;
    description: string;
    config: {
        name: string;
        private: boolean;
        routes: {
            target: string;
            via: string | null;
        }[];
        ipAssignmentPools: {
            ipRangeStart: string;
            ipRangeEnd: string;
        }[];
    };
}

export interface ZeroTierMember {
    id: string;
    description: string;
    name: string;
    config: {
        authorized: boolean;
    };
    ipAssignments: string[];
}

export interface UpdateNetworkPayload {
    description?: string;
    config?: {
        name?: string;
        private?: boolean;
        routes?: {
            target: string;
            via: string | null;
        }[];
        ipAssignmentPools?: {
            ipRangeStart: string;
            ipRangeEnd: string;
        }[];
    };
}

export interface UpdateMemberPayload {
    description?: string;
    config?: {
        authorized?: boolean;
    };
}
