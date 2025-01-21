<h1 align="center">
  <img src="public/randomlogo.png" alt="Alt Text" width="75" height="75" > <br />
  drizzle ai
</h1>

# 🚀 Next.js Blog Post Generator with Agentic Workflow

[Demo Site](https://thedrizzleai.com)

## 🌟 Project Overview

This project uses a functional approach to create an agentic workflow for generating blog posts and images. The term "agentic" here simply means that the system can chain multiple AI models together, with each model building upon and improving the output of the previous one. This allows for iterative refinement of the content quality. 🤖💡


Key features:
- 🖼️ Image generation using Flux (via [Replicate](https://replicate.com/))
- ✍️ Blog content creation combining multiple AI models (llama-3.3-70b via [Cerebras AI](https://cloud.cerebras.ai/), GPT-4o and Claude 3.5 Sonnet)
- 🔄 Iterative content improvement through response chaining
- 🧩 Functional programming approach for flexibility and testability
- 📈 Trending stories integration via [News API](https://newsapi.org/)
- 🔑 Keyword suggestion and selection
- 📧 Email delivery of generated content
- 🔒 Rate limiting for API protection
- 💾 Local file caching for development
- 🎨 Responsive design with Tailwind CSS

## 🏗️ Project Structure

The project uses a modular structure with separate functions for image generation, blog content creation, and workflow management. This allows for easy modification and extension of the system. 🛠️

- 📁 `pages/`
  - `api/`: API routes for server-side functionality
    - `generate.ts`: Main API handler for content generation
    - `trending-stories.ts`: Fetches trending stories
    - `generate-blog.ts`: Handles blog content generation
    - `generate-image.ts`: Handles image generation
    - `save-local-copy.ts`: Saves generated content locally in dev mode
  - `index.tsx`: Main page component
- 📁 `lib/agents/`
  - `agentSystem.ts`: Defines the agent system and workflow interfaces
  - `imageAgent.ts`: Handles image generation using Flux via Replicate
  - `blogAgent.ts`: Manages blog content creation and improvement
  - `workflow.ts`: Orchestrates the workflow between agents
- 📁 `styles/`
  - `globals.css`: Global styles and Tailwind CSS configuration
- 📁 `layout/`
  - `layout.tsx`: Main layout component with meta tags and analytics

## 🔍 How It Works

1. User enters a topic on the main page 📝
2. System fetches trending stories related to the topic using News API 📰
3. Potential blog titles are generated based on the topic and trending stories 🔑
4. User can select up to 5 titles and add custom keywords of their own ✅
5. The agentic workflow generates blog content and images for each 🤖
6. User can view generated content, expand/collapse articles, and send to email 📨

### Agentic Workflow

One sample agentic workflow operates is as follows:
1. Llama 3.3 creates the initial blog draft
2. GPT-4 refines and improves that draft
3. Claude 3.5 Sonnet makes final improvements
4. Flux generates an image for the blog post (in parallel)

Here's how you would implement this chaining using the agent system:

```typescript
// pages/api/generate-blog.ts
try {
  // Initialize the agents
  const imageAgent = createDalleImageAgent(openai);
  const blogAgents = [
    createCerebrasBlogAgent(cerebrasOpenAI),
    createOpenAIBlogAgent(openai),
    createAnthropicBlogAgent(anthropic)
  ];

  // Create the agent system and workflow
  const agentSystem = createAgentSystem();
  const workflow = createWorkflow(imageAgent, blogAgents);

  // Run the workflow - this will:
  // 1. Start image generation in parallel
  // 2. Chain the blog agents sequentially
  // 3. Track intermediate results
  const result = await agentSystem(workflow, keyword);
  
  const postContentHtml = await marked(result.blogContent);
  
  res.status(200).json({ 
    blogContent: result.blogContent,
    postContentHtml,
    imageUrl: result.imageUrl,
    // Access intermediate results if needed
    intermediateResults: result.intermediateResults
  });
} catch (error) {
  // Error handling
}
```

Currently, the system uses Llama 3.3 only via Cerebras for content generation, in order for the fastest possible inference times (~2100 tokens/s), but feel free to use the full chaining workflow in your own project by adding more agents to the `blogAgents` array.

## Environment Variables

This project requires the following environment variables:

- `OPENAI_API_KEY`: Your OpenAI API key
- `ANTHROPIC_API_KEY`: Your Anthropic API key
- `SENDGRID_API_KEY`: Your SendGrid API key for email functionality
- `SENDGRID_FROM_EMAIL`: Your email address that will be used to send emails via SendGrid
- `NEWS_API_KEY`: Your News API key for fetching trending stories
- `CEREBRAS_API_KEY`: Your Cerebras API key - You'll need to contact them via the [form on their website](https://cerebras.ai/contact-us/) to get access but they responded pretty quickly
- `REPLICATE_API_TOKEN`: Your Replicate API token used for the Flux image model

Make sure to set these in your `.env.local` file or in your deployment environment.

## 🚀 Getting Started

1. Clone the repository 📥
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Set up environment variables (see above) 🔐
4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. 🌐

## 🛠️ Technologies Used

- Next.js 🔧
- React ⚛️
- TypeScript 📘
- OpenAI API (GPT-4o) 🧠
- Anthropic API (Claude 3.5 Sonnet) 🤖
- Cerebras API (Llama 3.1) ⚡
- Flux (via Replicate) for image generation 🖼️
- SendGrid for email functionality 📧
- News API for trending stories 📰
- Tailwind CSS for responsive styling 🎨

## 🔧 Customization

You can easily extend the system by:
- Adding new types of agents in the `lib/agents` directory 🧩
- Modifying the workflow logic in `lib/agents/workflow.ts` 🔄
- Integrating additional AI models or services 🤖
- Customizing the UI components and styles 🎨

## 🚀 Deployment

Deploy your Next.js app using the [Vercel Platform](https://vercel.com/new?utm_medium=next-blog-agent-starter). 🌐

Check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details. 📚

## 🐛 Troubleshooting

Common issues and their solutions:

1. API rate limiting: If you encounter rate limiting errors, try increasing the delay between requests or implementing a queue system.
2. Image generation fails: Ensure your Replicate API key has sufficient credits and the prompt is not violating content policies.
3. Email delivery issues: Check your SendGrid API key and ensure your sender email is verified.

## 🧪 Testing

Currently, this project does not have automated tests. Adding unit tests and integration tests is a planned future improvement.

## 📚 Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs) 📘
- [OpenAI API](https://beta.openai.com/docs/) 🤖
- [Anthropic API](https://www.anthropic.com/product) 🧠
- [Cerebras API](https://inference-docs.cerebras.ai/introduction) ⚡
- [SendGrid Documentation](https://sendgrid.com/docs/) 📧
- [News API Documentation](https://newsapi.org/docs) 📰
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) 🎨

## 👨‍💻 Author

Gavin Bintz ([@bintz_gavin](https://x.com/bintz_gavin) - [gavinbintz.dev](https://gavinbintz.dev))

## 📜 License

This project is licensed under the MIT License. ⚖️
