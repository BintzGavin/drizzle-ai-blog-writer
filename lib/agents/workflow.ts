import { ImageAgent } from './imageAgent';
import { BlogAgent } from './blogAgent';
import { Workflow, WorkflowResult } from './agentSystem';
import { marked } from 'marked';

export function createWorkflow(imageAgent: ImageAgent, blogAgents: BlogAgent[]): Workflow {
  return async (keyword) => {
    const imageUrlPromise = imageAgent(keyword);
    
    const blogContentPromise = (async () => {
      let blogContent = '';
      const intermediateResults: { [key: string]: string } = {};

      for (let i = 0; i < blogAgents.length; i++) {
        const agent = blogAgents[i];
        blogContent = await agent(keyword, blogContent);
        if (i < blogAgents.length - 1) {
          intermediateResults[`step${i + 1}`] = blogContent;
        }
      }
      return { blogContent, intermediateResults };
    })();

    const [imageUrl, { blogContent, intermediateResults }] = await Promise.all([
      imageUrlPromise, 
      blogContentPromise
    ]);

    return { 
      blogContent, 
      imageUrl,
      intermediateResults 
    };
  };
}