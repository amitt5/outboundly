"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Play,
  Pause,
  Settings,
  Users,
  Phone,
  TrendingUp,
  Clock,
  Calendar,
  Search,
  Upload,
  Plus,
  ChevronRight,
} from "lucide-react";
import { campaigns, contacts, calls } from "@/lib/mock-data";
import type { Campaign, Contact, Call } from "@/lib/mock-data";

const statusColors: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  paused: "bg-warning/10 text-warning border-warning/20",
  completed: "bg-muted text-muted-foreground border-border",
  draft: "bg-muted text-muted-foreground border-border",
};

const contactStatusColors: Record<string, string> = {
  pending: "bg-muted text-muted-foreground border-border",
  called: "bg-primary/10 text-primary border-primary/20",
  scheduled: "bg-warning/10 text-warning border-warning/20",
  "no-answer": "bg-muted text-muted-foreground border-border",
  interested: "bg-success/10 text-success border-success/20",
  "not-interested": "bg-destructive/10 text-destructive border-destructive/20",
  callback: "bg-primary/10 text-primary border-primary/20",
};

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  useEffect(() => {
    const foundCampaign = campaigns.find((c) => c.id === id);
    setCampaign(foundCampaign || null);
  }, [id]);

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || contact.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const campaignCalls = calls.filter((call) => call.campaignId === id);

  if (!campaign) {
    return (
      <DashboardLayout>
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">Campaign not found</p>
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
              onClick={() => router.push("/campaigns")}
              className="mb-4 -ml-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Campaigns
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">
                {campaign.name}
              </h1>
              <Badge
                variant="outline"
                className={statusColors[campaign.status]}
              >
                {campaign.status}
              </Badge>
            </div>
            <p className="mt-1 text-muted-foreground">{campaign.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="bg-transparent">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            {campaign.status === "active" ? (
              <Button variant="outline" className="bg-transparent">
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </Button>
            ) : (
              <Button>
                <Play className="mr-2 h-4 w-4" />
                {campaign.status === "draft" ? "Launch" : "Resume"}
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {campaign.totalContacts}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Contacts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {campaign.contactsCalled}
                  </p>
                  <p className="text-sm text-muted-foreground">Calls Made</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {campaign.interested}
                  </p>
                  <p className="text-sm text-muted-foreground">Interested</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {campaign.callbacks}
                  </p>
                  <p className="text-sm text-muted-foreground">Callbacks</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress */}
        <Card>
          <CardContent className="p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-foreground">Campaign Progress</p>
                <p className="text-sm text-muted-foreground">
                  {campaign.contactsCalled} of {campaign.totalContacts} contacts
                  called
                </p>
              </div>
              <span className="text-2xl font-bold text-foreground">
                {Math.round(
                  (campaign.contactsCalled / campaign.totalContacts) * 100
                )}
                %
              </span>
            </div>
            <Progress
              value={(campaign.contactsCalled / campaign.totalContacts) * 100}
              className="mt-4 h-2"
            />
          </CardContent>
        </Card>

        {/* Campaign Info */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Agent</CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                href={`/agents/${campaign.agentId}/test`}
                className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-accent/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {campaign.agentName}
                    </p>
                    <p className="text-sm text-muted-foreground">AI Agent</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Days:</span>
                <span className="font-medium text-foreground">
                  {campaign.schedule.days.join(", ")}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Time:</span>
                <span className="font-medium text-foreground">
                  {campaign.schedule.startTime} - {campaign.schedule.endTime}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Timezone: {campaign.schedule.timezone}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Success Rate</span>
                <span className="font-medium text-foreground">
                  {campaign.contactsCalled > 0
                    ? Math.round(
                        (campaign.interested / campaign.contactsCalled) * 100
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Callback Rate</span>
                <span className="font-medium text-foreground">
                  {campaign.contactsCalled > 0
                    ? Math.round(
                        (campaign.callbacks / campaign.contactsCalled) * 100
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Start Date</span>
                <span className="font-medium text-foreground">
                  {new Date(campaign.startDate).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="contacts">
          <TabsList>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="calls">Call History</TabsTrigger>
          </TabsList>

          <TabsContent value="contacts" className="mt-6 space-y-4">
            {/* Contacts Toolbar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-1 items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search contacts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="called">Called</SelectItem>
                    <SelectItem value="interested">Interested</SelectItem>
                    <SelectItem value="not-interested">Not Interested</SelectItem>
                    <SelectItem value="callback">Callback</SelectItem>
                    <SelectItem value="no-answer">No Answer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="bg-transparent">
                  <Upload className="mr-2 h-4 w-4" />
                  Import
                </Button>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Contact
                </Button>
              </div>
            </div>

            {/* Contacts Table */}
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox />
                    </TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Call</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedContacts.includes(contact.id)}
                          onCheckedChange={() =>
                            setSelectedContacts((prev) =>
                              prev.includes(contact.id)
                                ? prev.filter((i) => i !== contact.id)
                                : [...prev, contact.id]
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">
                            {contact.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {contact.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {contact.company}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {contact.title}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={contactStatusColors[contact.status]}
                        >
                          {contact.status.replace("-", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {contact.lastCallDate
                          ? new Date(contact.lastCallDate).toLocaleDateString()
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="calls" className="mt-6">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Outcome</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaignCalls.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground py-8"
                      >
                        No calls recorded yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    campaignCalls.map((call) => (
                      <TableRow key={call.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">
                              {call.contactName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {call.contactCompany}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {call.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              contactStatusColors[call.outcome || "no-answer"]
                            }
                          >
                            {call.outcome?.replace("-", " ") || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDuration(call.duration)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(call.startTime).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Link href={`/calls/${call.id}`}>
                            <Button variant="ghost" size="sm">
                              View
                              <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
