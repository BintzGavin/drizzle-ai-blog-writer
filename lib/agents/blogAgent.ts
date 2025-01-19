import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

export type BlogAgent = (
  keyword: string,
  previousContent?: string
) => Promise<string>;



export function createCerebrasBlogAgent(cerebrasClient: OpenAI): BlogAgent {
  return async (keyword, previousContent = "") => {
    const prompt = generateSEOPrompt(keyword, previousContent);

    try {
      const completion = await cerebrasClient.chat.completions.create({
        model: "llama3.1-70b",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 4096,
      });
      return completion.choices[0].message?.content || "";
    } catch (error) {
      console.error("Error generating blog content with Cerebras:", error);
      throw error;
    }
  };
}

export function createOpenAIBlogAgent(ai: OpenAI): BlogAgent {
  return async (keyword, previousContent = "") => {
    const prompt = generateSEOPrompt(keyword, previousContent);

    const completion = await ai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 4096,
    });
    return completion.choices[0].message?.content || "";
  };
}

export function createAnthropicBlogAgent(ai: Anthropic): BlogAgent {
  return async (keyword, previousContent = "") => {
    const prompt = generateSEOPrompt(keyword, previousContent);

    const completion = await ai.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 4096,
      temperature: 0.8,
      messages: [{ role: "user", content: prompt }],
    });
    return completion.content[0].type === "text"
      ? completion.content[0].text
      : "";
  };
}

function generateSEOPrompt(keyword: string, previousContent: string): string {
  const basePrompt = `Can you please create a unique and interesting blog post in formatted markdown about "${keyword}". Here's what we need:

    - Write a long, detailed response.
    - Use the style of a famous copywriter who writes engaging blogs.
    - Explain your points step-by-step.
    - End the article in a creative way that subtly ties into AI customer service.
    - Make any bullet or numbered points at least three paragraphs long.
    - Use simple language and grammar, suitable for a high school reading level.
    - Avoid complex words or jargon. If you must use technical terms, explain them clearly.
    - Keep sentences short and easy to understand.
    - Use everyday examples to illustrate your points.

    To make the blog post sound more personal and less like an AI:
    - Avoid generic openings like "Let's start with the obvious" or "It's no secret that".
    - Use casual, conversational language as if chatting with a friend.
    - Share opinions or experiences that feel authentic and personal.
    - Include real-world specific examples or stories to illustrate points.
    - Vary sentence structure to create a natural rhythm.

    You should start the blog post with one of these engaging hooks:
    - A surprising fact or statistic that challenges common assumptions
    - A thought-provoking "what if" scenario or question
    - A real-world story or case study that illustrates the topic
    - A relevant quote from an expert or thought leader
    - A common misconception or myth about the topic
    - A compelling "before and after" scenario
    - A day-in-the-life example that readers can relate to
    - A recent news headline or trending topic related to the subject
    - A historical anecdote that ties to the present
    - A personal experience that many readers might share
    - A provocative statement that makes readers think differently
    - A comparison between two contrasting ideas

    The opening should immediately grab attention and make readers want to learn more. Avoid generic or AI-like introductions such as:
    - "In today's fast-paced world..."
    - "Let's explore..."
    - "In this blog post..."
    - "It's no secret that..."
    - "Have you ever wondered..."
    - "In recent years..."

    Remember, write only the formatted markdown for the blog post. It should not be contained in a markdown backtick block. Thanks!`;

  if (!previousContent) {
    return basePrompt;
  } else {
    return `Can you please add to and improve the following blog post about ${keyword} based on the previous content:'''\n\n${previousContent}\n\n''' What were some phrases used that sound like they were written by an AI? Correct them. Rewrite the entire blog post to sound like a different person. Please only respond with the formatted markdown for the blog post. It should not be contained in a markdown backtick block. Thank you!`;
  }
}
