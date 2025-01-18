type AgentSystem = (workflow: Workflow, input: string) => Promise<WorkflowResult>;

export function createAgentSystem(): AgentSystem {
  return async (workflow, input) => {
    return workflow(input);
  };
}

export type WorkflowResult = {
  blogContent: string;
  imageUrl: string;
};

export type Workflow = (input: string) => Promise<WorkflowResult>;
