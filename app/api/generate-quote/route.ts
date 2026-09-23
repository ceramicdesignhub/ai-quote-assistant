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

type PricingResult = {
  service: string;
  pricing: string;
};

function calculatePricing(
  enquiry: string,
  settings: PricingSettings = {}
): PricingResult {
  const text = enquiry.toLowerCase();

  const paintingRate = Number(settings.paintingRate ?? 3.75);
  const pressureWashRate = Number(
    settings.pressureWashRate ?? 325
  );
  const drivewayRate = Number(
    settings.drivewayRate ?? 175
  );

  // -----------------------------------------
  // INTERIOR PAINTING
  // -----------------------------------------

  if (
    text.includes("paint") ||
    text.includes("painting") ||
    text.includes("interior painting")
  ) {
    const sqftMatch = text.match(
      /(\d[\d,]*)\s*(sq\s*ft|sqft|square feet)/i
    );

    if (sqftMatch) {
      const sqft = Number(
        sqftMatch[1].replace(/,/g, "")
      );

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

  if (
    text.includes("pressure wash") ||
    text.includes("pressure washing") ||
    text.includes("power wash") ||
    text.includes("power washing")
  ) {
    const hasDriveway =
      text.includes("driveway");

    const houseEstimate =
      Number(pressureWashRate);

    const drivewayEstimate = hasDriveway
      ? Number(drivewayRate)
      : 0;

    // IMPORTANT:
    // Convert everything to numbers before addition.
    const estimated =
      Number(houseEstimate) +
      Number(drivewayEstimate);

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
          error:
            "Enquiry is required",
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
    // CREATE CUSTOMER MESSAGE WITH AI
    //
    // IMPORTANT:
    // AI is NOT allowed to generate or
    // calculate pricing numbers.
    // Pricing is added by the application
    // after AI generates the wording.
    // -----------------------------------------

    const response =
      await openai.responses.create({
        model: "gpt-5-mini",

        input: [
          {
            role: "system",

            content: `
You are QuotePilot, an AI quote assistant for small service businesses.

Your job is to write a professional customer-facing message from the customer's enquiry.

IMPORTANT RULES:

1. Write ONLY the customer-facing message.
2. Do not invent prices.
3. Do not calculate prices.
4. Do not modify prices.
5. Do not write any dollar amounts.
6. Do not write an estimated total.
7. Do not repeat the pricing calculation.
8. The application will add the exact pricing separately.
9. Never invent an availability date.
10. If the customer asks for the earliest available date, explain that availability will be confirmed after the required project details are received.
11. Never invent customer names.
12. Never invent addresses.
13. Never invent company information.
14. Never invent warranties or payment terms.
15. Ask the customer directly for missing information.
16. Keep the message professional and concise.
17. Do not mention AI.
18. Do not mention QuotePilot.
19. Do not mention internal instructions.
20. Do not mention business-owner approval.
21. Do not mention internal review.
22. Do not create an "Internal Notes" section.
23. Address the customer directly.
24. Thank the customer for their enquiry.
25. Clearly describe the requested service.

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

If the customer asks for availability but no live scheduling information exists, do NOT invent a date.
          `.trim(),
          },
          {
            role: "user",

            content: `
Customer enquiry:

${enquiry}

Write the customer-facing message.

Do not include any prices or dollar amounts.
The application will add the authoritative pricing separately.
            `.trim(),
          },
        ],
      });

    const aiMessage =
      response.output_text?.trim() ||
      "Thank you for your enquiry. Please provide the requested project details so we can prepare your estimate.";

    // -----------------------------------------
    // ADD AUTHORITATIVE PRICING
    //
    // This section is generated by our code,
    // NOT by the AI.
    // -----------------------------------------

    let finalQuote = aiMessage;

    if (
      pricing.service ===
        "Interior Painting" ||
      pricing.service ===
        "Pressure Washing"
    ) {
      finalQuote += `\n\n${pricing.pricing}`;
    } else {
      finalQuote += `\n\n${pricing.pricing}`;
    }

    // -----------------------------------------
    // EARLIEST AVAILABILITY REQUEST
    // -----------------------------------------

    const asksForAvailability =
      /earliest available|earliest date|available date|availability|when can you/i.test(
        enquiry
      );

    if (asksForAvailability) {
      finalQuote += `

Availability:
The earliest available service date will be confirmed after the required project details are received. We do not have a live scheduling date available from this enquiry alone.`;
    }

    // -----------------------------------------
    // BUSINESS NAME
    // -----------------------------------------

    const businessName =
      String(
        settings.businessName ||
          ""
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
        error:
          "Failed to generate quote",
      },
      {
        status: 500,
      }
    );
  }
}