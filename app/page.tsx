import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Phone,
  BarChart3,
  Zap,
  Shield,
  ArrowRight,
  CheckCircle2,
  Play,
  Users,
  Clock,
  TrendingUp,
} from "lucide-react";

const features = [
  {
    icon: Phone,
    title: "AI-Powered Calling",
    description:
      "Deploy intelligent AI agents that conduct natural, human-like sales conversations at scale.",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description:
      "Track every call, measure outcomes, and optimize your campaigns with detailed insights.",
  },
  {
    icon: Zap,
    title: "Instant Scalability",
    description:
      "Go from 10 to 10,000 calls per day without hiring additional staff or compromising quality.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "SOC 2 Type II compliant with end-to-end encryption and comprehensive audit trails.",
  },
];

const stats = [
  { value: "300%", label: "Increase in Outreach", icon: TrendingUp },
  { value: "45%", label: "Cost Reduction", icon: BarChart3 },
  { value: "24/7", label: "Availability", icon: Clock },
  { value: "10k+", label: "Active Users", icon: Users },
];

const benefits = [
  "Natural conversational AI that adapts to each prospect",
  "Seamless CRM integration with Salesforce, HubSpot, and more",
  "Detailed call recordings and transcripts",
  "Custom agent personalities and scripts",
  "Multi-language support for global teams",
  "Compliance with TCPA and other regulations",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Phone className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">
              CallAgent AI
            </span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Pricing
            </Link>
            <Link
              href="#about"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              About
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/login">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,var(--color-primary)/0.08,transparent)]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
              Scale Your Sales with{" "}
              <span className="text-primary">AI-Powered</span> Calling Agents
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground text-balance">
              Deploy intelligent AI agents that conduct natural sales
              conversations, qualify leads, and book meetings — all while you
              focus on closing deals.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/login">
                <Button size="lg" className="min-w-[180px]">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="min-w-[180px] bg-transparent"
              >
                <Play className="mr-2 h-4 w-4" />
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border bg-card p-6 text-center shadow-sm"
              >
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground sm:text-3xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t border-border bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything you need to scale outbound sales
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Powerful features designed for modern sales teams
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Why teams choose CallAgent AI
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Join thousands of sales teams who have transformed their
                outbound process with AI-powered calling.
              </p>
              <ul className="mt-8 space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <Link href="/login">
                  <Button size="lg">
                    Get Started Today
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
                <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
                  <div className="h-3 w-3 rounded-full bg-destructive/60" />
                  <div className="h-3 w-3 rounded-full bg-warning/60" />
                  <div className="h-3 w-3 rounded-full bg-success/60" />
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                        AI
                      </div>
                      <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5">
                        <p className="text-sm text-foreground">
                          {"Hi, this is Alex from TechStartup. I hope I caught you at a good time. Is this Sarah?"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start justify-end gap-3">
                      <div className="rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5">
                        <p className="text-sm text-primary-foreground">
                          Yes, this is Sarah. What can I do for you?
                        </p>
                      </div>
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground">
                        SJ
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                        AI
                      </div>
                      <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5">
                        <p className="text-sm text-foreground">
                          {"Great to connect! I'm reaching out because we've been helping companies like yours increase their sales outreach by 300%..."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-primary py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div>
              <h2 className="text-2xl font-bold text-primary-foreground sm:text-3xl">
                Ready to transform your sales process?
              </h2>
              <p className="mt-2 text-primary-foreground/80">
                Start your free trial today. No credit card required.
              </p>
            </div>
            <Link href="/login">
              <Button
                size="lg"
                variant="secondary"
                className="min-w-[180px]"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Phone className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-foreground">
                CallAgent AI
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; 2024 CallAgent AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
