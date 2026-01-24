"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Vapi from "@vapi-ai/web";
import {
  ArrowLeft,
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Settings,
  RefreshCw,
  MessageSquare,
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

const sampleConversation = [
  { speaker: "agent", text: "Hi, this is Alex from TechStartup Inc. I hope I caught you at a good time." },
  { speaker: "user", text: "Yes, this is Sarah. What can I do for you?" },
  { speaker: "agent", text: "Great to connect with you, Sarah. I'm reaching out because we've been helping companies like yours streamline their sales operations with AI-powered solutions." },
];

export default function AgentTestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [agent, setAgent] = useState<{
    id: string;
    business_name: string;
    business_website: string | null;
    agent_name: string;
    description: string | null;
    opening_greeting: string | null;
    key_talking_points: string | null;
    primary_objective: string | null;
    success_criteria: string;
    voice_preset: string | null;
    speaking_pace: number | null;
    personality_traits: string[];
    max_call_duration_minutes: number;
    published: boolean;
  } | null>(null);
  const [uploads, setUploads] = useState<
    Array<{
      id: string;
      kind: "document" | "previous_sales_transcript" | "training_transcript";
      title: string | null;
      text_content: string | null;
    }>
  >([]);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isCallConnecting, setIsCallConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [userMessage, setUserMessage] = useState("");
  const [conversation, setConversation] = useState(sampleConversation);
  const [callError, setCallError] = useState<string | null>(null);
  const vapiRef = useRef<Vapi | null>(null);

  const [prospect, setProspect] = useState({
    name: "",
    phone: "",
    company: "",
    interestedIn: "Day pass / hot desk",
    questions: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase
          .from("agents")
          .select(
            "id,business_name,business_website,agent_name,description,opening_greeting,key_talking_points,primary_objective,success_criteria,voice_preset,speaking_pace,personality_traits,max_call_duration_minutes,published"
          )
          .eq("id", id)
          .single();
        if (error) throw error;
        setAgent(data);

        const { data: up, error: upErr } = await supabase
          .from("agent_uploads")
          .select("id,kind,title,text_content")
          .eq("agent_id", id)
          .order("created_at", { ascending: true });
        if (upErr) throw upErr;
        setUploads((up || []) as any);

        setConversation([]);
      } catch (e: any) {
        console.error(e);
        setAgent(null);
      }
    };
    void load();
  }, [id]);

  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_VAPI_API_KEY;
    if (!publicKey) return;

    const vapi = vapiRef.current ?? new Vapi(publicKey);
    vapiRef.current = vapi;

    const onCallStart = () => {
      setCallError(null);
      setIsCallConnecting(false);
      setIsCallActive(true);
    };

    const onCallEnd = () => {
      setIsCallConnecting(false);
      setIsCallActive(false);
      setIsMuted(false);
    };

    const onError = (error: any) => {
      console.error("Vapi error:", error);
      const message =
        error?.error?.message ||
        error?.message ||
        error?.error ||
        "An error occurred with the voice call.";
      setCallError(String(message));
      setIsCallConnecting(false);
      setIsCallActive(false);
      setIsMuted(false);

      void vapi.stop().catch((stopError) => {
        console.error("Failed to stop Vapi call after error:", stopError);
      });
    };

    const onMessage = (message: any) => {
      if (message?.type !== "transcript") return;
      if (typeof message?.transcript !== "string" || !message.transcript.trim()) return;

      const speaker = message.role === "assistant" ? "agent" : "user";
      setConversation((prev) => [...prev, { speaker, text: message.transcript }]);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("error", onError);
    vapi.on("message", onMessage);

    return () => {
      vapi.removeListener("call-start", onCallStart);
      vapi.removeListener("call-end", onCallEnd);
      vapi.removeListener("error", onError);
      vapi.removeListener("message", onMessage);

      void vapi.stop().catch((stopError) => {
        console.error("Failed to stop Vapi call on unmount:", stopError);
      });
    };
  }, []);

  const handleStartCall = () => {
    const publicKey = process.env.NEXT_PUBLIC_VAPI_API_KEY;
    if (!publicKey) {
      console.error("Missing Vapi env var. Set NEXT_PUBLIC_VAPI_API_KEY.");
      return;
    }

    const prospectName = prospect.name.trim() || "there";
    const prospectFirstName = prospectName.split(/\s+/)[0] || "there";

    if (!vapiRef.current) {
      vapiRef.current = new Vapi(publicKey);
    }

    setCallError(null);
    setIsCallConnecting(true);
    setIsCallActive(true);
    setConversation([
      {
        speaker: "agent",
        text: "Starting simulation call… (mic permission prompt may appear)",
      },
    ]);

    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

    const truncate = (value: string, max = 1600) =>
      value.length > max ? `${value.slice(0, max)}\n…(truncated)` : value;

    const renderGreeting = (template: string) =>
      template
        .replaceAll("{agent_name}", (agent?.agent_name || "Alex").trim())
        .replaceAll("{business_name}", agent?.business_name || "Business")
        .replaceAll("{company_name}", agent?.business_name || "Business")
        .replaceAll("{prospect_name}", prospectFirstName);

    if (agent) {
      const systemPrompt = [
        "You are a friendly, consultative sales agent for a coworking space.",
        "Your goal: qualify the prospect, answer their questions, and book a tour/demo.",
        "",
        `Business: ${agent.business_name}`,
        agent.business_website ? `Website: ${agent.business_website}` : "",
        "",
        "Prospect details (from form submission):",
        `- Name: ${prospectName}`,
        prospect.company ? `- Company: ${prospect.company}` : "",
        prospect.phone ? `- Phone: ${prospect.phone}` : "",
        prospect.interestedIn ? `- Interested in: ${prospect.interestedIn}` : "",
        prospect.questions ? `- Specific questions: ${prospect.questions}` : "",
        "",
        agent.primary_objective ? `Objective: ${agent.primary_objective}` : "",
        agent.personality_traits?.length
          ? `Personality: ${agent.personality_traits.join(", ")}`
          : "",
        agent.key_talking_points
          ? `Talking points:\n${truncate(agent.key_talking_points, 1800)}`
          : "",
        ...uploads
          .filter((u) => u.text_content && u.text_content.trim())
          .slice(0, 6)
          .map((u) => {
            const label =
              u.kind === "document"
                ? "Document"
                : u.kind === "previous_sales_transcript"
                  ? "Previous sales transcript"
                  : "Training transcript";
            return `${label}${u.title ? ` (${u.title})` : ""}:\n${truncate(u.text_content || "", 1800)}`;
          }),
        "",
        "Guidelines:",
        "- Start with a warm greeting and confirm what they need.",
        "- Ask 2–4 clarifying questions (location, frequency, team size, budget, start date).",
        "- Answer questions directly; offer relevant options and next steps.",
        "- Close by proposing 2 time slots for a tour/demo and confirm contact details.",
        "- Keep responses concise and natural.",
        "- End after booking: say goodbye and end the call.",
      ]
        .filter(Boolean)
        .join("\n");

      const transientAssistant = {
        name: agent.agent_name,
        firstMessageMode: "assistant-speaks-first",
        firstMessage: renderGreeting(agent.opening_greeting || ""),
        model: {
          provider: "openai",
          model: "gpt-4o",
          messages: [{ role: "system", content: systemPrompt }],
        },
        voice: { provider: "vapi", voiceId: "Elliot" },
        maxDurationSeconds: Math.max(60, (agent.max_call_duration_minutes || 10) * 60),
        clientMessages: ["transcript", "tool-calls"],
      };

      void vapiRef.current
        .start(transientAssistant as any)
        .catch((error) => {
          console.error("Failed to start Vapi demo call:", error);
          setCallError(String(error?.message || "Failed to start call."));
          setIsCallConnecting(false);
          setIsCallActive(false);
        });
      return;
    }

    if (!assistantId) {
      console.error("Missing NEXT_PUBLIC_VAPI_ASSISTANT_ID for non-demo agent call.");
      setCallError("Missing assistant id for this agent.");
      setIsCallConnecting(false);
      setIsCallActive(false);
      return;
    }

    void vapiRef.current
      .start(assistantId)
      .catch((error) => {
        console.error("Failed to start Vapi call:", error);
        setCallError(String(error?.message || "Failed to start call."));
        setIsCallConnecting(false);
        setIsCallActive(false);
      });
  };

  const handleEndCall = () => {
    setIsCallConnecting(false);
    void vapiRef.current?.stop().catch((error) => {
      console.error("Failed to stop Vapi call:", error);
    });
  };

  const handleSendMessage = () => {
    if (!isCallActive || isCallConnecting) return;
    const text = userMessage.trim();
    if (!text) return;

    setConversation((prev) => [...prev, { speaker: "user", text }]);
    setUserMessage("");

    vapiRef.current?.send({
      type: "add-message",
      message: { role: "user", content: text },
    });
  };

  if (!agent) {
    return (
      <DashboardLayout>
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">Agent not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const displayName = agent.agent_name;
  const displayStatus = agent.published ? "active" : "inactive";
  const statusClass =
    displayStatus === "active"
      ? "bg-success/10 text-success border-success/20"
      : "bg-muted text-muted-foreground border-border";

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/agents")}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Agents
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Test: {displayName}
              </h1>
              <p className="text-muted-foreground">
                Simulate a prospect call in the browser
              </p>
            </div>
            <Badge
              variant="outline"
              className={statusClass}
            >
              {displayStatus}
            </Badge>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Call Interface */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardContent className="flex h-full flex-col p-0">
                {/* Call Status Bar */}
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        isCallActive ? "bg-success animate-pulse" : "bg-muted"
                      }`}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {isCallActive
                          ? isCallConnecting
                            ? "Connecting…"
                            : "Call in progress"
                          : "Ready to test"}
                      </span>
                      {callError && (
                        <span className="text-xs text-destructive">{callError}</span>
                      )}
                    </div>
                  </div>
                  {isCallActive && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const nextMuted = !isMuted;
                          vapiRef.current?.setMuted(nextMuted);
                          setIsMuted(nextMuted);
                        }}
                      >
                        {isMuted ? (
                          <MicOff className="h-4 w-4" />
                        ) : (
                          <Mic className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                      >
                        {isSpeakerOn ? (
                          <Volume2 className="h-4 w-4" />
                        ) : (
                          <VolumeX className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Conversation Area */}
                <div className="flex-1 overflow-auto p-6">
                  {!isCallActive ? (
                    <div className="space-y-6">
                      {!agent.published && (
                        <div className="rounded-lg border border-border bg-muted/30 p-4">
                          <p className="text-sm text-muted-foreground">
                            This agent isn’t published yet. Go back to `Agents` and click
                            `Publish`, then return here to run the simulation.
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                          <Phone className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-foreground">
                            Prospect Simulation
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Enter prospect details and start a web call. The agent will
                            greet them, answer questions, and try to book a tour/demo.
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-foreground">Name</p>
                          <Input
                            value={prospect.name}
                            onChange={(e) =>
                              setProspect((p) => ({ ...p, name: e.target.value }))
                            }
                            placeholder="e.g., Jamie Lee"
                          />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-foreground">Phone</p>
                          <Input
                            value={prospect.phone}
                            onChange={(e) =>
                              setProspect((p) => ({ ...p, phone: e.target.value }))
                            }
                            placeholder="Optional for demo"
                          />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-foreground">Company</p>
                          <Input
                            value={prospect.company}
                            onChange={(e) =>
                              setProspect((p) => ({ ...p, company: e.target.value }))
                            }
                            placeholder="e.g., Acme Design Co."
                          />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-foreground">
                            Interested in
                          </p>
                          <Input
                            value={prospect.interestedIn}
                            onChange={(e) =>
                              setProspect((p) => ({ ...p, interestedIn: e.target.value }))
                            }
                            placeholder="e.g., Dedicated desk for 1 person"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground">
                          Specific questions (optional)
                        </p>
                        <Input
                          value={prospect.questions}
                          onChange={(e) =>
                            setProspect((p) => ({ ...p, questions: e.target.value }))
                          }
                          placeholder="e.g., pricing, parking, meeting rooms, access hours…"
                        />
                      </div>

                      <Button
                        onClick={handleStartCall}
                        className="w-full"
                        disabled={!agent.published}
                      >
                        <Phone className="mr-2 h-4 w-4" />
                        Start Simulation Call
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {conversation.map((msg, index) => (
                        <div
                          key={index}
                          className={`flex ${
                            msg.speaker === "user" ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                              msg.speaker === "user"
                                ? "rounded-tr-sm bg-primary text-primary-foreground"
                                : "rounded-tl-sm bg-muted text-foreground"
                            }`}
                          >
                            <p className="text-sm">{msg.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Input Area */}
                {isCallActive && (
                  <div className="border-t border-border p-4">
                    <div className="flex gap-3">
                      <Input
                        placeholder="Type your response..."
                        value={userMessage}
                        onChange={(e) => setUserMessage(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleSendMessage()
                        }
                        className="flex-1"
                        disabled={isCallConnecting}
                      />
                      <Button onClick={handleSendMessage} disabled={isCallConnecting}>
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" onClick={handleEndCall}>
                        <PhoneOff className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Settings Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Business Context</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Business</p>
                    <p className="font-medium text-foreground">
                      {agent.business_name}
                    </p>
                  </div>
                  {agent.business_website && (
                    <div>
                      <p className="text-sm text-muted-foreground">Website</p>
                      <p className="font-medium text-foreground">
                        {agent.business_website}
                      </p>
                    </div>
                  )}
                  {agent.primary_objective && (
                    <div>
                      <p className="text-sm text-muted-foreground">Objective</p>
                      <p className="font-medium text-foreground">
                        {agent.primary_objective}
                      </p>
                    </div>
                  )}
                </div>
                <Tabs defaultValue="info">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="info">Info</TabsTrigger>
                      <TabsTrigger value="config">Config</TabsTrigger>
                    </TabsList>
                    <TabsContent value="info" className="mt-4 space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Voice</p>
                        <p className="font-medium text-foreground">{agent.voice_preset || "default"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Personality</p>
                        <p className="font-medium text-foreground">
                          {agent.personality_traits?.length ? agent.personality_traits.join(", ") : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Objective</p>
                        <p className="font-medium text-foreground">
                          {agent.primary_objective || "—"}
                        </p>
                      </div>
                    </TabsContent>
                    <TabsContent value="config" className="mt-4 space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Success criteria</p>
                        <p className="font-medium text-foreground">{agent.success_criteria}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Max duration</p>
                        <p className="font-medium text-foreground">
                          {agent.max_call_duration_minutes} minutes
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Speaking pace</p>
                        <p className="font-medium text-foreground">
                          {agent.speaking_pace ?? "—"}
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 bg-transparent">
                <Settings className="mr-2 h-4 w-4" />
                Edit Agent
              </Button>
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => {
                  setCallError(null);
                  setConversation([]);
                  setUserMessage("");
                  setIsCallConnecting(false);
                  setIsMuted(false);
                  void vapiRef.current?.stop().catch((error) => {
                    console.error("Failed to stop Vapi call on reset:", error);
                  });
                  setIsCallActive(false);
                }}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
