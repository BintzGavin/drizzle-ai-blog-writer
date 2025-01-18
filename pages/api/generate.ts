import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import type { NextApiRequest, NextApiResponse } from "next";
import { marked } from "marked"; // Import the marked library
import { createAgentSystem } from "../../lib/agents/agentSystem";
import { createDalleImageAgent } from "../../lib/agents/imageAgent";
import {
  createBlogAgent,
  createCerebrasBlogAgent,
} from "../../lib/agents/blogAgent";
import { createWorkflow } from "../../lib/agents/workflow";
import fs from "fs";
import path from "path";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const cerebrasOpenAI = new OpenAI({
  apiKey: process.env.CEREBRAS_API_KEY,
  baseURL: "https://api.cerebras.ai/v1",
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

let requestCounts: { [key: string]: number } = {};

async function runWorkflow(keyword: string): Promise<{
  postContentHtml: string;
  imageUrl: string;
  blogContent: string;
} | null> {
  const trimmedKeyword = keyword.trim();
  try {
    const imageAgent = createDalleImageAgent(openai);
    const blogAgents = [createCerebrasBlogAgent(cerebrasOpenAI)];

    const agentSystem = createAgentSystem();
    const workflow = createWorkflow(imageAgent, blogAgents);

    const result = await agentSystem(workflow, trimmedKeyword);
    const postContentHtml = await marked(result.blogContent, { gfm: true });
    console.log(postContentHtml);
    return {
      postContentHtml,
      imageUrl: result.imageUrl,
      blogContent: result.blogContent,
    };
  } catch (error) {
    console.error(
      `Error generating content for keyword ${trimmedKeyword}:`,
      error
    );
  }
  return null;
}

function saveLocalCopy(
  keyword: string,
  blogContent: string,
  imageUrl: string,
  flatImageDirectory: boolean = false
) {
  if (process.env.NODE_ENV === "production") return;

  const sanitizedKeyword = keyword.toLowerCase().replace(/\s+/g, "-");
  const blogDir = path.join(process.cwd(), "blogs");
  const markdownDir = path.join(blogDir, "markdown");
  const imagesDir = path.join(blogDir, "images");

  // Create directories if they don't exist
  fs.mkdirSync(blogDir, { recursive: true });
  fs.mkdirSync(markdownDir, { recursive: true });
  fs.mkdirSync(imagesDir, { recursive: true });

  // Create markdown content with title and date
  const markdownContent = `---
title: "${keyword}"
date: '${new Date().toLocaleDateString()}'
---

${blogContent}`;

  // Save markdown file
  const markdownPath = path.join(markdownDir, `${sanitizedKeyword}.md`);
  fs.writeFileSync(markdownPath, markdownContent);

  // Save image
  fetch(imageUrl)
    .then((res) => res.arrayBuffer())
    .then((buffer) => {
      let imagePath;
      if (flatImageDirectory) {
        // Save image directly in images directory with sanitizedKeyword.png
        imagePath = path.join(imagesDir, `${sanitizedKeyword}.png`);
      } else {
        // Current behavior: Save image in images/sanitizedKeyword/pic1.png
        const imageSubDir = path.join(imagesDir, sanitizedKeyword);
        fs.mkdirSync(imageSubDir, { recursive: true });
        imagePath = path.join(imageSubDir, "pic1.png");
      }
      fs.writeFileSync(imagePath, Buffer.from(buffer));
    })
    .catch((error) => console.error("Error saving image:", error));
}

export default async function (
  req: NextApiRequest,
  res: NextApiResponse<
    | { results: ({ postContentHtml: string; imageUrl: string } | null)[] }
    | { error: string }
  >
) {
  const userIp = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  if (
    requestCounts[userIp as string] &&
    requestCounts[userIp as string] >= 50
  ) {
    // ares.status(429).json({ error: 'Too many requests from this IP address' });
    console.error("Too many requests from this IP address");
    return;
  }

  for (const keyword of req.body.keywords) {
    if (checkForInappropriateRequests(keyword)) {
      res.status(400).json({ error: "Bad request" });
      console.error("Bad request");
      return;
    }
  }
  // res.status(200).json({ result: ['You will receive an email when your blogs have finished generating. Usually takes only a minute or two.'] });

  try {
    // Update this part to use the new function
    const email = req.body.email;
    const model = req.body.model === "gpt-4o" ? "gpt-4o" : "claude-3.5-sonnet";
    console.log(model);
    const promises = req.body.keywords.map((keyword: string) =>
      runWorkflow(keyword)
    );
    const results = await Promise.all(promises);

    // Save local copies if not in production
    if (process.env.NODE_ENV !== "production") {
      const flatImageDirectory = true;
      results.forEach((result, index) => {
        if (result) {
          saveLocalCopy(
            req.body.keywords[index],
            result.blogContent,
            result.imageUrl,
            flatImageDirectory
          );
        }
      });
    }

    requestCounts[userIp as string] =
      (requestCounts[userIp as string] || 0) + 1;

    // Modify this line to match the expected response type
    res.status(200).json({
      results: results.map((result) =>
        result
          ? {
              postContentHtml: result.postContentHtml,
              imageUrl: result.imageUrl,
            }
          : null
      ),
    });
  } catch (error: any) {
    if (error.response) {
      res.status(501).json(error.response.data);
      console.error(error.response.data);
    } else {
      res.status(501).json(error.message);
      console.error(error.message);
    }
  }

  return;
}

function checkForInappropriateRequests(prompt: string) {
  // Define a list of words or phrases that should not be included in the prompt
  const bannedWords = [
    "hate",
    "violence",
    "pornography",
    "gore",
    "torture",
    "racism",
    "sexism",
    "homophobia",
    "transphobia",
    "bigotry",
    "nazism",
    "fascism",
    "white supremacy",
    "hate speech",
    "discrimination",
    "harassment",
    "cyberbullying",
    "doxing",
    "threats",
    "stalking",
    "intimidation",
    "bullying",
    "abuse",
    "assault",
    "murder",
    "rape",
    "sexual assault",
    "domestic violence",
    "child abuse",
    "animal abuse",
    "terrorist attacks",
    "war crimes",
    "genocide",
    "torture porn",
    "snuff films",
    "child pornography",
    "bestiality",
    "incest",
    "pedophilia",
    "nonconsensual",
    "illegal",
    "inappropriate",
    "prostitution",
    "slavery",
    "human trafficking",
    "drugs",
    "narcotics",
    "illicit substances",
    "illegal activity",
    "weapon",
    "firearm",
    "explosive",
    "toxic",
    "poison",
    "vandalism",
    "theft",
    "fraud",
    "embezzlement",
    "bribery",
    "corruption",
    "money laundering",
    "racketeering",
    "counterfeit",
    "forgery",
    "hacking",
    "phishing",
    "spam",
    "scam",
    "malware",
    "ransomware",
    "virus",
    "spyware",
    "adware",
    "worms",
    "trojans",
    "backdoor",
    "rootkit",
    "drive-by download",
    "skimmer",
    "keylogger",
    "DoS attack",
    "DDoS attack",
    "SQL injection",
    "cross-site scripting",
    "identity theft",
    "impersonation",
    "personal information",
    "credit card",
    "bank account",
    "social security",
    "driver's license",
    "passport",
    "IP address",
    "mac address",
  ];

  // Convert the prompt to lowercase to make it case-insensitive
  const lowercasePrompt = prompt.toLowerCase();

  // Check if any of the banned words are present in the prompt
  for (const word of bannedWords) {
    if (lowercasePrompt.includes(word)) {
      return true;
    }
  }

  // If none of the banned words were found, return false
  return false;
}

export const config = {
  type: "experimental-background",
};
