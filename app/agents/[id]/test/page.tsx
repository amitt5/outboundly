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
  Settings,
  RefreshCw,
} from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

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

      void vapi.stop().catch((stopError) => {
        console.error("Failed to stop Vapi call after error:", stopError);
      });
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("error", onError);

    return () => {
      vapi.removeListener("call-start", onCallStart);
      vapi.removeListener("call-end", onCallEnd);
      vapi.removeListener("error", onError);

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
      if (!assistantId) {
        console.error("Missing NEXT_PUBLIC_VAPI_ASSISTANT_ID.");
        setCallError("Missing assistant id.");
        setIsCallConnecting(false);
        setIsCallActive(false);
        return;
      }

      // Pick the OpenAI website summary doc if present, otherwise include a small
      // truncated bundle of other uploads.
      const websiteSummary = uploads.find(
        (u) => (u.title || "").toLowerCase().includes("website summary (openai json)")
      )?.text_content;

      const fallbackFacts = uploads
        .filter((u) => u.text_content && u.text_content.trim())
        .slice(0, 4)
        .map((u) => {
          const label =
            u.kind === "document"
              ? "Document"
              : u.kind === "previous_sales_transcript"
                ? "Previous sales transcript"
                : "Training transcript";
          return `${label}${u.title ? ` (${u.title})` : ""}:\n${truncate(u.text_content || "", 2500)}`;
        })
        .join("\n\n---\n\n");

      const assistantOverrides = {
        variableValues: {
          business_name: agent.business_name,
          business_website: agent.business_website || "",
          prospect_name: prospectName,
          prospect_phone: prospect.phone || "",
          prospect_company: prospect.company || "",
          interested_in: prospect.interestedIn || "",
          specific_questions: prospect.questions || "",
          business_facts_json: websiteSummary || fallbackFacts || "",
        },
      };

      void vapiRef.current
        .start(assistantId, assistantOverrides as any)
        .catch((error) => {
          console.error("Failed to start Vapi call:", error);
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
                    <Button variant="destructive" size="icon" onClick={handleEndCall}>
                      <PhoneOff className="h-4 w-4" />
                    </Button>
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
                    <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                      <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                        <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
                        <Mic className="relative h-10 w-10 text-primary animate-pulse" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">
                          {isCallConnecting ? "Connecting…" : "Conversation in progress"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Voice only (transcripts hidden for demo)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
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
                  setIsCallConnecting(false);
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
