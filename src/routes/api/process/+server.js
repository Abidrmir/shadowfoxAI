import { json } from "@sveltejs/kit";
import OpenAI from "openai";

export async function POST({ request, platform }) {
  try {
    // Get API key from platform.env (Cloudflare) or fallback
    const apiKey = platform?.env?.KIMI_API_KEY;
    
    if (!apiKey) {
      return json(
        { success: false, error: "API key not configured" },
        { status: 500 }
      );
    }

    const kimi = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://api.moonshot.ai/v1",
    });

    const { answers, image } = await request.json();
    console.log("✓ Received answers:", Object.keys(answers));

    const contentParts = [
      {
        type: "text",
        text: `I want to make a Beautiful website based on the answers to a form given to a user. Here are the form questions and answers:
1. Name of the business: ${answers[1] || "Not provided"}
2. Describes what the business does: ${answers[2] || "Not provided"}
3. What the vibe of the website should be like: ${answers[3] || "Not provided"}
4. What is the address of your establishment: ${answers[4] || "Not provided"}
5. What products are you selling: ${answers[5] || "Not provided"}
Based on this information, generate a complete, single-file HTML website. Include inline CSS and JavaScript. Make it beautiful and professional.${image ? " I have also attached an image — use it as the hero image or logo by embedding the base64 src directly in an <img> tag." : ""}`,
      },
    ];

    if (image) {
      contentParts.push({
        type: "image_url",
        image_url: { url: image },
      });
      console.log("✓ Image included in prompt");
    }

    const completion = await kimi.chat.completions.create({
      model: "kimi-k2.5",
      messages: [
        {
          role: "system",
          content:
            "You are a website builder that makes beautiful and functional websites. You only write code, nothing else. Do not say anything else or write anything besides just code. NOTHING ELSE. ONLY CODE. Make the websites very beautiful, but also unique and interesting. dont make generic websites that look like they were made by AI. Users should be wowed by the websites. Return a complete single HTML file with inline CSS and JavaScript. If an image is provided, embed it using its base64 data URI directly in the src attribute of an <img> tag.",
        },
        { role: "user", content: contentParts },
      ],
    });

    let result = completion.choices[0].message.content;
    result = result
      .replace(/```html\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    return json({ success: true, result });
  } catch (error) {
    console.error("Kimi API error:", error);
    return json(
      {
        success: false,
        error: `${error.name}: ${error.message}`,
      },
      { status: 500 },
    );
  }
}