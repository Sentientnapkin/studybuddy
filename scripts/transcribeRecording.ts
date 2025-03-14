import { getApp } from 'firebase/app';
import { getVertexAI, getGenerativeModel } from "firebase/vertexai";
import {doc, updateDoc, getFirestore} from "firebase/firestore";

export default async function transcribeRecording(fileUrl : string, id: string) {
  const app = getApp();
  const vertexai = getVertexAI(app);
  const db = getFirestore(app)
  const model = getGenerativeModel(vertexai, { model: 'gemini-1.5-flash' });

  async function fileToGenerativePart() {
    const response = await fetch(fileUrl);
    const blob = await response.blob();

    const base64EncodedDataPromise = new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.readAsDataURL(blob);
    });

    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: blob.type },
    };
  }

  // change argument to blob of recording
  const filePart = await fileToGenerativePart();
  const textPart = "Can you transcribe this recording, in the format of timecode, speaker, caption? Use speaker A, speaker B, etc. to identify speakers."

  const result = await model.generateContent([textPart, filePart]);

  const recording = doc(db, "audioRecordings", id);

  await updateDoc(recording, {
    transcription: result.response.text()
  })

  return result.response.text();
}