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

  /** STEP ONE: LOAD DOCUMENT */
  const bookPath =
    "/Users/shawnesquivel/GitHub/langchain-js-course/data/document_loaders/naval-ravikant-book.pdf";
  const loader = new PDFLoader(bookPath);
  const docs = await loader.load();

  
  if (docs.length === 0) {
    console.log("No documents found.");
    throw new Error("No documents created from the resource.");
  }

  const splitter = new CharacterTextSplitter({
    separator: " ",
    chunkSize: 250,
    chunkOverlap: 10,
  });

  const splitDocs = await splitter.splitDocuments(docs);

  // Reduce the size of the metadata for each document -- lots of useless pdf information
  const reducedDocs = splitDocs.map((doc) => {
    const reducedMetadata = { ...doc.metadata };
    delete reducedMetadata.pdf; // Remove the 'pdf' field
    return new Document({
      pageContent: doc.pageContent,
      metadata: reducedMetadata,
    });
  });

  // reference; https://docs.pinecone.io/reference/pinecone-clients#node-js-client
  const client = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const pineconeIndex = client.Index(process.env.PINECONE_INDEX);

  try {
    await PineconeStore.fromDocuments(reducedDocs, new OpenAIEmbeddings(), {
      pineconeIndex,
    });
  } catch (error) {
    console.log('Error uploading to Pinecone:', error);
  }

  return res.status(200).json({
    result: `Uploaded to Pinecone! Before splitting: ${docs.length}, After splitting: ${splitDocs.length}`,
  });
}
