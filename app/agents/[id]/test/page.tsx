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
import { agents } from "@/lib/mock-data";
import type { Agent } from "@/lib/mock-data";

const testScenarios = [
  { id: "cold-call", label: "Cold Call", description: "Standard outbound sales call" },
  { id: "follow-up", label: "Follow-up", description: "Following up on previous interest" },
  { id: "objection", label: "Objection Handling", description: "Test objection responses" },
  { id: "busy", label: "Busy Prospect", description: "Prospect says they're busy" },
];

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
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [userMessage, setUserMessage] = useState("");
  const [conversation, setConversation] = useState(sampleConversation);
  const [selectedScenario, setSelectedScenario] = useState("cold-call");
  const vapiRef = useRef<Vapi | null>(null);

  useEffect(() => {
    const foundAgent = agents.find((a) => a.id === id);
    setAgent(foundAgent || null);
  }, [id]);

  const handleStartCall = () => {
    const publicKey = process.env.NEXT_PUBLIC_VAPI_API_KEY;
    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

    if (!publicKey || !assistantId) {
      console.error(
        "Missing Vapi env vars. Set NEXT_PUBLIC_VAPI_API_KEY and NEXT_PUBLIC_VAPI_ASSISTANT_ID."
      );
      return;
    }

    if (!vapiRef.current) {
      vapiRef.current = new Vapi(publicKey);
    }

    setConversation([
      {
        speaker: "agent",
        text: "Connecting to voice agent… (mic permission prompt may appear)",
      },
    ]);

    // Step 3: start a real Vapi web call using the shared assistant.
    // (We'll wire call-start/call-end + transcript events in the next steps.)
    vapiRef.current.start(assistantId, {
      variableValues: {
        respondent_name: "Sarah",
        language: "en",
        discussion_guide: [
          "1) Quick intro: How has your day been so far?",
          "2) Tell me about the last time you participated in a user interview.",
          "3) What frustrates you most about qualitative research today?",
          "4) If you could wave a magic wand, what would you improve?",
          "5) Any final thoughts you want to add?",
        ].join("\n"),
      },
    });

    // Temporary UI state until we hook real call events.
    setIsCallActive(true);
  };

  const handleEndCall = () => {
    setIsCallActive(false);
  };

  const handleSendMessage = () => {
    if (!userMessage.trim()) return;
    
    setConversation((prev) => [
      ...prev,
      { speaker: "user", text: userMessage },
    ]);
    setUserMessage("");

    // Simulate agent response
    setTimeout(() => {
      setConversation((prev) => [
        ...prev,
        {
          speaker: "agent",
          text: "I understand. Let me tell you more about how we can help your team...",
        },
      ]);
    }, 1500);
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
                Test: {agent.name}
              </h1>
              <p className="text-muted-foreground">
                Simulate a call to test agent behavior
              </p>
            </div>
            <Badge
              variant="outline"
              className={
                agent.status === "active"
                  ? "bg-success/10 text-success border-success/20"
                  : "bg-muted text-muted-foreground"
              }
            >
              {agent.status}
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
                    <span className="font-medium text-foreground">
                      {isCallActive ? "Call in progress" : "Ready to test"}
                    </span>
                  </div>
                  {isCallActive && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMuted(!isMuted)}
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
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <Phone className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="mt-4 text-lg font-medium text-foreground">
                        Start a Test Call
                      </h3>
                      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                        Simulate a conversation with your AI agent to test its
                        responses and behavior.
                      </p>
                      <Button onClick={handleStartCall} className="mt-6">
                        <Phone className="mr-2 h-4 w-4" />
                        Start Test Call
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
                      />
                      <Button onClick={handleSendMessage}>
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
                <CardTitle className="text-base">Test Scenario</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {testScenarios.map((scenario) => (
                  <button
                    key={scenario.id}
                    onClick={() => setSelectedScenario(scenario.id)}
                    className={`w-full rounded-lg border p-3 text-left transition-colors ${
                      selectedScenario === scenario.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-accent/50"
                    }`}
                  >
                    <p className="font-medium text-foreground">
                      {scenario.label}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {scenario.description}
                    </p>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Agent Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="info">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="info">Info</TabsTrigger>
                    <TabsTrigger value="config">Config</TabsTrigger>
                  </TabsList>
                  <TabsContent value="info" className="mt-4 space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Voice</p>
                      <p className="font-medium text-foreground">{agent.voice}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Personality</p>
                      <p className="font-medium text-foreground">
                        {agent.personality}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Objective</p>
                      <p className="font-medium text-foreground">
                        {agent.objective}
                      </p>
                    </div>
                  </TabsContent>
                  <TabsContent value="config" className="mt-4 space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Calls</p>
                      <p className="font-medium text-foreground">
                        {agent.totalCalls}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                      <p className="font-medium text-foreground">
                        {agent.successRate}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Avg Duration
                      </p>
                      <p className="font-medium text-foreground">
                        {Math.floor(agent.avgCallDuration / 60)}:
                        {(agent.avgCallDuration % 60)
                          .toString()
                          .padStart(2, "0")}
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
                  setConversation([]);
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
