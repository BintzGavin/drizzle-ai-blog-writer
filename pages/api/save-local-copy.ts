import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { keyword, blogContent, imageUrl } = req.body;

  if (!keyword) {
    return res.status(400).json({ error: "Keyword is required" });
  }

  try {
    const sanitizedKeyword = keyword.toLowerCase().replace(/\s+/g, "-");
    const blogDir = path.join(process.cwd(), "blogs");
    const markdownDir = path.join(blogDir, "markdown");
    const imagesDir = path.join(blogDir, "images");

    // Create directories if they don't exist
    fs.mkdirSync(blogDir, { recursive: true });
    fs.mkdirSync(markdownDir, { recursive: true });
    fs.mkdirSync(imagesDir, { recursive: true });

    let savedBlog = false;
    let savedImage = false;

    // Save markdown file if blogContent is provided
    if (blogContent) {
      const markdownPath = path.join(markdownDir, `${sanitizedKeyword}.md`);
      fs.writeFileSync(markdownPath, blogContent);
      savedBlog = true;
    }

    // Save image if imageUrl is provided
    if (imageUrl) {
      try {
        const imageResponse = await fetch(imageUrl);
        const imageBuffer = await imageResponse.arrayBuffer();
        const imagePath = path.join(imagesDir, `${sanitizedKeyword}.png`);
        fs.writeFileSync(imagePath, Buffer.from(imageBuffer));
        savedImage = true;
      } catch (imageError) {
        console.error("Error saving image:", imageError);
      }
    }

    if (savedBlog && savedImage) {
      res
        .status(200)
        .json({ message: "Blog post and image saved successfully" });
    } else if (savedBlog) {
      res.status(200).json({ message: "Blog post saved successfully" });
    } else if (savedImage) {
      res.status(200).json({ message: "Image saved successfully" });
    } else {
      res.status(400).json({ error: "No content to save" });
    }
  } catch (error) {
    console.error("Error saving local copy:", error);
    res.status(500).json({ error: "Failed to save local copy" });
  }
}
