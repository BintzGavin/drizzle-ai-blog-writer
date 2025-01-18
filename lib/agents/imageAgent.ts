import OpenAI from "openai";
import Replicate from "replicate";
export type ImageAgent = (keyword: string) => Promise<string>;

export function createDalleImageAgent(openai: OpenAI): ImageAgent {
  // return async(keyword) => {
  //     return 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-kMztL4rripDifkDDbZ9xwrqX/user-6RqaFLi6oywzeJS6x2a7eIma/img-RhNHr9pMuqBKxqZDKutcR5wz.png?st=2024-07-28T19%3A46%3A47Z&se=2024-07-28T21%3A46%3A47Z&sp=r&sv=2023-11-03&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2024-07-27T23%3A45%3A44Z&ske=2024-07-28T23%3A45%3A44Z&sks=b&skv=2023-11-03&sig=g6m4mOggIhvQM9cTF6Urb2gDPr1O/1Hu4YuHfwvKAXw%3D'
  // }
  return async (keyword) => {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Create a soft pastel stock style photo for a blog post about ${keyword}.`,
      n: 1,
      size: "1792x1024",
    });
    return response.data[0].url ?? "";
  };
}

export function createFluxImageAgent(replicate: Replicate): ImageAgent {
  return async (keyword) => {
    const prompt = `DSC_89741.jpeg A stock style photo for a blog post about "${keyword}".  Minimalist with a soft and cool tone (blues and purples)`;
    const response = await replicate.run("black-forest-labs/flux-1.1-pro", {
      input: { prompt, prompt_upsampling: true, aspect_ratio: "16:9" },
    });
    return response as unknown as string;
  };
}
