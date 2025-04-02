
// Placeholder data to use when API calls fail

export const placeholderProfile = {
  name: "Demo User",
  email: "user@example.com",
  html_url: "https://github.com/demo-user",
  avatar_url: "",
  id: "demo-user-id"
};

export const placeholderTokens = [
  { 
    id: "placeholder-1",
    name: 'Development API Key', 
    token: 'sk_dev_placeholder', 
    type: 'Development',
    created_at: 'Jan 1, 2023',
    lastUsed: '5 mins ago'
  },
  { 
    id: "placeholder-2",
    name: 'Production API Key', 
    token: 'sk_prod_placeholder',
    type: 'Production',
    created_at: 'Jan 1, 2023',
    lastUsed: '2 hours ago'
  }
];

export const placeholderAgents = [
  { 
    id: "placeholder-1",
    hostname: 'dev-server-01', 
    status: 'online', 
    version: 'v1.5.0',
    location: 'US East',
    created_at: '30 mins ago',
    ip_address: '10.0.0.1',
    type: 'Development',
    os_version: 'Ubuntu 20.04 LTS',
    kernel_version: '5.4.0-42-generic',
    user_id: 'user-123456'
  },
  { 
    id: "placeholder-2",
    hostname: 'prod-server-01', 
    status: 'online', 
    version: 'v1.5.0',
    location: 'US West',
    created_at: '15 mins ago',
    ip_address: '10.0.0.2',
    type: 'Production',
    os_version: 'Debian 11',
    kernel_version: '5.10.0-18-amd64',
    user_id: 'user-123456'
  }
];

export const placeholderUserAuthToken = "placeholder-user-id";

export const placeholderStats = [
  { title: 'Total Agents', value: '0', icon: 'Server', change: '0%' },
  { title: 'Active Tokens', value: '0', icon: 'Key', change: '0%' },
  { title: 'Total Users', value: '0', icon: 'Users', change: '0%' },
  { title: 'Uptime', value: '0%', icon: 'Clock', change: '0%' },
];

export const placeholderActivities = [
  { title: 'System initialized', time: 'just now', icon: 'Activity' }
];
