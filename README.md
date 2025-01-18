# Drizzle.ai
# 🚀 Next.js SEO Blog Post Generator with Agentic Workflow

[Demo Site ✍️](https://thedrizzleai.com)

![Drizzle.ai Logo](public/randomlogo.png)

This is a [Next.js](https://nextjs.org/) project that generates SEO-optimized blog posts using an agentic workflow system. ✨

## 🌟 Project Overview

This project uses a functional approach to create an agentic workflow for generating blog posts and images. It leverages multiple AI models to iteratively improve content quality. 🤖💡

Key features:
- 🖼️ Image generation using DALL-E 3
- ✍️ Blog content creation using multiple AI agents (GPT-4 and Claude 3.5 Sonnet)
- 🔄 Iterative content improvement
- 🧩 Functional programming approach for flexibility and testability
- 📈 Trending stories integration
- 🔑 Keyword suggestion and selection
- 📧 Email delivery of generated content
- 🔒 Rate limiting for API protection
- 💾 Caching for improved performance
- 🎨 Responsive design with Tailwind CSS

## 🏗️ Project Structure

The project uses a modular structure with separate functions for image generation, blog content creation, and workflow management. This allows for easy modification and extension of the system. 🛠️

- 📁 `pages/`
  - `api/`: API routes for server-side functionality
    - `generate.ts`: Main API handler for content generation
    - `trending-stories.ts`: Fetches trending stories
    - `generate-keywords.ts`: Generates keyword suggestions
    - `send-email.ts`: Handles email delivery
  - `index.tsx`: Main page component
  - `privacy-policy.tsx`: Privacy policy page
- 📁 `lib/agents/`
  - `agentSystem.ts`: Defines the agent system and workflow interfaces
  - `imageAgent.ts`: Handles image generation using DALL-E 3
  - `blogAgent.ts`: Manages blog content creation and improvement
  - `workflow.ts`: Orchestrates the workflow between agents
- 📁 `components/`
  - `BlurImage.tsx`: Custom image component with blur effect
- 📁 `styles/`
  - `globals.css`: Global styles and Tailwind CSS imports
- 📁 `layout/`
  - `layout.tsx`: Main layout component

## 🔍 How It Works

1. User enters a topic on the main page. 📝
2. System fetches trending stories related to the topic. 📰
3. Keywords are generated based on the topic and trending stories. 🔑
4. User selects keywords for their blog posts (including custom keywords). ✅
5. The agentic workflow generates blog content and images based on selected keywords. 🤖
6. User can view generated content and send it to their email. 📨

### Agentic Workflow

The agentic workflow operates as follows:
1. Image Agent generates a relevant image using DALL-E 3.
2. Blog Agents (GPT-4 and Claude 3.5 Sonnet) iteratively create and improve the blog content.
3. Each agent builds upon the work of the previous agent, refining the content.
4. The final result combines the generated image and optimized blog content.

## Environment Variables

This project requires the following environment variables:

- `OPENAI_API_KEY`: Your OpenAI API key
- `ANTHROPIC_API_KEY`: Your Anthropic API key
- `SENDGRID_API_KEY`: Your SendGrid API key for email functionality
- `NEWS_API_KEY`: Your News API key for fetching trending stories
- `NEXT_PUBLIC_GOOGLE_ANALYTICS`: Your Google Analytics tracking ID

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
- OpenAI API (GPT-4 and DALL-E 3) 🧠
- Anthropic API (Claude 3.5 Sonnet) 🤖
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

Deploy your Next.js app using the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme). 🌐

Check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details. 📚

## 🐛 Troubleshooting

Common issues and their solutions:

1. API rate limiting: If you encounter rate limiting errors, try increasing the delay between requests or implementing a queue system.
2. Image generation fails: Ensure your DALL-E API key has sufficient credits and the prompt is not violating content policies.
3. Email delivery issues: Check your SendGrid API key and ensure your sender email is verified.

## 🧪 Testing

Currently, this project does not have automated tests. Adding unit tests and integration tests is a planned future improvement.

## 📚 Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs) 📘
- [OpenAI API](https://beta.openai.com/docs/) 🤖
- [Anthropic API](https://www.anthropic.com/product) 🧠
- [SendGrid Documentation](https://sendgrid.com/docs/) 📧
- [News API Documentation](https://newsapi.org/docs) 📰
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) 🎨

## 📜 License

This project is licensed under the MIT License. ⚖️
