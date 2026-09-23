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

type KnownDetails = {
  squareFootage: boolean;
  rooms: boolean;
  wallsOnly: boolean;
  ceilingsOrTrim: boolean;
  paintProvided: boolean;
  coats: boolean;
  finish: boolean;
  address: boolean;
  stories: boolean;
  houseSize: boolean;
  drivewaySize: boolean;
  surfaceType: boolean;
  stains: boolean;
  access: boolean;
  preferredTiming: boolean;
  wallCondition: boolean;
};

function detectKnownDetails(
  enquiry: string
): KnownDetails {
  const text = enquiry.toLowerCase();

  const squareFootage =
    /\b\d[\d,]*\s*(sq\s*ft|sqft|square\s*feet)\b/i.test(
      text
    );

  const rooms =
    /\b(bedroom|bedrooms|living room|living rooms|kitchen|bathroom|bathrooms|hallway|hallways|closet|closets|room|rooms)\b/i.test(
      text
    );

  const wallsOnly =
    /\b(walls?\s*only|only\s*walls)\b/i.test(
      text
    );

  const ceilingsOrTrim =
    /\b(ceiling|ceilings|trim|door|doors|closet)\b/i.test(
      text
    );

  const paintProvided =
    /\b(i('|’)m|i am|we are|customer|client)\s+(supplying|providing)\s+(the\s+)?paint\b|\bpaint\s+(provided|supplied)\b|\bwe('|’)ll\s+provide\s+the\s+paint\b/i.test(
      text
    );

  const coats =
    /\b(one|two|three|1|2|3)\s+coats?\b|\bsingle\s+coat\b|\bdouble\s+coat\b/i.test(
      text
    );

  const finish =
    /\b(matte|flat|eggshell|satin|semi[-\s]?gloss|gloss)\b/i.test(
      text
    );

  const address =
    /\b\d{1,6}\s+[a-z0-9.'-]+\s+(street|st|road|rd|avenue|ave|drive|dr|lane|ln|court|ct|boulevard|blvd|way|circle|cir|parkway|pkwy)\b/i.test(
      text
    ) ||
    /\b(address|service address|property address)\s*:/i.test(
      text
    );

  const stories =
    /\b(single[-\s]?story|two[-\s]?story|three[-\s]?story|one[-\s]?story|1[-\s]?story|2[-\s]?story|3[-\s]?story|one story|two story|three story)\b/i.test(
      text
    );

  const houseSize =
    /\b\d[\d,]*\s*(sq\s*ft|sqft|square\s*feet)\b/i.test(
      text
    );

  const drivewaySize =
    /\b(single[-\s]?car|double[-\s]?car|two[-\s]?car|one[-\s]?car)\b.*\bdriveway\b|\bdriveway\b.*\b(single[-\s]?car|double[-\s]?car|two[-\s]?car|one[-\s]?car)\b|\bdriveway\b.*\b\d+\s*(ft|feet|x|by)\b/i.test(
      text
    );

  const surfaceType =
    /\b(concrete|asphalt|pavers?|brick|vinyl|stucco|wood|painted wood|siding)\b/i.test(
      text
    );

  const stains =
    /\b(oil|grease|rust|paint|mold|mildew|stain|stains|heavy stain|heavy stains)\b/i.test(
      text
    );

  const access =
    /\b(parking|parked|vehicle|vehicles|gate|gates|access|hose|water supply|water source|locked|obstruction|obstructions)\b/i.test(
      text
    );

  const preferredTiming =
    /\b(as soon as possible|earliest|available date|availability|preferred date|preferred dates|preferred time|preferred times|this week|next week|monday|tuesday|wednesday|thursday|friday|saturday|sunday|morning|afternoon|evening)\b/i.test(
      text
    );

  const wallCondition =
    /\b(hole|holes|crack|cracks|water damage|peeling|peel|wallpaper|repair|repairs|patch|patching|damaged|damage|mold|mildew)\b/i.test(
      text
    );

  return {
    squareFootage,
    rooms,
    wallsOnly,
    ceilingsOrTrim,
    paintProvided,
    coats,
    finish,
    address,
    stories,
    houseSize,
    drivewaySize,
    surfaceType,
    stains,
    access,
    preferredTiming,
    wallCondition,
  };
}

function buildKnownDetailsText(
  details: KnownDetails,
  enquiry: string
): string {
  const known: string[] = [];

  if (details.squareFootage) {
    known.push(
      "The customer already provided a square-foot measurement."
    );
  }

  if (details.rooms) {
    known.push(
      "The customer already provided room/space information."
    );
  }

  if (details.wallsOnly) {
    known.push(
      "The customer already specified that walls only are being painted."
    );
  }

  if (details.ceilingsOrTrim) {
    known.push(
      "The customer already mentioned ceilings, trim, doors, or closets."
    );
  }

  if (details.paintProvided) {
    known.push(
      "The customer already specified who is providing the paint."
    );
  }

  if (details.coats) {
    known.push(
      "The customer already specified the number of coats."
    );
  }

  if (details.finish) {
    known.push(
      "The customer already specified the paint finish."
    );
  }

  if (details.address) {
    known.push(
      "The customer already provided the property/service address."
    );
  }

  if (details.stories) {
    known.push(
      "The customer already provided the number of stories."
    );
  }

  if (details.houseSize) {
    known.push(
      "The customer already provided house size information."
    );
  }

  if (details.drivewaySize) {
    known.push(
      "The customer already provided driveway size information."
    );
  }

  if (details.surfaceType) {
    known.push(
      "The customer already provided the relevant surface type."
    );
  }

  if (details.stains) {
    known.push(
      "The customer already provided information about stains or difficult areas."
    );
  }

  if (details.access) {
    known.push(
      "The customer already provided access/parking/water-supply information."
    );
  }

  if (details.preferredTiming) {
    known.push(
      "The customer already provided timing/availability information or asked for earliest availability."
    );
  }

  if (details.wallCondition) {
    known.push(
      "The customer already provided wall condition/repair information."
    );
  }

  if (known.length === 0) {
    return "No specific project details have been confidently extracted yet.";
  }

  return known.join("\n");
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

    const drivewayEstimate =
      hasDriveway
        ? Number(drivewayRate)
        : 0;

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
    // DETECT WHAT CUSTOMER ALREADY PROVIDED
    // -----------------------------------------

    const knownDetails =
      detectKnownDetails(enquiry);

    const knownDetailsText =
      buildKnownDetailsText(
        knownDetails,
        enquiry
      );

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
You are QuotePilot, an AI quote assistant for small service businesses.

Your job is to write a professional customer-facing response based ONLY on the customer's enquiry.

CORE RULE:

Do NOT ask the customer for information that they already provided.

The customer's original enquiry is the source of truth.

The application has already analyzed the enquiry and identified information that appears to be known.

KNOWN / ALREADY PROVIDED INFORMATION:

${knownDetailsText}

You must respect this information.

IMPORTANT RULES:

1. Write ONLY the customer-facing message.
2. Do not invent prices.
3. Do not calculate prices.
4. Do not modify prices.
5. Do not write any dollar amounts.
6. Do not write the estimated total.
7. The application will add authoritative pricing separately.
8. Do not repeat questions for information already provided.
9. Ask ONLY for genuinely missing information needed for a firm quote.
10. Never invent an availability date.
11. Never invent a customer name.
12. Never invent an address.
13. Never invent company information.
14. Never invent warranties or payment terms.
15. Keep the message concise and professional.
16. Do not mention AI.
17. Do not mention QuotePilot.
18. Do not mention internal instructions.
19. Do not mention internal review.
20. Do not create an "Internal Notes" section.
21. Thank the customer for the enquiry.
22. Clearly describe the requested service.
23. Preserve customer-provided project details in your response.
24. If the customer asks for earliest availability and no live scheduling system is available, say that availability will be confirmed after the remaining required details are received.
25. Do not ask for preferred dates if the customer already asked for the earliest available date unless a date range is genuinely needed.
26. Avoid unnecessary questionnaires.
27. Ask for a short list of only the missing items.

INTERIOR PAINTING:

Potential information that may be needed:

- Property address
- Rooms to be painted
- Total square footage
- Walls only or walls + ceilings + trim
- Paint supplied by customer or business
- Number of coats
- Paint finish
- Wall condition
- Repairs or preparation
- Furniture/access requirements
- Preferred timing

Only ask for items that are genuinely missing.

PRESSURE WASHING:

Potential information that may be needed:

- Property address
- Number of stories
- Approximate house size
- Driveway size
- Surface type
- Heavy stains
- Access/parking/water-supply issues
- Preferred service timing

Only ask for items that are genuinely missing.

IMPORTANT:

If the customer already provided a detail, DO NOT ask them to confirm it again.

For example:

Customer:
"1,500 sq ft, walls only, two coats, white eggshell."

Do NOT ask:

"Please confirm the square footage."
"Do you want walls only?"
"How many coats?"
"What finish?"

Instead ask only for genuinely missing information such as address, rooms, wall condition, access, or timing.

If the customer has provided enough information for an estimate, do not delay the estimate by requesting unnecessary information.

If the customer asks for availability but no live calendar is connected, never invent a date.
            `.trim(),
          },

          {
            role: "user",

            content: `
CUSTOMER ENQUIRY:

${enquiry}

KNOWN INFORMATION DETECTED BY THE APPLICATION:

${knownDetailsText}

Write the customer-facing response now.

Remember:
- Do not include prices.
- Do not include dollar amounts.
- Do not repeat information the customer already provided.
- Ask only for genuinely missing details.
            `.trim(),
          },
        ],
      });

    const aiMessage =
      response.output_text?.trim() ||
      "Thank you for your enquiry. Please provide the remaining project details so we can prepare your estimate.";

    // -----------------------------------------
    // ADD AUTHORITATIVE PRICING
    // -----------------------------------------

    let finalQuote =
      aiMessage;

    finalQuote +=
      `\n\n${pricing.pricing}`;

    // -----------------------------------------
    // AVAILABILITY REQUEST
    // -----------------------------------------

    const asksForAvailability =
      /earliest available|earliest date|available date|availability|when can you/i.test(
        enquiry
      );

    if (asksForAvailability) {
      finalQuote += `

Availability:
The earliest available service date will be confirmed after the remaining required project details are received. We do not have a live scheduling calendar connected to this enquiry yet.`;
    }

    // -----------------------------------------
    // BUSINESS NAME
    // -----------------------------------------

    const businessName =
      String(
        settings.businessName || ""
      ).trim();

    if (businessName) {
      finalQuote +=
        `\n\n${businessName}`;
    }

    return NextResponse.json({
      success: true,
      quote: finalQuote,
      pricing,
      knownDetails,
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