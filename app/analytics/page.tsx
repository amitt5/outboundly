"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Phone,
  TrendingUp,
  Clock,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { analyticsData } from "@/lib/mock-data";
import { useState } from "react";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  }
  return num.toString();
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("7d");

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground">
              Track performance and optimize your campaigns
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[150px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="12m">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="bg-transparent">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
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
                <p className="text-3xl font-bold text-foreground">
                  {formatNumber(analyticsData.totalCalls)}
                </p>
                <p className="text-sm text-muted-foreground">Total Calls</p>
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
                <p className="text-3xl font-bold text-foreground">
                  {analyticsData.interestedLeads}
                </p>
                <p className="text-sm text-muted-foreground">Interested Leads</p>
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
                <p className="text-3xl font-bold text-foreground">
                  {formatDuration(analyticsData.avgCallDuration)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Avg Call Duration
                </p>
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
                <p className="text-3xl font-bold text-foreground">
                  {analyticsData.successRate}%
                </p>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="agents">Agent Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Calls Over Time */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Calls Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analyticsData.callsByDay}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-border"
                      />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) =>
                          new Date(value).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        }
                        className="text-muted-foreground"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis
                        className="text-muted-foreground"
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="calls"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary) / 0.2)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="interested"
                        stroke="hsl(var(--success))"
                        fill="hsl(var(--success) / 0.2)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Call Outcomes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Call Outcomes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analyticsData.callsByOutcome}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="outcome"
                        label={({ outcome, percent }) =>
                          `${outcome} ${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {analyticsData.callsByOutcome.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Outcome Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Outcome Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.callsByOutcome} layout="vertical">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-border"
                    />
                    <XAxis type="number" className="text-muted-foreground" />
                    <YAxis
                      type="category"
                      dataKey="outcome"
                      className="text-muted-foreground"
                      width={100}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="hsl(var(--primary))"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="mt-6 space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Daily Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Daily Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analyticsData.callsByDay}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-border"
                      />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) =>
                          new Date(value).toLocaleDateString("en-US", {
                            weekday: "short",
                          })
                        }
                        className="text-muted-foreground"
                      />
                      <YAxis className="text-muted-foreground" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="calls"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--primary))" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="interested"
                        stroke="hsl(var(--success))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--success))" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Conversion Funnel */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Conversion Funnel</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Total Calls", value: 1247, percent: 100 },
                    { label: "Connected", value: 835, percent: 67 },
                    { label: "Engaged", value: 465, percent: 37 },
                    { label: "Interested", value: 142, percent: 11 },
                    { label: "Converted", value: 48, percent: 4 },
                  ].map((stage, index) => (
                    <div key={stage.label}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">
                          {stage.label}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {stage.value} ({stage.percent}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${stage.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="agents" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Agent Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {analyticsData.topAgents.map((agent, index) => (
                    <div
                      key={agent.name}
                      className="flex items-center gap-4 p-4 rounded-lg border border-border"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-lg font-bold text-primary">
                        #{index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">
                          {agent.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {agent.calls} calls completed
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">
                          {agent.successRate}%
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Success Rate
                        </p>
                      </div>
                      <div className="w-32">
                        <div className="h-2 rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-success"
                            style={{ width: `${agent.successRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
