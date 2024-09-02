import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { Pinecone } from "@pinecone-database/pinecone";
import { Document } from "@langchain/core/documents";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { CharacterTextSplitter } from "@langchain/textsplitters";


export default async function handler(req, res) {
  // Validators
  if (!process.env.PINECONE_ENVIRONMENT || !process.env.PINECONE_API_KEY) {
    throw new Error("Pinecone environment or api key vars missing");
  }
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  /** Step 1: Create Documents */


  /** Step 2: Upload to Pinecone */
  // reference; https://docs.pinecone.io/reference/pinecone-clients#node-js-client


  return res.status(200).json({
    result: `Uploaded to Pinecone! `,
  });
}
