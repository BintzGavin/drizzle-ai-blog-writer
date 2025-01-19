import type { NextApiRequest, NextApiResponse } from "next";
import Replicate from "replicate";
import {
  createDalleImageAgent,
  createFluxImageAgent,
} from "../../lib/agents/imageAgent";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
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
    const imageAgent = createFluxImageAgent(replicate);
    const imageUrl = await imageAgent(keyword);
    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error(`Error generating image for keyword ${keyword}:`, error);
    res.status(500).json({ error: "Failed to generate image" });
  }
}
