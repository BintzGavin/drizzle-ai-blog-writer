import type { NextApiRequest, NextApiResponse } from "next";
import sgMail from "@sendgrid/mail";
import axios from "axios";
import { marked } from "marked";

sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

function sanitizeAndFormatString(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\- ]/g, "")
    .replace(/\s+/g, "-");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, postContentHtml, imageUrl, keyword } = req.body;

  try {
    // Convert HTML back to Markdown
    const postContentMarkdown = marked.parse(postContentHtml);

    // Create a Markdown file content
    const markdownContent = `---
title: "${keyword}"
date: '${new Date().toLocaleDateString()}'
---

${postContentMarkdown}`;

    // Convert image url to buffer for email attachment
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const imageBuffer = Buffer.from(response.data, "binary");

    // Convert the image buffer to a Base64 string
    const base64Image = imageBuffer.toString("base64");

    // HTML email template with inline CSS
    const emailBody = `
      <html>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
          <h1 style="color: #333;">${keyword}</h1>
          <img src="${imageUrl}" alt="Blog Image" style="width: 100%; height: auto; border-radius: 10px; margin-bottom: 20px;" />
          <div style="color: #555; line-height: 1.6;">
            ${postContentHtml}
          </div>
        </div>
      </body>
      </html>
    `;

    let msg = {
      to: email,
      from: "help@swirlwebdesign.com",
      subject: `Blog Generated for ${keyword}`,
      html: emailBody,
      attachments: [
        {
          content: Buffer.from(markdownContent).toString("base64"),
          filename: `${sanitizeAndFormatString(keyword)}.mdx`,
          type: "text/markdown",
          disposition: "attachment",
        },
        {
          content: base64Image,
          filename: "pic1.png",
          type: "image/png",
          disposition: "attachment",
        },
      ],
    };

    await sgMail.send(msg);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
}
