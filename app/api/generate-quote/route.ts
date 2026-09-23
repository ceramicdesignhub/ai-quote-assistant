import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "build-placeholder",
});

function calculatePricing(enquiry: string) {
  const text = enquiry.toLowerCase();

  // ------------------------------------
  // INTERIOR PAINTING
  // ------------------------------------
  if (
    text.includes("paint") ||
    text.includes("painting") ||
    text.includes("interior painting")
  ) {
    const sqftMatch = text.match(/(\d[\d,]*)\s*(sq\s*ft|sqft|square feet)/i);

    if (sqftMatch) {
      const sqft = Number(sqftMatch[1].replace(/,/g, ""));

      // Austin 2026 market reference:
      // Approx. $2.50-$6.00/sq ft.
      // We use $3.75/sq ft as an estimate midpoint.
      const low = Math.round(sqft * 2.5);
      const estimated = Math.round(sqft * 3.75);
      const high = Math.round(sqft * 6);

      return {
        service: "Interior Painting",
        pricing: `
Estimated pricing based on approximately ${sqft} sq ft:

- Low estimate: $${low.toLocaleString()}
- Estimated price: $${estimated.toLocaleString()}
- High estimate: $${high.toLocaleString()}

Pricing basis: approximately $2.50-$6.00 per sq ft for Austin interior painting.
The estimated midpoint used by QuotePilot is $3.75 per sq ft.

This is an ESTIMATE, not a firm fixed-price quote.
Final pricing depends on ceilings, trim, doors, number of coats, wall condition, prep work, paint type, and site inspection.
        `.trim(),
      };
    }

    return {
      service: "Interior Painting",
      pricing:
        "Price estimate requires the approximate square footage of the surfaces being painted.",
    };
  }

  // ------------------------------------
  // PRESSURE WASHING
  // ------------------------------------
  if (
    text.includes("pressure wash") ||
    text.includes("pressure washing") ||
    text.includes("power wash") ||
    text.includes("power washing")
  ) {
    const hasDriveway = text.includes("driveway");

    // Austin reference:
    // House pressure washing commonly falls around $186-$459.
    // Driveway commonly around $100-$250.
    const houseEstimate = 325;
    const drivewayEstimate = hasDriveway ? 175 : 0;
    const estimated = houseEstimate + drivewayEstimate;

    return {
      service: "Pressure Washing",
      pricing: `
Estimated pricing:

- House pressure washing estimate: $${houseEstimate}
${hasDriveway ? `- Driveway pressure washing estimate: $${drivewayEstimate}` : ""}
- Estimated total: $${estimated}

This is an ESTIMATE, not a firm fixed-price quote.
Final pricing depends on house size, number of stories, surface material, condition, driveway size, accessibility, and stain treatment requirements.
      `.trim(),
    };
  }

  // ------------------------------------
  // UNKNOWN SERVICE
  // ------------------------------------
  return {
    service: "General Service",
    pricing:
      "Pricing cannot be calculated yet because the requested service or measurable project size was not clearly identified.",
  };
}

export async function POST(req: Request) {
  try {
    const { enquiry } = await req.json();

    if (!enquiry) {
      return NextResponse.json(
        { error: "Enquiry is required" },
        { status: 400 }
      );
    }

    const pricing = calculatePricing(enquiry);

    const response = await openai.responses.create({
      model: "gpt-5-mini",
      input: [
        {
          role: "system",
          content: `
You are QuotePilot, an AI quote assistant for small businesses.

Your job is to turn customer enquiries into professional quote drafts.

IMPORTANT PRICING RULES:
1. Never invent a price yourself.
2. Use ONLY the pricing calculation supplied by the application.
3. Clearly label calculated prices as ESTIMATES unless the business has explicitly provided a firm price.
4. Do not present an estimate as a guaranteed or fixed price.
5. If required information is missing, clearly list it.
6. Do not invent customer names, addresses, availability dates, company names, payment terms, warranties, or other business information.
7. Keep the quote professional and easy for a small business owner to review.
8. Separate:
   - Customer requirements
   - Scope
   - Estimated price
   - Missing information
   - Availability
   - Customer-ready message

The human business owner must approve the quote before sending it.
          `.trim(),
        },
        {
          role: "user",
          content: `
Customer enquiry:

${enquiry}

Pricing calculation supplied by QuotePilot:

Service:
${pricing.service}

${pricing.pricing}

Create the professional quote draft now.
          `.trim(),
        },
      ],
    });

    return NextResponse.json({
      success: true,
      quote: response.output_text,
      pricing: pricing,
    });
  } catch (error) {
    console.error("Quote generation error:", error);

    return NextResponse.json(
      { error: "Failed to generate quote" },
      { status: 500 }
    );
  }
}