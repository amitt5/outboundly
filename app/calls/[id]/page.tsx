"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Phone,
  Clock,
  Calendar,
  User,
  Building,
  Mail,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Download,
  Share,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
} from "lucide-react";
import { calls } from "@/lib/mock-data";
import type { Call } from "@/lib/mock-data";

const outcomeColors: Record<string, string> = {
  interested: "bg-success/10 text-success border-success/20",
  "not-interested": "bg-destructive/10 text-destructive border-destructive/20",
  callback: "bg-primary/10 text-primary border-primary/20",
  "no-answer": "bg-muted text-muted-foreground border-border",
  voicemail: "bg-muted text-muted-foreground border-border",
};

const sentimentColors: Record<string, string> = {
  positive: "bg-success/10 text-success",
  neutral: "bg-muted text-muted-foreground",
  negative: "bg-destructive/10 text-destructive",
};

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function CallDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [call, setCall] = useState<Call | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState([80]);

  useEffect(() => {
    const foundCall = calls.find((c) => c.id === id);
    setCall(foundCall || null);
  }, [id]);

  if (!call) {
    return (
      <DashboardLayout>
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">Call not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => router.push("/calls")}
              className="mb-4 -ml-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Calls
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Call Details</h1>
            <p className="text-muted-foreground">
              {call.contactName} - {call.contactCompany}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="bg-transparent">
              <Share className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" className="bg-transparent">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Audio Player */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">
                      Call Recording
                    </h3>
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4 text-muted-foreground" />
                      <Slider
                        value={volume}
                        onValueChange={setVolume}
                        max={100}
                        step={1}
                        className="w-24"
                      />
                    </div>
                  </div>

                  {/* Waveform Placeholder */}
                  <div className="h-20 rounded-lg bg-muted/50 flex items-center justify-center">
                    <div className="flex items-end gap-0.5 h-12">
                      {Array.from({ length: 60 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-primary/30 rounded-full transition-all"
                          style={{
                            height: `${Math.random() * 100}%`,
                            opacity:
                              i < (currentTime / call.duration) * 60 ? 1 : 0.3,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <Slider
                      value={[currentTime]}
                      onValueChange={([value]) => setCurrentTime(value)}
                      max={call.duration}
                      step={1}
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{formatTimestamp(currentTime)}</span>
                      <span>{formatDuration(call.duration)}</span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setCurrentTime(Math.max(0, currentTime - 10))
                      }
                    >
                      <SkipBack className="h-5 w-5" />
                    </Button>
                    <Button
                      size="icon"
                      className="h-12 w-12"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? (
                        <Pause className="h-6 w-6" />
                      ) : (
                        <Play className="h-6 w-6" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setCurrentTime(Math.min(call.duration, currentTime + 10))
                      }
                    >
                      <SkipForward className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transcript & Summary Tabs */}
            <Tabs defaultValue="transcript">
              <TabsList>
                <TabsTrigger value="transcript">Transcript</TabsTrigger>
                <TabsTrigger value="summary">AI Summary</TabsTrigger>
              </TabsList>

              <TabsContent value="transcript" className="mt-4">
                <Card>
                  <CardContent className="p-6">
                    {call.transcript && call.transcript.length > 0 ? (
                      <div className="space-y-4">
                        {call.transcript.map((entry, index) => (
                          <div
                            key={index}
                            className={`flex gap-3 ${
                              entry.speaker === "agent"
                                ? ""
                                : "flex-row-reverse"
                            }`}
                          >
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                                entry.speaker === "agent"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-foreground"
                              }`}
                            >
                              {entry.speaker === "agent"
                                ? "AI"
                                : call.contactName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                            </div>
                            <div
                              className={`flex flex-col ${
                                entry.speaker === "agent"
                                  ? "items-start"
                                  : "items-end"
                              }`}
                            >
                              <div
                                className={`rounded-2xl px-4 py-2.5 max-w-[80%] ${
                                  entry.speaker === "agent"
                                    ? "rounded-tl-sm bg-muted"
                                    : "rounded-tr-sm bg-primary text-primary-foreground"
                                }`}
                              >
                                <p className="text-sm">{entry.text}</p>
                              </div>
                              <span className="mt-1 text-xs text-muted-foreground">
                                {formatTimestamp(entry.timestamp)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        No transcript available
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="summary" className="mt-4">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    {call.summary ? (
                      <>
                        <div>
                          <h4 className="font-medium text-foreground mb-2">
                            Call Summary
                          </h4>
                          <p className="text-muted-foreground leading-relaxed">
                            {call.summary}
                          </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="rounded-lg border border-border p-4">
                            <h5 className="text-sm font-medium text-foreground mb-2">
                              Key Points Discussed
                            </h5>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                              <li className="flex items-start gap-2">
                                <MessageSquare className="h-4 w-4 mt-0.5 shrink-0" />
                                Pain points with current system
                              </li>
                              <li className="flex items-start gap-2">
                                <MessageSquare className="h-4 w-4 mt-0.5 shrink-0" />
                                Interest in AI automation
                              </li>
                              <li className="flex items-start gap-2">
                                <MessageSquare className="h-4 w-4 mt-0.5 shrink-0" />
                                Budget and timeline considerations
                              </li>
                            </ul>
                          </div>

                          <div className="rounded-lg border border-border p-4">
                            <h5 className="text-sm font-medium text-foreground mb-2">
                              Next Steps
                            </h5>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                              <li className="flex items-start gap-2">
                                <ThumbsUp className="h-4 w-4 mt-0.5 shrink-0 text-success" />
                                Schedule product demo
                              </li>
                              <li className="flex items-start gap-2">
                                <ThumbsUp className="h-4 w-4 mt-0.5 shrink-0 text-success" />
                                Send case studies
                              </li>
                              <li className="flex items-start gap-2">
                                <ThumbsUp className="h-4 w-4 mt-0.5 shrink-0 text-success" />
                                Prepare custom proposal
                              </li>
                            </ul>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        No summary available
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Call Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Call Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant="outline" className="capitalize">
                    {call.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Outcome</span>
                  <Badge
                    variant="outline"
                    className={outcomeColors[call.outcome || "no-answer"]}
                  >
                    {call.outcome?.replace("-", " ") || "N/A"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Sentiment</span>
                  <span
                    className={`text-sm font-medium capitalize rounded-full px-2 py-0.5 ${
                      sentimentColors[call.sentiment || "neutral"]
                    }`}
                  >
                    {call.sentiment || "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      {formatDuration(call.duration)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Date</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      {new Date(call.startTime).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-lg font-medium text-foreground">
                    {call.contactName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {call.contactName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {call.contactCompany}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building className="h-4 w-4" />
                    {call.contactCompany}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    +1 (555) 123-4567
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    contact@{call.contactCompany
                      .toLowerCase()
                      .replace(/\s+/g, "")}.com
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Agent Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Agent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {call.agentName}
                    </p>
                    <p className="text-sm text-muted-foreground">AI Agent</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Campaign Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Campaign</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium text-foreground">
                  {call.campaignName}
                </p>
                <Button variant="link" className="px-0 h-auto text-primary">
                  View Campaign Details
                </Button>
              </CardContent>
            </Card>

            {/* Feedback */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Rate this call</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Was this call handled well?
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    Good
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <ThumbsDown className="mr-2 h-4 w-4" />
                    Needs Work
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
