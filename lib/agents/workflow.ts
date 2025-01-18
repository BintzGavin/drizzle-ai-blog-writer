import { ImageAgent } from './imageAgent';
import { BlogAgent } from './blogAgent';
import { Workflow, WorkflowResult } from './agentSystem';
import { marked } from 'marked';

export function createWorkflow(imageAgent: ImageAgent, blogAgents: BlogAgent[]): Workflow {
  return async (keyword) => {
    const imageUrlPromise = imageAgent(keyword);
    
    const blogContentPromise = (async () => {
      let blogContent = '';
      for (const blogAgent of blogAgents) {
        blogContent = await blogAgent(keyword, blogContent);
        console.log(blogContent);
      }
      return blogContent;
    })();

    const [imageUrl, blogContent] = await Promise.all([imageUrlPromise, blogContentPromise]);
    console.log(imageUrl);
    return { blogContent, imageUrl };
  };
}