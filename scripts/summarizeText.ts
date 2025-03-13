import { getApp } from 'firebase/app';
import { getVertexAI, getGenerativeModel } from "firebase/vertexai";

export default async function summarizeText(noteToSummarize : string) {
  const app = getApp();
  const vertexai = getVertexAI(app);
  const model = getGenerativeModel(vertexai, { model: 'gemini-1.5-flash' });

  const result = await model.generateContent(noteToSummarize);

  return result.response.text();
}