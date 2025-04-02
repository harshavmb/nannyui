
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
    token: 'sk_dev_placeholder123456789012345678901234', 
    type: 'Development',
    created_at: 'Jan 1, 2023',
    lastUsed: '5 mins ago'
  },
  { 
    id: "placeholder-2",
    name: 'Production API Key', 
    token: 'sk_prod_placeholder123456789012345678901234',
    type: 'Production',
    created_at: 'Jan 1, 2023',
    lastUsed: '2 hours ago'
  },
  { 
    id: "placeholder-3",
    name: 'Staging API Key', 
    token: 'sk_staging_placeholder123456789012345678901234',
    type: 'Staging',
    created_at: 'Mar 15, 2023',
    lastUsed: '1 day ago'
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
  },
  { 
    id: "placeholder-3",
    hostname: 'staging-server-01', 
    status: 'offline', 
    version: 'v1.4.8',
    location: 'EU Central',
    created_at: '2 days ago',
    ip_address: '10.0.0.3',
    type: 'Staging',
    os_version: 'CentOS 8',
    kernel_version: '4.18.0-348.el8.x86_64',
    user_id: 'user-123456'
  }
];

export const placeholderUserAuthToken = "placeholder-user-id";

export const placeholderStats = [
  { title: 'Total Agents', value: '3', icon: 'Server', change: '+15%' },
  { title: 'Active Tokens', value: '5', icon: 'Key', change: '+20%' },
  { title: 'Total Users', value: '12', icon: 'Users', change: '+8%' },
  { title: 'Uptime', value: '99.9%', icon: 'Clock', change: '+0.2%' },
];

export const placeholderActivities = [
  { title: 'System initialized', time: 'just now', icon: 'Activity' },
  { title: 'New agent connected', time: '2 hours ago', icon: 'Server' },
  { title: 'API token created', time: '5 hours ago', icon: 'Key' },
  { title: 'User logged in', time: '1 day ago', icon: 'Users' },
  { title: 'System update completed', time: '3 days ago', icon: 'Activity' }
];
