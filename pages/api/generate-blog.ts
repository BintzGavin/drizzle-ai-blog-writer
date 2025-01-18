import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import { marked } from "marked";
import { createCerebrasBlogAgent } from "../../lib/agents/blogAgent";

const cerebrasOpenAI = new OpenAI({
  apiKey: process.env.CEREBRAS_API_KEY,
  baseURL: "https://api.cerebras.ai/v1",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { keyword } = req.body;

  if (!keyword) {
    return res.status(400).json({ error: "Keyword is required" });
  }

  try {
    const blogAgent = createCerebrasBlogAgent(cerebrasOpenAI);
    const blogContent = await blogAgent(keyword);
    const postContentHtml = await marked(blogContent);
    res.status(200).json({ blogContent, postContentHtml });
  } catch (error) {
    console.error(
      `Error generating blog content for keyword ${keyword}:`,
      error
    );
    res.status(500).json({ error: "Failed to generate blog content" });
  }
}
