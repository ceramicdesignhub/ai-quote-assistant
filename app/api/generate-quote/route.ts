import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "build-placeholder",
});

type PricingSettings = {
  businessName?: string;
  paintingRate?: number;
  pressureWashRate?: number;
  drivewayRate?: number;
};

function calculatePricing(
  enquiry: string,
  settings: PricingSettings = {}
) {
  const text = enquiry.toLowerCase();

  const paintingRate = settings.paintingRate ?? 3.75;
  const pressureWashRate = settings.pressureWashRate ?? 325;
  const drivewayRate = settings.drivewayRate ?? 175;

  // INTERIOR PAINTING
  if (
    text.includes("paint") ||
    text.includes("painting") ||
    text.includes("interior painting")
  ) {
    const sqftMatch = text.match(
      /(\d[\d,]*)\s*(sq\s*ft|sqft|square feet)/i
    );

    if (sqftMatch) {
      const sqft = Number(sqftMatch[1].replace(/,/g, ""));
      const estimated = Math.round(sqft * paintingRate);

      return {
        service: "Interior Painting",
        pricing: `
Estimated pricing:

- Area: ${sqft.toLocaleString()} sq ft
- Business rate: $${paintingRate.toFixed(2)} / sq ft
- Estimated total: $${estimated.toLocaleString()}

This is an ESTIMATE, not a firm fixed-price quote.
Final pricing depends on surfaces, number of coats, wall condition, preparation, paint type and finish.
        `.trim(),
      };
    }

    return {
      service: "Interior Painting",
      pricing:
        "A square-foot measurement is required to calculate an estimated price.",
    };
  }

  // PRESSURE WASHING
  if (
    text.includes("pressure wash") ||
    text.includes("pressure washing") ||
    text.includes("power wash") ||
    text.includes("power washing")
  ) {
    const hasDriveway = text.includes("driveway");

    const houseEstimate = pressureWashRate;
    const drivewayEstimate = hasDriveway ? drivewayRate : 0;
    const estimated = houseEstimate + drivewayEstimate;

    return {
      service: "Pressure Washing",
      pricing: `
Estimated pricing:

- House pressure washing: $${houseEstimate.toLocaleString()}
${
  hasDriveway
    ? `- Driveway pressure washing: $${drivewayEstimate.toLocaleString()}`
    : ""
}
- Estimated total: $${estimated.toLocaleString()}

This is an ESTIMATE, not a firm fixed-price quote.
Final pricing depends on house size, number of stories, surface condition, driveway size and stain treatment requirements.
      `.trim(),
    };
  }

  return {
    service: "General Service",
    pricing:
      "Pricing cannot be calculated because the requested service or measurable project size was not identified.",
  };
}

export async function POST(req: Request) {
  try {
    const { enquiry, pricingSettings } = await req.json();

    if (!enquiry) {
      return NextResponse.json(
        { error: "Enquiry is required" },
        { status: 400 }
      );
    }

    const settings: PricingSettings = pricingSettings || {};

    const pricing = calculatePricing(enquiry, settings);

    const response = await openai.responses.create({
      model: "gpt-5-mini",
      input: [
        {
          role: "system",
          content: `
You are QuotePilot, an AI quote assistant for small businesses.

Business name:
${settings.businessName || "Business name not provided"}

Your job is to turn customer enquiries into professional quote drafts.

IMPORTANT RULES:

1. Use ONLY the pricing calculation supplied by the application.
2. Never invent or change a price.
3. Clearly label calculated prices as ESTIMATES.
4. Never present an estimate as a guaranteed or fixed price.
5. Never invent customer names, addresses, availability dates, company details, payment terms or warranties.
6. Clearly identify missing information.
7. Keep the quote professional and concise.
8. Create a useful customer-ready message.
9. Human approval is required before sending the quote.

The pricing calculation supplied by the application is authoritative.
          `.trim(),
        },
        {
          role: "user",
          content: `
Customer enquiry:

${enquiry}

Pricing calculation:

Service:
${pricing.service}

${pricing.pricing}

Create the professional quote draft.
          `.trim(),
        },
      ],
    });

    return NextResponse.json({
      success: true,
      quote: response.output_text,
      pricing,
    });
  } catch (error) {
    console.error("Quote generation error:", error);

    return NextResponse.json(
      { error: "Failed to generate quote" },
      { status: 500 }
    );
  }
}