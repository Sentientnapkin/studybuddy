import { getApp } from 'firebase/app';
import { getVertexAI, getGenerativeModel } from "firebase/vertexai";
import {doc, updateDoc, getFirestore} from "firebase/firestore";

export default async function summarizeText(noteToSummarize : string, id : string) {
  const app = getApp();
  const vertexai = getVertexAI(app);
  const db = getFirestore(app);
  const model = getGenerativeModel(vertexai, { model: 'gemini-1.5-flash' });

  const text = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => resolve(xhr.responseText);
    xhr.onerror = () => reject(new Error('Failed to fetch HTML file'));
    xhr.open('GET', noteToSummarize);
    xhr.send();

  });

  const textPart = "Can you summarize the text from this document that is formatted in html (only focus on the actual text information not the divs and other html attributes): "
  const result = await model.generateContent(textPart + text);

  const note = doc(db, "notes", id);

  await updateDoc(note, {
    summary: result.response.text()
  })

  return result.response.text();
}