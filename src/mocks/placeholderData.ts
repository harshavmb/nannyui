
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
    name: 'dev-server-01', 
    status: 'online', 
    version: 'v1.5.0',
    location: 'US East',
    lastSeen: '30 mins ago',
    type: 'Development'
  },
  { 
    id: "placeholder-2",
    name: 'prod-server-01', 
    status: 'online', 
    version: 'v1.5.0',
    location: 'US West',
    lastSeen: '15 mins ago',
    type: 'Production'
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
