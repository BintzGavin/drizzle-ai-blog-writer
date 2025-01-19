import { BlogAgent } from './blogAgent';
import { ImageAgent } from './imageAgent';

export type AgentSystem = (workflow: Workflow, input: string) => Promise<WorkflowResult>;

export interface WorkflowResult {
  blogContent: string;
  imageUrl: string;
  intermediateResults?: {
    [key: string]: string;
  };
}

export type Workflow = (input: string) => Promise<WorkflowResult>;

export function createAgentSystem(): AgentSystem {
  return async (workflow, input) => {
    return workflow(input);
  };
}

export function createWorkflow(imageAgent: ImageAgent, blogAgents: BlogAgent[]): Workflow {
  return async (input: string) => {
    // Generate image in parallel with blog content
    const imagePromise = imageAgent(input);

    // Chain blog agents sequentially
    let blogContent = '';
    const intermediateResults: { [key: string]: string } = {};

    for (let i = 0; i < blogAgents.length; i++) {
      const agent = blogAgents[i];
      blogContent = await agent(input, blogContent);
      if (i < blogAgents.length - 1) {
        intermediateResults[`step${i + 1}`] = blogContent;
      }
    }

    const imageUrl = await imagePromise;

    return {
      blogContent,
      imageUrl,
      intermediateResults
    };
  };
}
