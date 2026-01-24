"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  User,
  Mic,
  MessageSquare,
  Target,
  Volume2,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

const steps = [
  { id: 1, title: "Basic Info", icon: User },
  { id: 2, title: "Voice & Personality", icon: Mic },
  { id: 3, title: "Script & Greeting", icon: MessageSquare },
  { id: 4, title: "Objectives", icon: Target },
];

const voiceOptions = [
  { id: "professional-male", label: "Professional Male", description: "Clear, confident, business-like" },
  { id: "friendly-female", label: "Friendly Female", description: "Warm, approachable, conversational" },
  { id: "warm-neutral", label: "Warm Neutral", description: "Balanced, professional, versatile" },
  { id: "energetic-male", label: "Energetic Male", description: "Dynamic, enthusiastic, persuasive" },
];

const personalityTraits = [
  "Professional",
  "Friendly",
  "Consultative",
  "Energetic",
  "Patient",
  "Persuasive",
  "Empathetic",
  "Direct",
];

export default function CreateAgentPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    businessName: "",
    website: "",
    documentsNotes: "",
    previousSalesTranscripts: "",
    currentRepTrainingTranscripts: "",
    name: "",
    description: "",
    voice: "professional-male",
    speakingPace: [50],
    personality: [] as string[],
    greeting:
      "Hi {prospect_name}, this is {agent_name} from {business_name}. Thanks for reaching out about coworking—do you have 2 minutes so I can help you find the right plan?",
    talkingPoints: "",
    objective: "Qualify the prospect and book a tour/demo for our coworking space.",
    successCriteria: "schedule_demo",
    maxCallDuration: [5],
  });

  const updateFormData = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const togglePersonality = (trait: string) => {
    setFormData((prev) => ({
      ...prev,
      personality: prev.personality.includes(trait)
        ? prev.personality.filter((t) => t !== trait)
        : [...prev.personality, trait],
    }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreate = async () => {
    setIsCreating(true);
    setCreateError(null);
    try {
      const supabase = getSupabaseBrowserClient();

      const agentPayload = {
        business_name: formData.businessName.trim(),
        business_website: formData.website.trim() || null,
        agent_name: (formData.name.trim() || "Sales Agent").trim(),
        description: formData.description.trim() || null,
        opening_greeting: formData.greeting.trim() || null,
        key_talking_points: formData.talkingPoints.trim() || null,
        primary_objective: formData.objective.trim() || null,
        success_criteria: formData.successCriteria,
        voice_preset: formData.voice,
        speaking_pace: formData.speakingPace?.[0] ?? null,
        personality_traits: formData.personality,
        max_call_duration_minutes: formData.maxCallDuration?.[0] ?? 10,
        published: false,
      };

      const { data: created, error } = await supabase
        .from("agents")
        .insert(agentPayload)
        .select("id")
        .single();

      if (error || !created?.id) throw error || new Error("Failed to create agent.");

      const uploads: Array<{
        agent_id: string;
        kind: "document" | "previous_sales_transcript" | "training_transcript";
        title: string;
        text_content: string;
      }> = [];

      if (formData.documentsNotes.trim()) {
        uploads.push({
          agent_id: created.id,
          kind: "document",
          title: "Documents / information (notes)",
          text_content: formData.documentsNotes,
        });
      }
      if (formData.previousSalesTranscripts.trim()) {
        uploads.push({
          agent_id: created.id,
          kind: "previous_sales_transcript",
          title: "Previous sales transcripts",
          text_content: formData.previousSalesTranscripts,
        });
      }
      if (formData.currentRepTrainingTranscripts.trim()) {
        uploads.push({
          agent_id: created.id,
          kind: "training_transcript",
          title: "Training transcripts (current rep)",
          text_content: formData.currentRepTrainingTranscripts,
        });
      }

      if (uploads.length) {
        const { error: uploadsError } = await supabase
          .from("agent_uploads")
          .insert(uploads);
        if (uploadsError) throw uploadsError;
      }

      router.push("/agents");
    } catch (e: any) {
      console.error(e);
      setCreateError(e?.message || "Failed to create agent.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/agents")}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Agents
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Create New Agent</h1>
          <p className="text-muted-foreground">
            Configure your AI calling agent step by step
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  "flex items-center",
                  index < steps.length - 1 && "flex-1"
                )}
              >
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                      currentStep > step.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : currentStep === step.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card text-muted-foreground"
                    )}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "mt-2 text-sm font-medium",
                      currentStep >= step.id
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "mx-4 h-0.5 flex-1 transition-colors",
                      currentStep > step.id ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <Card className="max-w-3xl">
          <CardContent className="p-6">
            {createError && (
              <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                {createError}
              </div>
            )}
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    placeholder="e.g., HarborHub Coworking"
                    value={formData.businessName}
                    onChange={(e) => updateFormData("businessName", e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    This is the coworking space the agent represents in the demo.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    placeholder="https://..."
                    value={formData.website}
                    onChange={(e) => updateFormData("website", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Agent Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Sales Agent - Enterprise"
                    value={formData.name}
                    onChange={(e) => updateFormData("name", e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Choose a descriptive name to help identify this agent
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the purpose and target audience for this agent..."
                    value={formData.description}
                    onChange={(e) =>
                      updateFormData("description", e.target.value)
                    }
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Voice & Personality */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label>Voice Selection</Label>
                  <RadioGroup
                    value={formData.voice}
                    onValueChange={(value) => updateFormData("voice", value)}
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      {voiceOptions.map((voice) => (
                        <div key={voice.id}>
                          <RadioGroupItem
                            value={voice.id}
                            id={voice.id}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={voice.id}
                            className={cn(
                              "flex cursor-pointer flex-col rounded-lg border border-border p-4 transition-colors hover:bg-accent/50",
                              "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{voice.label}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => e.preventDefault()}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            </div>
                            <span className="mt-1 text-sm text-muted-foreground">
                              {voice.description}
                            </span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Speaking Pace</Label>
                    <span className="text-sm text-muted-foreground">
                      {formData.speakingPace[0] < 40
                        ? "Slower"
                        : formData.speakingPace[0] > 60
                          ? "Faster"
                          : "Normal"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                    <Slider
                      value={formData.speakingPace}
                      onValueChange={(value) =>
                        updateFormData("speakingPace", value)
                      }
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <Volume2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Personality Traits</Label>
                  <p className="text-sm text-muted-foreground">
                    Select up to 3 traits that define how the agent communicates
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {personalityTraits.map((trait) => (
                      <Button
                        key={trait}
                        type="button"
                        variant={
                          formData.personality.includes(trait)
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => togglePersonality(trait)}
                        disabled={
                          formData.personality.length >= 3 &&
                          !formData.personality.includes(trait)
                        }
                        className={!formData.personality.includes(trait) ? "bg-transparent" : ""}
                      >
                        {trait}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Script & Greeting */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="documentsNotes">
                    Upload documents / information (notes for demo)
                  </Label>
                  <Textarea
                    id="documentsNotes"
                    placeholder="Paste or summarize key information about the business, pricing, amenities, location, policies, etc."
                    value={formData.documentsNotes}
                    onChange={(e) => updateFormData("documentsNotes", e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="previousSalesTranscripts">
                    Previous sales call transcripts (reference)
                  </Label>
                  <Textarea
                    id="previousSalesTranscripts"
                    placeholder="Paste a few transcripts your best reps used to close coworking leads..."
                    value={formData.previousSalesTranscripts}
                    onChange={(e) =>
                      updateFormData("previousSalesTranscripts", e.target.value)
                    }
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentRepTrainingTranscripts">
                    Training transcripts for current rep (reference)
                  </Label>
                  <Textarea
                    id="currentRepTrainingTranscripts"
                    placeholder="Paste training notes/transcripts you want the agent to follow..."
                    value={formData.currentRepTrainingTranscripts}
                    onChange={(e) =>
                      updateFormData("currentRepTrainingTranscripts", e.target.value)
                    }
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="greeting">Opening Greeting</Label>
                  <Textarea
                    id="greeting"
                    placeholder="Enter the greeting your agent will use to start calls..."
                    value={formData.greeting}
                    onChange={(e) => updateFormData("greeting", e.target.value)}
                    rows={3}
                  />
                  <p className="text-sm text-muted-foreground">
                    {"Use {agent_name}, {business_name}, {prospect_name} as placeholders"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="talkingPoints">Key Talking Points</Label>
                  <Textarea
                    id="talkingPoints"
                    placeholder="Enter the main points the agent should cover during calls..."
                    value={formData.talkingPoints}
                    onChange={(e) =>
                      updateFormData("talkingPoints", e.target.value)
                    }
                    rows={6}
                  />
                  <p className="text-sm text-muted-foreground">
                    List the key topics and value propositions the agent should
                    discuss
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Objectives */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="objective">Primary Objective</Label>
                  <Textarea
                    id="objective"
                    placeholder="Describe what the agent should accomplish on each call..."
                    value={formData.objective}
                    onChange={(e) => updateFormData("objective", e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-4">
                  <Label>Success Criteria</Label>
                  <Select
                    value={formData.successCriteria}
                    onValueChange={(value) =>
                      updateFormData("successCriteria", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select success criteria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="schedule_demo">
                        Schedule a demo
                      </SelectItem>
                      <SelectItem value="qualify_lead">
                        Qualify the lead
                      </SelectItem>
                      <SelectItem value="book_meeting">
                        Book a meeting
                      </SelectItem>
                      <SelectItem value="gather_info">
                        Gather information
                      </SelectItem>
                      <SelectItem value="transfer_call">
                        Transfer to sales rep
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Maximum Call Duration</Label>
                    <span className="text-sm text-muted-foreground">
                      {formData.maxCallDuration[0]} minutes
                    </span>
                  </div>
                  <Slider
                    value={formData.maxCallDuration}
                    onValueChange={(value) =>
                      updateFormData("maxCallDuration", value)
                    }
                    min={1}
                    max={15}
                    step={1}
                  />
                </div>

                {/* Summary */}
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <h3 className="font-medium text-foreground">Agent Summary</h3>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Name:</dt>
                      <dd className="font-medium text-foreground">
                        {formData.name || "Not set"}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Voice:</dt>
                      <dd className="font-medium text-foreground">
                        {voiceOptions.find((v) => v.id === formData.voice)
                          ?.label || "Not set"}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Personality:</dt>
                      <dd className="font-medium text-foreground">
                        {formData.personality.length > 0
                          ? formData.personality.join(", ")
                          : "Not set"}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Success Criteria:</dt>
                      <dd className="font-medium text-foreground capitalize">
                        {formData.successCriteria.replace("_", " ")}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="bg-transparent"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              {currentStep < 4 ? (
                <Button onClick={handleNext}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleCreate} disabled={isCreating}>
                  {isCreating ? (
                    <>Creating Agent...</>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Create Agent
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
