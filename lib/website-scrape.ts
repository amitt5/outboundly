import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { XMLParser } from "fast-xml-parser";

export type ScrapedPage = {
  url: string;
  title: string | null;
  text: string;
};

export type ScrapeReport = {
  targets: string[];
  pages: ScrapedPage[];
};

function normalizeUrl(raw: string): URL {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error("Empty URL");
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return new URL(trimmed);
  return new URL(`https://${trimmed}`);
}

function sameOrigin(a: URL, b: URL) {
  return a.protocol === b.protocol && a.host === b.host;
}

function cleanText(input: string) {
  return input
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function fetchText(url: string, timeoutMs = 15000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "user-agent":
          "OutboundlyDemoBot/1.0 (+https://example.com) Mozilla/5.0 (compatible)",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    if (!res.ok) throw new Error(`Fetch failed (${res.status}) for ${url}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

export async function discoverFromSitemap(baseUrl: string, maxPages: number) {
  const base = normalizeUrl(baseUrl);
  const sitemapUrl = new URL("/sitemap.xml", base).toString();

  try {
    const xml = await fetchText(sitemapUrl, 15000);
    const parser = new XMLParser({ ignoreAttributes: true });
    const parsed = parser.parse(xml) as any;

    // Handle sitemapindex and urlset
    const urls: string[] = [];

    const urlset = parsed?.urlset?.url;
    if (urlset) {
      const list = Array.isArray(urlset) ? urlset : [urlset];
      for (const item of list) {
        const loc = item?.loc;
        if (typeof loc === "string") urls.push(loc);
      }
    }

    const sitemapindex = parsed?.sitemapindex?.sitemap;
    if (urls.length === 0 && sitemapindex) {
      const list = Array.isArray(sitemapindex) ? sitemapindex : [sitemapindex];
      for (const sm of list.slice(0, 5)) {
        const loc = sm?.loc;
        if (typeof loc !== "string") continue;
        try {
          const childXml = await fetchText(loc, 15000);
          const childParsed = parser.parse(childXml) as any;
          const childUrlset = childParsed?.urlset?.url;
          const childList = Array.isArray(childUrlset) ? childUrlset : childUrlset ? [childUrlset] : [];
          for (const item of childList) {
            const childLoc = item?.loc;
            if (typeof childLoc === "string") urls.push(childLoc);
            if (urls.length >= maxPages) break;
          }
        } catch {
          // ignore child sitemap failures
        }
        if (urls.length >= maxPages) break;
      }
    }

    const filtered: string[] = [];
    for (const u of urls) {
      try {
        const parsedUrl = new URL(u);
        if (!sameOrigin(parsedUrl, base)) continue;
        filtered.push(parsedUrl.toString());
      } catch {
        // ignore
      }
      if (filtered.length >= maxPages) break;
    }

    // Ensure homepage is first
    const home = base.toString();
    const unique = Array.from(new Set([home, ...filtered]));
    return unique.slice(0, maxPages);
  } catch {
    return [base.toString()];
  }
}

export function extractReadableText(html: string, pageUrl: string): { title: string | null; text: string } {
  const dom = new JSDOM(html, { url: pageUrl });
  const doc = dom.window.document;

  // Try Readability first
  try {
    const reader = new Readability(doc);
    const article = reader.parse();
    if (article?.textContent) {
      return {
        title: article.title || doc.title || null,
        text: cleanText(article.textContent),
      };
    }
  } catch {
    // ignore
  }

  // Fallback: strip scripts/styles and use body text
  for (const el of Array.from(doc.querySelectorAll("script,style,noscript"))) {
    el.remove();
  }
  const text = cleanText(doc.body?.textContent || doc.textContent || "");
  return { title: doc.title || null, text };
}

export async function scrapeWebsitePages(website: string, maxPages: number): Promise<ScrapedPage[]> {
  const targets = await discoverFromSitemap(website, maxPages);

  const pages: ScrapedPage[] = [];
  for (const url of targets) {
    try {
      const html = await fetchText(url, 20000);
      const { title, text } = extractReadableText(html, url);
      if (text && text.length >= 200) {
        pages.push({ url, title, text });
      }
    } catch {
      // ignore individual page failures
    }
  }

  return pages;
}

export async function scrapeWebsiteWithReport(
  website: string,
  maxPages: number
): Promise<ScrapeReport> {
  const targets = await discoverFromSitemap(website, maxPages);
  const pages = await scrapeWebsitePages(website, maxPages);
  return { targets, pages };
}

