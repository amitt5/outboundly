import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { scrapeWebsiteWithReport } from "@/lib/website-scrape";
import { summarizeCoworkingSiteWithOpenAI } from "@/lib/openai";

export const runtime = "nodejs";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getSupabaseServerClient();

  const { data: agent, error: agentErr } = await supabase
    .from("agents")
    .select("id,business_name,business_website")
    .eq("id", id)
    .single();

  if (agentErr || !agent) {
    return NextResponse.json(
      { ok: false, error: agentErr?.message || "Agent not found." },
      { status: 404 }
    );
  }

  const website = (agent.business_website || "").trim();
  if (!website) {
    return NextResponse.json(
      { ok: false, error: "Agent has no business_website to scrape." },
      { status: 400 }
    );
  }

  const maxPages = 20;

  console.log(`[scrape] agent=${id} website=${website} maxPages=${maxPages}`);
  const report = await scrapeWebsiteWithReport(website, maxPages);
  console.log(`[scrape] discovered ${report.targets.length} urls`);
  for (const u of report.targets) console.log(`[scrape] target: ${u}`);
  console.log(`[scrape] extracted ${report.pages.length} pages with readable text`);
  for (const p of report.pages) {
    console.log(
      `[scrape] page: ${p.url} | title=${JSON.stringify(p.title)} | chars=${p.text.length}`
    );
  }

  const pages = report.pages;
  if (!pages.length) {
    return NextResponse.json(
      {
        ok: false,
        error: "No pages could be scraped from the website.",
        discoveredUrls: report.targets,
      },
      { status: 422 }
    );
  }

  // Store raw scraped pages
  const rawUploads = pages.map((p) => ({
    agent_id: id,
    kind: "document" as const,
    title: p.title ? `${p.title} (${p.url})` : p.url,
    text_content: p.text,
  }));

  const { error: insertErr } = await supabase.from("agent_uploads").insert(rawUploads);
  if (insertErr) {
    return NextResponse.json(
      {
        ok: false,
        error: insertErr.message || "Failed to store scraped pages.",
        discoveredUrls: report.targets,
        scrapedPages: pages.map((p) => ({
          url: p.url,
          title: p.title,
          textChars: p.text.length,
        })),
      },
      { status: 500 }
    );
  }

  // OpenAI: create structured summary and store it as a document upload
  try {
    const summary = await summarizeCoworkingSiteWithOpenAI({
      businessName: agent.business_name,
      website,
      pages,
    });

    const summaryText = JSON.stringify(summary.json, null, 2);

    const { error: summaryErr } = await supabase.from("agent_uploads").insert({
      agent_id: id,
      kind: "document",
      title: "Website summary (OpenAI JSON)",
      text_content: summaryText,
    });

    if (summaryErr) {
      // Non-fatal
      return NextResponse.json(
        {
          ok: true,
          pagesStored: pages.length,
          summaryStored: false,
          summaryError: summaryErr.message,
          discoveredUrls: report.targets,
          scrapedPages: pages.map((p) => ({
            url: p.url,
            title: p.title,
            textChars: p.text.length,
          })),
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        pagesStored: pages.length,
        summaryStored: true,
        discoveredUrls: report.targets,
        scrapedPages: pages.map((p) => ({
          url: p.url,
          title: p.title,
          textChars: p.text.length,
        })),
      },
      { status: 200 }
    );
  } catch (e: any) {
    // Non-fatal: scraped pages are already stored
    return NextResponse.json(
      {
        ok: true,
        pagesStored: pages.length,
        summaryStored: false,
        summaryError: e?.message || "Perplexity summarization failed.",
        discoveredUrls: report.targets,
        scrapedPages: pages.map((p) => ({
          url: p.url,
          title: p.title,
          textChars: p.text.length,
        })),
      },
      { status: 200 }
    );
  }
}

