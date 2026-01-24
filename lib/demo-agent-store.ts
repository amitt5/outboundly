export type DemoBusinessInfo = {
  businessName: string;
  website: string;
  documentsNotes: string;
  previousSalesTranscripts: string;
  currentRepTrainingTranscripts: string;
};

export type DemoAgentRecord = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  published: boolean;
  business: DemoBusinessInfo;
  // Stored settings from the wizard, used to shape the sales assistant at call time
  voicePreset: string;
  personalityTraits: string[];
  greeting: string;
  talkingPoints: string;
  objective: string;
};

const STORAGE_KEY = "outboundly.demoAgents.v1";

function safeParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function getDemoAgents(): DemoAgentRecord[] {
  if (typeof window === "undefined") return [];
  const parsed = safeParse<DemoAgentRecord[]>(window.localStorage.getItem(STORAGE_KEY));
  return Array.isArray(parsed) ? parsed : [];
}

export function saveDemoAgents(next: DemoAgentRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function upsertDemoAgent(agent: DemoAgentRecord) {
  const all = getDemoAgents();
  const idx = all.findIndex((a) => a.id === agent.id);
  const next = [...all];
  if (idx >= 0) next[idx] = agent;
  else next.unshift(agent);
  saveDemoAgents(next);
}

export function getDemoAgentById(id: string): DemoAgentRecord | null {
  return getDemoAgents().find((a) => a.id === id) ?? null;
}

export function setDemoAgentPublished(id: string, published: boolean) {
  const all = getDemoAgents();
  const next = all.map((a) => (a.id === id ? { ...a, published } : a));
  saveDemoAgents(next);
}

export function deleteDemoAgent(id: string) {
  const all = getDemoAgents();
  saveDemoAgents(all.filter((a) => a.id !== id));
}

export function createDemoAgentId() {
  return `demo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

