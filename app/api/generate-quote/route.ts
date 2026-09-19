import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "build-placeholder",
});

export async function POST(req: Request) {
  try {
    const { enquiry } = await req.json();

    if (!enquiry) {
      return NextResponse.json(
        { error: "Enquiry is required" },
        { status: 400 }
      );
    }

    const response = await openai.responses.create({
      model: "gpt-5-mini",
      input: [
        {
          role: "system",
          content:
            "You are QuotePilot, an AI quote assistant for small businesses. Extract the customer's requirements and create a clear professional quote draft. Do not invent prices when pricing information is not provided. Clearly mark missing information.",
        },
        {
          role: "user",
          content: `Customer enquiry:\n${enquiry}`,
        },
      ],
    });

    return NextResponse.json({
      success: true,
      quote: response.output_text,
    });
  } catch (error) {
    console.error("Quote generation error:", error);

    return NextResponse.json(
      { error: "Failed to generate quote" },
      { status: 500 }
    );
  }
}