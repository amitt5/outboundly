// Mock Data for CallAgent AI

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  status: 'pending' | 'called' | 'scheduled' | 'no-answer' | 'interested' | 'not-interested' | 'callback';
  lastCallDate?: string;
  notes?: string;
}

export interface Call {
  id: string;
  contactId: string;
  contactName: string;
  contactCompany: string;
  agentId: string;
  agentName: string;
  campaignId: string;
  campaignName: string;
  status: 'completed' | 'in-progress' | 'failed' | 'scheduled';
  outcome?: 'interested' | 'not-interested' | 'callback' | 'no-answer' | 'voicemail';
  duration: number; // in seconds
  startTime: string;
  endTime?: string;
  recording?: string;
  transcript?: TranscriptEntry[];
  sentiment?: 'positive' | 'neutral' | 'negative';
  summary?: string;
}

export interface TranscriptEntry {
  speaker: 'agent' | 'contact';
  text: string;
  timestamp: number;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  voice: string;
  greeting: string;
  personality: string;
  objective: string;
  status: 'active' | 'inactive' | 'training';
  totalCalls: number;
  successRate: number;
  avgCallDuration: number;
  createdAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  agentId: string;
  agentName: string;
  status: 'active' | 'paused' | 'completed' | 'draft';
  totalContacts: number;
  contactsCalled: number;
  interested: number;
  callbacks: number;
  startDate: string;
  endDate?: string;
  schedule: {
    days: string[];
    startTime: string;
    endTime: string;
    timezone: string;
  };
}

export interface AnalyticsData {
  totalCalls: number;
  totalDuration: number;
  avgCallDuration: number;
  successRate: number;
  callsThisWeek: number;
  callsChange: number;
  interestedLeads: number;
  leadsChange: number;
  callsByDay: { date: string; calls: number; interested: number }[];
  callsByOutcome: { outcome: string; count: number }[];
  topAgents: { name: string; calls: number; successRate: number }[];
}

// Sample Company
export const company = {
  id: 'comp-1',
  name: 'TechStartup Inc.',
  industry: 'Technology',
  plan: 'Professional',
  monthlyCallsLimit: 5000,
  callsUsed: 1247,
};

// Sample Contacts
export const contacts: Contact[] = [
  { id: 'cont-1', name: 'Sarah Johnson', email: 'sarah.johnson@acme.com', phone: '+1 (555) 123-4567', company: 'Acme Corp', title: 'VP of Sales', status: 'interested', lastCallDate: '2024-01-15', notes: 'Very interested in enterprise plan' },
  { id: 'cont-2', name: 'Michael Chen', email: 'mchen@globex.io', phone: '+1 (555) 234-5678', company: 'Globex Industries', title: 'CTO', status: 'callback', lastCallDate: '2024-01-14', notes: 'Requested callback next week' },
  { id: 'cont-3', name: 'Emily Rodriguez', email: 'e.rodriguez@initech.com', phone: '+1 (555) 345-6789', company: 'Initech', title: 'Director of Operations', status: 'called', lastCallDate: '2024-01-15' },
  { id: 'cont-4', name: 'David Kim', email: 'dkim@umbrella.co', phone: '+1 (555) 456-7890', company: 'Umbrella Corp', title: 'CEO', status: 'pending' },
  { id: 'cont-5', name: 'Jessica Martinez', email: 'jmartinez@wayne.ent', phone: '+1 (555) 567-8901', company: 'Wayne Enterprises', title: 'Head of Procurement', status: 'not-interested', lastCallDate: '2024-01-12' },
  { id: 'cont-6', name: 'Robert Taylor', email: 'rtaylor@stark.ind', phone: '+1 (555) 678-9012', company: 'Stark Industries', title: 'VP of Engineering', status: 'scheduled', notes: 'Demo scheduled for Friday' },
  { id: 'cont-7', name: 'Amanda White', email: 'awhite@oscorp.com', phone: '+1 (555) 789-0123', company: 'Oscorp', title: 'CFO', status: 'interested', lastCallDate: '2024-01-13' },
  { id: 'cont-8', name: 'James Wilson', email: 'jwilson@lexcorp.com', phone: '+1 (555) 890-1234', company: 'LexCorp', title: 'Director of IT', status: 'no-answer', lastCallDate: '2024-01-15' },
  { id: 'cont-9', name: 'Lisa Brown', email: 'lbrown@daily.planet', phone: '+1 (555) 901-2345', company: 'Daily Planet', title: 'Marketing Manager', status: 'pending' },
  { id: 'cont-10', name: 'Christopher Lee', email: 'clee@massive.dyn', phone: '+1 (555) 012-3456', company: 'Massive Dynamic', title: 'COO', status: 'callback', lastCallDate: '2024-01-14' },
  { id: 'cont-11', name: 'Patricia Davis', email: 'pdavis@cyberdyne.sys', phone: '+1 (555) 111-2222', company: 'Cyberdyne Systems', title: 'Product Manager', status: 'called', lastCallDate: '2024-01-11' },
  { id: 'cont-12', name: 'Daniel Garcia', email: 'dgarcia@weyland.corp', phone: '+1 (555) 222-3333', company: 'Weyland Corp', title: 'Sales Director', status: 'interested', lastCallDate: '2024-01-15' },
];

// Sample Agents
export const agents: Agent[] = [
  {
    id: 'agent-1',
    name: 'Alex - Enterprise Sales',
    description: 'Specialized in B2B enterprise sales with a consultative approach',
    voice: 'Professional Male',
    greeting: 'Hi, this is Alex from TechStartup Inc. I hope I caught you at a good time.',
    personality: 'Professional, consultative, patient',
    objective: 'Qualify leads and schedule product demos for enterprise solutions',
    status: 'active',
    totalCalls: 847,
    successRate: 32,
    avgCallDuration: 245,
    createdAt: '2024-01-01',
  },
  {
    id: 'agent-2',
    name: 'Maya - SMB Outreach',
    description: 'Friendly and energetic agent for small business outreach',
    voice: 'Friendly Female',
    greeting: 'Hey there! This is Maya calling from TechStartup. Got a quick minute?',
    personality: 'Friendly, energetic, casual',
    objective: 'Generate interest and book discovery calls with SMB prospects',
    status: 'active',
    totalCalls: 623,
    successRate: 28,
    avgCallDuration: 180,
    createdAt: '2024-01-05',
  },
  {
    id: 'agent-3',
    name: 'Jordan - Follow-up Specialist',
    description: 'Expert at following up with warm leads and closing deals',
    voice: 'Warm Neutral',
    greeting: 'Hi, this is Jordan from TechStartup following up on our previous conversation.',
    personality: 'Warm, persistent, detail-oriented',
    objective: 'Follow up with interested leads and move them through the sales funnel',
    status: 'training',
    totalCalls: 156,
    successRate: 45,
    avgCallDuration: 320,
    createdAt: '2024-01-10',
  },
];

// Sample Campaigns
export const campaigns: Campaign[] = [
  {
    id: 'camp-1',
    name: 'Q1 Enterprise Outreach',
    description: 'Targeting Fortune 500 companies for enterprise software solutions',
    agentId: 'agent-1',
    agentName: 'Alex - Enterprise Sales',
    status: 'active',
    totalContacts: 250,
    contactsCalled: 147,
    interested: 42,
    callbacks: 18,
    startDate: '2024-01-01',
    schedule: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      startTime: '09:00',
      endTime: '17:00',
      timezone: 'America/New_York',
    },
  },
  {
    id: 'camp-2',
    name: 'SMB Growth Initiative',
    description: 'Reaching out to small and medium businesses in tech sector',
    agentId: 'agent-2',
    agentName: 'Maya - SMB Outreach',
    status: 'active',
    totalContacts: 500,
    contactsCalled: 312,
    interested: 78,
    callbacks: 34,
    startDate: '2024-01-03',
    schedule: {
      days: ['Monday', 'Wednesday', 'Friday'],
      startTime: '10:00',
      endTime: '16:00',
      timezone: 'America/Los_Angeles',
    },
  },
  {
    id: 'camp-3',
    name: 'Re-engagement Campaign',
    description: 'Following up with leads who showed initial interest',
    agentId: 'agent-3',
    agentName: 'Jordan - Follow-up Specialist',
    status: 'paused',
    totalContacts: 75,
    contactsCalled: 45,
    interested: 22,
    callbacks: 8,
    startDate: '2024-01-08',
    schedule: {
      days: ['Tuesday', 'Thursday'],
      startTime: '11:00',
      endTime: '15:00',
      timezone: 'America/Chicago',
    },
  },
  {
    id: 'camp-4',
    name: 'Product Launch Announcement',
    description: 'Announcing new product features to existing prospects',
    agentId: 'agent-1',
    agentName: 'Alex - Enterprise Sales',
    status: 'draft',
    totalContacts: 180,
    contactsCalled: 0,
    interested: 0,
    callbacks: 0,
    startDate: '2024-02-01',
    schedule: {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      startTime: '09:00',
      endTime: '18:00',
      timezone: 'America/New_York',
    },
  },
];

// Sample Calls with Transcripts
export const calls: Call[] = [
  {
    id: 'call-1',
    contactId: 'cont-1',
    contactName: 'Sarah Johnson',
    contactCompany: 'Acme Corp',
    agentId: 'agent-1',
    agentName: 'Alex - Enterprise Sales',
    campaignId: 'camp-1',
    campaignName: 'Q1 Enterprise Outreach',
    status: 'completed',
    outcome: 'interested',
    duration: 342,
    startTime: '2024-01-15T10:30:00Z',
    endTime: '2024-01-15T10:35:42Z',
    sentiment: 'positive',
    summary: 'Sarah expressed strong interest in our enterprise solution. She mentioned current pain points with their existing system and requested a demo for her team next week.',
    transcript: [
      { speaker: 'agent', text: "Hi, this is Alex from TechStartup Inc. I hope I caught you at a good time. Is this Sarah Johnson?", timestamp: 0 },
      { speaker: 'contact', text: "Yes, this is Sarah. What can I do for you?", timestamp: 8 },
      { speaker: 'agent', text: "Great to connect with you, Sarah. I'm reaching out because we've been helping companies like Acme Corp streamline their sales operations with AI-powered solutions. I noticed your team has been growing rapidly. How are you currently handling your outbound sales process?", timestamp: 15 },
      { speaker: 'contact', text: "Actually, that's been a challenge for us. We've been relying on manual calling and it's becoming hard to scale.", timestamp: 42 },
      { speaker: 'agent', text: "I completely understand. Many of our clients faced similar challenges before implementing our solution. We've helped companies increase their outreach by 300% while maintaining personalized conversations. Would you be interested in seeing how this could work for Acme?", timestamp: 58 },
      { speaker: 'contact', text: "That sounds interesting. What kind of results have you seen with companies our size?", timestamp: 85 },
      { speaker: 'agent', text: "Great question. For companies with 50-200 sales reps, we typically see a 40% increase in qualified meetings booked within the first quarter. I'd love to show you some case studies and give you a personalized demo. Would next week work for you and your team?", timestamp: 95 },
      { speaker: 'contact', text: "Yes, let's do that. Can we schedule something for Thursday afternoon?", timestamp: 125 },
      { speaker: 'agent', text: "Perfect! I'll send over a calendar invite for Thursday at 2 PM. Is there anyone else from your team who should join the demo?", timestamp: 135 },
      { speaker: 'contact', text: "Yes, please include our CTO Michael. I'll forward the invite to him.", timestamp: 150 },
      { speaker: 'agent', text: "Wonderful! You'll receive the invite shortly with all the details. Looking forward to showing you what we can do for Acme. Have a great day, Sarah!", timestamp: 160 },
      { speaker: 'contact', text: "Thanks Alex, talk to you Thursday!", timestamp: 175 },
    ],
  },
  {
    id: 'call-2',
    contactId: 'cont-2',
    contactName: 'Michael Chen',
    contactCompany: 'Globex Industries',
    agentId: 'agent-1',
    agentName: 'Alex - Enterprise Sales',
    campaignId: 'camp-1',
    campaignName: 'Q1 Enterprise Outreach',
    status: 'completed',
    outcome: 'callback',
    duration: 98,
    startTime: '2024-01-14T14:15:00Z',
    endTime: '2024-01-14T14:16:38Z',
    sentiment: 'neutral',
    summary: 'Michael was interested but in a meeting. Requested a callback next Tuesday at 3 PM.',
    transcript: [
      { speaker: 'agent', text: "Hi, this is Alex from TechStartup Inc. Am I speaking with Michael Chen?", timestamp: 0 },
      { speaker: 'contact', text: "Yes, but I'm actually in the middle of a meeting right now.", timestamp: 6 },
      { speaker: 'agent', text: "I apologize for the interruption, Michael. I was calling about our AI sales automation platform. Would there be a better time to connect?", timestamp: 12 },
      { speaker: 'contact', text: "Actually, we might be interested. Can you call me back next Tuesday around 3 PM?", timestamp: 25 },
      { speaker: 'agent', text: "Absolutely! I'll call you Tuesday at 3 PM. I'll also send you a brief overview via email so you can review it beforehand.", timestamp: 35 },
      { speaker: 'contact', text: "Sounds good. Talk to you then.", timestamp: 48 },
    ],
  },
  {
    id: 'call-3',
    contactId: 'cont-5',
    contactName: 'Jessica Martinez',
    contactCompany: 'Wayne Enterprises',
    agentId: 'agent-2',
    agentName: 'Maya - SMB Outreach',
    campaignId: 'camp-2',
    campaignName: 'SMB Growth Initiative',
    status: 'completed',
    outcome: 'not-interested',
    duration: 67,
    startTime: '2024-01-12T11:00:00Z',
    endTime: '2024-01-12T11:01:07Z',
    sentiment: 'negative',
    summary: 'Jessica mentioned they recently signed a contract with a competitor and are not looking for alternatives at this time.',
    transcript: [
      { speaker: 'agent', text: "Hey there! This is Maya calling from TechStartup. Got a quick minute?", timestamp: 0 },
      { speaker: 'contact', text: "Sure, what's this about?", timestamp: 5 },
      { speaker: 'agent', text: "I'm reaching out because we help companies like Wayne Enterprises automate their sales outreach. Are you currently looking to scale your sales operations?", timestamp: 10 },
      { speaker: 'contact', text: "Actually, we just signed a two-year contract with SalesForce last month. We're not looking at any alternatives right now.", timestamp: 25 },
      { speaker: 'agent', text: "I understand completely. These are long-term decisions. Would it be okay if I reached out again when your contract is closer to renewal?", timestamp: 40 },
      { speaker: 'contact', text: "Sure, but that won't be for at least 18 months.", timestamp: 52 },
      { speaker: 'agent', text: "No problem at all. I'll make a note and follow up then. Thank you for your time, Jessica!", timestamp: 58 },
    ],
  },
  {
    id: 'call-4',
    contactId: 'cont-7',
    contactName: 'Amanda White',
    contactCompany: 'Oscorp',
    agentId: 'agent-1',
    agentName: 'Alex - Enterprise Sales',
    campaignId: 'camp-1',
    campaignName: 'Q1 Enterprise Outreach',
    status: 'completed',
    outcome: 'interested',
    duration: 287,
    startTime: '2024-01-13T09:45:00Z',
    endTime: '2024-01-13T09:49:47Z',
    sentiment: 'positive',
    summary: 'Amanda showed strong interest, especially in ROI tracking features. She wants to discuss budget allocation with her team before scheduling a demo.',
    transcript: [
      { speaker: 'agent', text: "Hi, this is Alex from TechStartup Inc. I hope I caught you at a good time. Is this Amanda White?", timestamp: 0 },
      { speaker: 'contact', text: "Yes, speaking. How can I help you?", timestamp: 7 },
      { speaker: 'agent', text: "Amanda, I'm reaching out because we specialize in helping CFOs like yourself track and improve ROI on sales investments through AI automation. Do you have a couple minutes?", timestamp: 12 },
      { speaker: 'contact', text: "Actually, yes. We've been looking at ways to optimize our sales spend. Tell me more.", timestamp: 28 },
      { speaker: 'agent', text: "Excellent! Our platform provides detailed analytics on every customer touchpoint, allowing you to see exactly where your sales dollars are generating returns. Most CFOs tell us visibility into sales efficiency was their biggest challenge before using our solution.", timestamp: 38 },
      { speaker: 'contact', text: "That's exactly our problem. We're spending a lot on our sales team but don't have good metrics on individual rep performance.", timestamp: 65 },
      { speaker: 'agent', text: "That's very common. With our platform, you'd be able to see performance metrics by rep, by campaign, and by customer segment. One of our clients, a company similar to Oscorp, reduced their cost per qualified lead by 45% in the first quarter.", timestamp: 82 },
      { speaker: 'contact', text: "Those are impressive numbers. What's the implementation timeline and cost look like?", timestamp: 110 },
      { speaker: 'agent', text: "Implementation typically takes 2-3 weeks, and pricing is based on your team size and call volume. For a company like Oscorp, you're likely looking at the Enterprise tier. I'd be happy to put together a custom proposal.", timestamp: 120 },
      { speaker: 'contact', text: "I'd like that. Let me discuss budget allocation with my team first, and then we can schedule a more detailed conversation.", timestamp: 148 },
      { speaker: 'agent', text: "That sounds perfect. I'll send over some ROI calculators and case studies that might help with those discussions. When would be a good time to follow up?", timestamp: 162 },
      { speaker: 'contact', text: "Let's say end of next week. I should have a clearer picture by then.", timestamp: 180 },
    ],
  },
];

// Analytics Data
export const analyticsData: AnalyticsData = {
  totalCalls: 1247,
  totalDuration: 287345,
  avgCallDuration: 230,
  successRate: 31,
  callsThisWeek: 156,
  callsChange: 12,
  interestedLeads: 142,
  leadsChange: 8,
  callsByDay: [
    { date: '2024-01-08', calls: 45, interested: 12 },
    { date: '2024-01-09', calls: 52, interested: 15 },
    { date: '2024-01-10', calls: 38, interested: 10 },
    { date: '2024-01-11', calls: 61, interested: 18 },
    { date: '2024-01-12', calls: 55, interested: 14 },
    { date: '2024-01-13', calls: 28, interested: 8 },
    { date: '2024-01-14', calls: 32, interested: 9 },
    { date: '2024-01-15', calls: 67, interested: 21 },
  ],
  callsByOutcome: [
    { outcome: 'Interested', count: 142 },
    { outcome: 'Callback Requested', count: 89 },
    { outcome: 'Not Interested', count: 234 },
    { outcome: 'No Answer', count: 412 },
    { outcome: 'Voicemail', count: 370 },
  ],
  topAgents: [
    { name: 'Alex - Enterprise Sales', calls: 847, successRate: 32 },
    { name: 'Maya - SMB Outreach', calls: 623, successRate: 28 },
    { name: 'Jordan - Follow-up Specialist', calls: 156, successRate: 45 },
  ],
};

// User Settings
export const userSettings = {
  profile: {
    name: 'John Smith',
    email: 'john@techstartup.com',
    role: 'Admin',
    avatar: '',
  },
  company: {
    name: 'TechStartup Inc.',
    website: 'https://techstartup.com',
    industry: 'Technology',
  },
  notifications: {
    emailAlerts: true,
    callCompletions: true,
    dailyDigest: true,
    weeklyReport: true,
  },
  calling: {
    defaultTimezone: 'America/New_York',
    callerIdNumber: '+1 (555) 000-1234',
    maxConcurrentCalls: 10,
    callRecording: true,
  },
  integrations: {
    salesforce: { connected: true, lastSync: '2024-01-15T08:00:00Z' },
    hubspot: { connected: false },
    slack: { connected: true, channel: '#sales-notifications' },
  },
};
