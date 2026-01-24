"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Phone,
  Users,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  PlayCircle,
  PauseCircle,
  Plus,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import {
  analyticsData,
  campaigns,
  calls,
  agents,
  company,
} from "@/lib/mock-data";

const statusColors: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  paused: "bg-warning/10 text-warning border-warning/20",
  completed: "bg-muted text-muted-foreground border-border",
  draft: "bg-muted text-muted-foreground border-border",
  training: "bg-primary/10 text-primary border-primary/20",
  inactive: "bg-muted text-muted-foreground border-border",
};

const outcomeColors: Record<string, string> = {
  interested: "bg-success/10 text-success border-success/20",
  "not-interested": "bg-destructive/10 text-destructive border-destructive/20",
  callback: "bg-primary/10 text-primary border-primary/20",
  "no-answer": "bg-muted text-muted-foreground border-border",
  voicemail: "bg-muted text-muted-foreground border-border",
};

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );
  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return `${Math.floor(diffInHours / 24)}d ago`;
}

export default function DashboardPage() {
  const recentCalls = calls.slice(0, 5);
  const activeCampaigns = campaigns.filter((c) => c.status === "active");

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, John. Here&apos;s what&apos;s happening with your campaigns.
            </p>
          </div>
          <Link href="/agents/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Agent
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div className="flex items-center gap-1 text-sm text-success">
                  <ArrowUpRight className="h-4 w-4" />
                  {analyticsData.callsChange}%
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-foreground">
                  {analyticsData.callsThisWeek}
                </p>
                <p className="text-sm text-muted-foreground">Calls this week</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
                <div className="flex items-center gap-1 text-sm text-success">
                  <ArrowUpRight className="h-4 w-4" />
                  {analyticsData.leadsChange}%
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-foreground">
                  {analyticsData.interestedLeads}
                </p>
                <p className="text-sm text-muted-foreground">Interested leads</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-foreground">
                  {formatDuration(analyticsData.avgCallDuration)}
                </p>
                <p className="text-sm text-muted-foreground">Avg call duration</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-foreground">
                  {analyticsData.successRate}%
                </p>
                <p className="text-sm text-muted-foreground">Success rate</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage Progress */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-foreground">Monthly call usage</p>
                <p className="text-sm text-muted-foreground">
                  {company.callsUsed.toLocaleString()} of{" "}
                  {company.monthlyCallsLimit.toLocaleString()} calls used
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-foreground">
                  {Math.round((company.callsUsed / company.monthlyCallsLimit) * 100)}%
                </span>
              </div>
            </div>
            <Progress
              value={(company.callsUsed / company.monthlyCallsLimit) * 100}
              className="mt-4 h-2"
            />
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Active Campaigns */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg font-semibold">
                Active Campaigns
              </CardTitle>
              <Link href="/campaigns">
                <Button variant="ghost" size="sm" className="text-primary">
                  View all
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeCampaigns.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No active campaigns
                </p>
              ) : (
                activeCampaigns.map((campaign) => (
                  <Link
                    key={campaign.id}
                    href={`/campaigns/${campaign.id}`}
                    className="block"
                  >
                    <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-foreground truncate">
                              {campaign.name}
                            </h3>
                            <Badge
                              variant="outline"
                              className={statusColors[campaign.status]}
                            >
                              {campaign.status}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {campaign.agentName}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                          onClick={(e) => e.preventDefault()}
                        >
                          {campaign.status === "active" ? (
                            <PauseCircle className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <PlayCircle className="h-5 w-5 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium text-foreground">
                            {campaign.contactsCalled} / {campaign.totalContacts}
                          </span>
                        </div>
                        <Progress
                          value={
                            (campaign.contactsCalled / campaign.totalContacts) *
                            100
                          }
                          className="mt-2 h-1.5"
                        />
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-sm">
                        <span className="text-success">
                          {campaign.interested} interested
                        </span>
                        <span className="text-primary">
                          {campaign.callbacks} callbacks
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Calls */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg font-semibold">
                Recent Calls
              </CardTitle>
              <Link href="/calls">
                <Button variant="ghost" size="sm" className="text-primary">
                  View all
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentCalls.map((call) => (
                <Link
                  key={call.id}
                  href={`/calls/${call.id}`}
                  className="block"
                >
                  <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent/50">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium text-foreground">
                      {call.contactName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground truncate">
                          {call.contactName}
                        </p>
                        <Badge
                          variant="outline"
                          className={outcomeColors[call.outcome || "no-answer"]}
                        >
                          {call.outcome?.replace("-", " ") || "N/A"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {call.contactCompany}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium text-foreground">
                        {formatDuration(call.duration)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(call.startTime)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Agents Overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-semibold">Your Agents</CardTitle>
            <Link href="/agents">
              <Button variant="ghost" size="sm" className="text-primary">
                Manage agents
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {agents.map((agent) => (
                <Link
                  key={agent.id}
                  href={`/agents/${agent.id}/test`}
                  className="block"
                >
                  <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50">
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <Badge
                        variant="outline"
                        className={statusColors[agent.status]}
                      >
                        {agent.status}
                      </Badge>
                    </div>
                    <h3 className="mt-3 font-medium text-foreground">
                      {agent.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {agent.description}
                    </p>
                    <div className="mt-4 flex items-center gap-4 text-sm">
                      <div>
                        <span className="font-medium text-foreground">
                          {agent.totalCalls}
                        </span>
                        <span className="text-muted-foreground"> calls</span>
                      </div>
                      <div>
                        <span className="font-medium text-foreground">
                          {agent.successRate}%
                        </span>
                        <span className="text-muted-foreground"> success</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
