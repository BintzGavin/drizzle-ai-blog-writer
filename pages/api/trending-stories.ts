import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const NEWS_API_KEY = process.env.NEWS_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ message: 'Topic is required' });
  }

  console.log('Fetching trending stories for topic:', topic);

  try {
    const response = await axios.get(`https://newsapi.org/v2/everything`, {
      params: {
        q: `"${topic}"`,
        sortBy: 'relevancy',
        language: 'en',
        pageSize: 14,
        apiKey: NEWS_API_KEY
      }
    });
    
    const stories = response.data.articles
      .filter((article: any) => article.title !== '[Removed]' && article.urlToImage !== null)
      .map((article: any) => ({
        title: article.title,
        url: article.url,
        image: article.urlToImage,
      }))
      .slice(0, 8);

    console.log('Trending stories fetched:', stories);
    res.status(200).json({ stories });
  } catch (error) {
    console.error('Error fetching trending stories:', error);
    res.status(500).json({ 
      message: 'Error fetching trending stories', 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
}
