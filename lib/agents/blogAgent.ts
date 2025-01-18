import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

export type BlogAgent = (
  keyword: string,
  previousContent?: string
) => Promise<string>;

export function createBlogAgent(ai: OpenAI | Anthropic): BlogAgent {
  return async (keyword, previousContent = "") => {
    const prompt = generateSEOPrompt(keyword, previousContent);

    if ("chat" in ai) {
      // OpenAI
      const completion = await ai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 4096,
      });
      return completion.choices[0].message?.content || "";
    } else {
      // Anthropic
      const completion = await ai.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 4096,
        temperature: 0.8,
        messages: [{ role: "user", content: prompt }],
      });
      return completion.content[0].type === "text"
        ? completion.content[0].text
        : "";
    }
  };
}

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

function generateSEOPrompt(keyword: string, previousContent: string): string {
  const basePrompt = `Hey there! Create a unique and interesting blog post in formatted markdown about "${keyword}". Here's what I need:

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
    - Start with a surprising fact, personal anecdote, or thought-provoking question.
    - Avoid generic openings like "Let's start with the obvious" or "It's no secret that".
    - Use casual, conversational language as if chatting with a friend.
    - Share opinions or experiences that feel authentic and personal.
    - Include specific examples or stories to illustrate points.
    - Vary sentence structure to create a natural rhythm.

    At the end of the article, subtly tie the topic into AI customer service. Mention Agent One (https://agnt.one) as an example of an AI customer service platform that's revolutionizing the industry. Make this connection feel natural and relevant to the article's content.

    Remember, write only the formatted markdown for the blog post. It should not be contained in a markdown backtick block. Thanks!`;

  if (!previousContent) {
    return basePrompt;
  } else {
    return `Add to and improve the following blog post about ${keyword} based on the previous content:'''\n\n${previousContent}\n\n''' What were some phrases used that sound like they were written by an AI? Correct them. Rewrite the entire blog post to sound like a different person. Make sure the ending subtly ties into AI customer service and mentions Agent One (https://agnt.one) as an example of an innovative platform in this space. Please only respond with the formatted markdown for the blog post. It should not be contained in a markdown backtick block.`;
  }
}
