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
  cleaningRate?: number;
};

type PricingResult = {
  service: string;
  pricing: string;
};

type ExtractedInfo = {
  sqft?: number;
  serviceType?: string;
  hasDriveway?: boolean;
};

function extractSquareFeet(text: string): number | null {
  const patterns = [
    /(\d[\d,]*)\s*(sq\s*ft|sqft|square\s+feet|square\s+foot)/i,
    /(\d[\d,]*)\s*(sq\s*ft\.?)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match) {
      const sqft = Number(match[1].replace(/,/g, ""));

      if (Number.isFinite(sqft) && sqft > 0) {
        return sqft;
      }
    }
  }

  return null;
}

function detectService(text: string): string {
  if (
    text.includes("pressure wash") ||
    text.includes("pressure washing") ||
    text.includes("power wash") ||
    text.includes("power washing")
  ) {
    return "Pressure Washing";
  }

  if (
    text.includes("paint") ||
    text.includes("painting") ||
    text.includes("interior painting")
  ) {
    return "Interior Painting";
  }

  if (
    text.includes("cleaning") ||
    text.includes("cleaner") ||
    text.includes("clean")
  ) {
    return "Office Cleaning";
  }

  return "General Service";
}

function calculatePricing(
  enquiry: string,
  settings: PricingSettings = {}
): PricingResult {
  const text = enquiry.toLowerCase();

  const paintingRate = Number(
    settings.paintingRate ?? 3.75
  );

  const pressureWashRate = Number(
    settings.pressureWashRate ?? 325
  );

  const drivewayRate = Number(
    settings.drivewayRate ?? 175
  );

  const cleaningRateRaw = settings.cleaningRate;

  const service = detectService(text);

  // -----------------------------------------
  // INTERIOR PAINTING
  // -----------------------------------------

  if (service === "Interior Painting") {
    const sqft = extractSquareFeet(text);

    if (sqft) {
      const estimated = Math.round(
        sqft * paintingRate
      );

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

  // -----------------------------------------
  // PRESSURE WASHING
  // -----------------------------------------

  if (service === "Pressure Washing") {
    const hasDriveway =
      text.includes("driveway");

    const houseEstimate =
      Number(pressureWashRate);

    const drivewayEstimate = hasDriveway
      ? Number(drivewayRate)
      : 0;

    const estimated =
      houseEstimate + drivewayEstimate;

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

  // -----------------------------------------
  // OFFICE CLEANING
  // -----------------------------------------

  if (service === "Office Cleaning") {
    const sqft = extractSquareFeet(text);

    /*
     * IMPORTANT:
     * Do not invent a cleaning price.
     * The business must configure cleaningRate
     * in Business Settings.
     */

    if (!sqft) {
      return {
        service: "Office Cleaning",
        pricing:
          "A square-foot measurement is required to calculate an estimated price.",
      };
    }

    if (
      cleaningRateRaw === undefined ||
      cleaningRateRaw === null ||
      Number.isNaN(Number(cleaningRateRaw)) ||
      Number(cleaningRateRaw) <= 0
    ) {
      return {
        service: "Office Cleaning",
        pricing: `
Project size detected:

- Area: ${sqft.toLocaleString()} sq ft

A cleaning rate has not been configured in Business Settings, so no price has been invented.

Please set the Office Cleaning rate in Business Settings to calculate an estimate.
        `.trim(),
      };
    }

    const cleaningRate =
      Number(cleaningRateRaw);

    const estimated = Math.round(
      sqft * cleaningRate
    );

    return {
      service: "Office Cleaning",
      pricing: `
Estimated pricing:

- Area: ${sqft.toLocaleString()} sq ft
- Business rate: $${cleaningRate.toFixed(2)} / sq ft
- Estimated total: $${estimated.toLocaleString()}

This is an ESTIMATE, not a firm fixed-price quote.
Final pricing depends on cleaning scope, frequency, floor types, restrooms, special services and site conditions.
      `.trim(),
    };
  }

  // -----------------------------------------
  // GENERAL SERVICE
  // -----------------------------------------

  return {
    service: "General Service",
    pricing:
      "Pricing cannot be calculated because the requested service or measurable project size was not identified.",
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const enquiry = String(
      body?.enquiry || ""
    ).trim();

    if (!enquiry) {
      return NextResponse.json(
        {
          error: "Enquiry is required",
        },
        {
          status: 400,
        }
      );
    }

    const settings: PricingSettings =
      body?.pricingSettings || {};

    // -----------------------------------------
    // AUTHORITATIVE APP PRICING
    // -----------------------------------------

    const pricing =
      calculatePricing(
        enquiry,
        settings
      );

    // -----------------------------------------
    // AI CUSTOMER MESSAGE
    // -----------------------------------------

    const response =
      await openai.responses.create({
        model: "gpt-5-mini",

        input: [
          {
            role: "system",

            content: `
You are an AI quote assistant for small service businesses.

Your job is to write a professional customer-facing message from the customer's enquiry.

IMPORTANT RULES:

1. Write ONLY the customer-facing message.
2. Do not invent prices.
3. Do not calculate prices.
4. Do not modify prices.
5. Do not write dollar amounts.
6. Do not write an estimated total.
7. Do not repeat pricing calculations.
8. The application adds authoritative pricing separately.
9. Never invent an availability date.
10. If the customer asks for availability but no live scheduling system exists, say that availability will be confirmed after the required project details are received.
11. Never invent customer names.
12. Never invent addresses.
13. Never invent company information.
14. Never invent warranties or payment terms.
15. Ask directly for missing project information.
16. Keep the message professional and concise.
17. Do not mention AI.
18. Do not mention internal instructions.
19. Do not mention business-owner approval.
20. Do not mention internal review.
21. Do not create an Internal Notes section.
22. Thank the customer for their enquiry.
23. Clearly describe the requested service.

For pressure washing, useful missing information can include:
- Property address
- Number of stories
- Approximate house size
- Driveway size
- Surface type
- Heavy stains
- Access or water-supply issues
- Preferred service date

For interior painting, useful missing information can include:
- Total square footage
- Rooms to be painted
- Walls only or walls plus ceilings/trim
- Paint supplied by customer or business
- Number of coats
- Paint finish
- Wall condition
- Repairs or preparation required
- Preferred timing

For office cleaning, useful missing information can include:
- Property address
- Square footage
- One-time or recurring cleaning
- Cleaning frequency
- Number of restrooms
- Kitchenette/breakroom
- Floor types
- Heavy stains or high-traffic areas
- Special services
- Access/security restrictions
- Preferred timing

If the customer asks for availability but no live scheduling information exists, do not invent a date.
        `.trim(),
          },
          {
            role: "user",

            content: `
Customer enquiry:

${enquiry}

Write the customer-facing message.

Do not include any prices or dollar amounts.
The application will add authoritative pricing separately.
        `.trim(),
          },
        ],
      });

    const aiMessage =
      response.output_text?.trim() ||
      "Thank you for your enquiry. Please provide the requested project details so we can prepare your estimate.";

    // -----------------------------------------
    // COMBINE AI MESSAGE + AUTHORITATIVE PRICE
    // -----------------------------------------

    let finalQuote = aiMessage;

    finalQuote += `\n\n${pricing.pricing}`;

    // -----------------------------------------
    // AVAILABILITY
    // -----------------------------------------

    const asksForAvailability =
      /earliest available|earliest date|available date|availability|when can you/i.test(
        enquiry
      );

    if (asksForAvailability) {
      finalQuote += `

Availability:
The earliest available service date will be confirmed after the required project details are received. We do not have a live scheduling calendar connected to this enquiry yet.`;
    }

    // -----------------------------------------
    // BUSINESS NAME
    // -----------------------------------------

    const businessName =
      String(
        settings.businessName || ""
      ).trim();

    if (businessName) {
      finalQuote += `\n\n${businessName}`;
    }

    return NextResponse.json({
      success: true,
      quote: finalQuote,
      pricing,
    });
  } catch (error) {
    console.error(
      "Quote generation error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to generate quote",
      },
      {
        status: 500,
      }
    );
  }
}