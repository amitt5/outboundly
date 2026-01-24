"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  Play,
  Pause,
  Copy,
  Trash2,
  Phone,
  TrendingUp,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

const statusColors: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  inactive: "bg-muted text-muted-foreground border-border",
  training: "bg-primary/10 text-primary border-primary/20",
};

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function AgentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [agents, setAgents] = useState<
    Array<{
      id: string;
      agent_name: string;
      description: string | null;
      published: boolean;
      created_at: string;
    }>
  >([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoadError(null);
      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase
          .from("agents")
          .select("id, agent_name, description, published, created_at")
          .order("created_at", { ascending: false });
        if (error) throw error;
        setAgents(data || []);
      } catch (e: any) {
        console.error(e);
        setLoadError(e?.message || "Failed to load agents.");
      }
    };
    void load();
  }, []);

  const filteredAgents = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return agents
      .map((a) => ({
        id: a.id,
        name: a.agent_name,
        description: a.description || "",
        status: a.published ? ("active" as const) : ("inactive" as const),
        totalCalls: 0,
        successRate: 0,
        avgCallDuration: 0,
        __published: a.published,
      }))
      .filter(
        (a) => a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)
      );
  }, [agents, searchQuery]);

  const updatePublished = async (id: string, published: boolean) => {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from("agents").update({ published }).eq("id", id);
    if (error) throw error;
    setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, published } : a)));
  };

  const deleteAgent = async (id: string) => {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from("agents").delete().eq("id", id);
    if (error) throw error;
    setAgents((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Agents</h1>
            <p className="text-muted-foreground">
              Manage and configure your AI calling agents
            </p>
          </div>
          <Link href="/agents/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Agent
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Agents Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loadError && (
            <div className="sm:col-span-2 lg:col-span-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
              {loadError}
            </div>
          )}
          {filteredAgents.map((agent) => (
            <Card key={agent.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={statusColors[agent.status]}
                      >
                        {agent.status}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={async () => {
                              try {
                                await updatePublished(agent.id, agent.status !== "active");
                              } catch (e) {
                                console.error(e);
                              }
                            }}
                          >
                            {agent.status === "active" ? (
                              <>
                                <Pause className="mr-2 h-4 w-4" />
                                Unpublish
                              </>
                            ) : (
                              <>
                                <Play className="mr-2 h-4 w-4" />
                                Publish
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem disabled>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={async () => {
                              try {
                                await deleteAgent(agent.id);
                              } catch (e) {
                                console.error(e);
                              }
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <h3 className="mt-4 font-semibold text-foreground">
                    {agent.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {agent.description}
                  </p>
                </div>

                <div className="border-t border-border bg-muted/30 px-5 py-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="flex items-center justify-center gap-1 text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" />
                      </div>
                      <p className="mt-1 text-lg font-semibold text-foreground">
                        {agent.totalCalls}
                      </p>
                      <p className="text-xs text-muted-foreground">Calls</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 text-muted-foreground">
                        <TrendingUp className="h-3.5 w-3.5" />
                      </div>
                      <p className="mt-1 text-lg font-semibold text-foreground">
                        {agent.successRate}%
                      </p>
                      <p className="text-xs text-muted-foreground">Success</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                      </div>
                      <p className="mt-1 text-lg font-semibold text-foreground">
                        {formatDuration(agent.avgCallDuration)}
                      </p>
                      <p className="text-xs text-muted-foreground">Avg time</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border p-4">
                  <Link href={`/agents/${agent.id}/test`} className="block">
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      disabled={agent.status !== "active"}
                    >
                      Test Agent
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Create New Agent Card */}
          <Link href="/agents/create" className="block">
            <Card className="h-full border-dashed hover:border-primary/50 hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="flex h-full min-h-[280px] flex-col items-center justify-center p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold text-foreground">
                  Create New Agent
                </h3>
                <p className="mt-1 text-center text-sm text-muted-foreground">
                  Build a custom AI agent for your sales team
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
