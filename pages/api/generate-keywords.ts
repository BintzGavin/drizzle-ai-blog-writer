import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.CEREBRAS_API_KEY,
  baseURL: "https://api.cerebras.ai/v1",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { topic, trendingStories } = req.body;

  if (!topic || !trendingStories) {
    return res
      .status(400)
      .json({ message: "Topic and trending stories are required" });
  }

  try {
    const keywords = await generateKeywords(topic, trendingStories);
    res.status(200).json({ keywords });
  } catch (error) {
    console.error("Error generating keywords:", error);
    res.status(500).json({ message: "Error generating keywords" });
  }
}

async function generateKeywords(
  topic: string,
  trendingStories: { title: string; url: string }[]
): Promise<string[]> {
  const prompt = `Given the topic "${topic}" and the following trending stories:

${trendingStories
  .map((story, index) => `${index + 1}. ${story.title}`)
  .join("\n")}

Generate a list of 30 relevant titles that would be good for writing blog posts about this topic, some that consider the current trending stories and most that are best in general like listicles, how to's, etc.  The response should only contain the titles with one title per line. `;

  const completion = await openai.chat.completions.create({
    model: "llama3.1-8b",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 1000,
  });

  const content = completion.choices[0].message?.content;
  return content
    ? content
        .split("\n")
        .map((keyword) => keyword.replace(/^\d+\.\s*/, "").trim())
        .filter((keyword) => keyword.length > 0)
    : [];
}
