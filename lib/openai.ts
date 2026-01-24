import OpenAI from "openai";

export async function summarizeCoworkingSiteWithOpenAI(input: {
  businessName: string;
  website: string;
  pages: Array<{ url: string; title: string | null; text: string }>;
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY.");

  const client = new OpenAI({ apiKey });

  const payloadText = input.pages
    .slice(0, 12)
    .map((p) => `URL: ${p.url}\nTITLE: ${p.title || ""}\nCONTENT:\n${p.text}`)
    .join("\n\n---\n\n")
    .slice(0, 120_000);

  const schema = {
    name: "coworking_site_summary",
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        business_name: { type: "string" },
        website: { type: "string" },
        locations: { type: "array", items: { type: "string" } },
        pricing: {
          type: "object",
          additionalProperties: false,
          properties: {
            plans: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  name: { type: "string" },
                  price: { type: "string" },
                  period: { type: "string" },
                  notes: { type: "string" },
                },
                required: ["name", "price", "period", "notes"],
              },
            },
            discounts: { type: "array", items: { type: "string" } },
          },
          required: ["plans", "discounts"],
        },
        amenities: { type: "array", items: { type: "string" } },
        access_hours: { type: "array", items: { type: "string" } },
        meeting_rooms: { type: "array", items: { type: "string" } },
        policies: { type: "array", items: { type: "string" } },
        target_customers: { type: "array", items: { type: "string" } },
        tour_booking_instructions: { type: "array", items: { type: "string" } },
        faqs: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: { q: { type: "string" }, a: { type: "string" } },
            required: ["q", "a"],
          },
        },
        sources: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: { url: { type: "string" }, notes: { type: "string" } },
            required: ["url", "notes"],
          },
        },
      },
      required: [
        "business_name",
        "website",
        "locations",
        "pricing",
        "amenities",
        "access_hours",
        "meeting_rooms",
        "policies",
        "target_customers",
        "tour_booking_instructions",
        "faqs",
        "sources",
      ],
    },
  } as const;

  const prompt = [
    "Extract structured business facts from the coworking space website content below.",
    "Only include facts supported by the provided content. If unknown, use empty arrays or empty strings.",
    "",
    `Business name: ${input.businessName}`,
    `Website: ${input.website}`,
    "",
    payloadText,
  ].join("\n");

  // Prefer strict structured output when available.
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_schema", json_schema: schema } as any,
  });

  const content = response.choices?.[0]?.message?.content?.trim() || "";
  if (!content) throw new Error("OpenAI returned empty content.");

  let parsed: any;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("OpenAI response was not valid JSON.");
  }

  return { json: parsed, raw: content };
}

