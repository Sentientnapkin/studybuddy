import { getApp } from 'firebase/app';
import { getVertexAI, getGenerativeModel } from "firebase/vertexai";

export default async function transcribeRecording(recordingToTranscribeUri : string) {
  const app = getApp();
  const vertexai = getVertexAI(app);
  const model = getGenerativeModel(vertexai, { model: 'gemini-1.5-flash' });

  async function fileToGenerativePart(file: Blob) {
    const base64EncodedDataPromise = new Promise((resolve) => {
      const reader = new FileReader();
      //@ts-ignore
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(file);
    });
    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
  }

  // change argument to blob of recording
  const filePart = await fileToGenerativePart(new Blob());
  const textPart = "Can you transcribe this recording, in the format of timecode, speaker, caption? Use speaker A, speaker B, etc. to identify speakers."


  // @ts-ignore
  const result = await model.generateContent([textPart, filePart]);

  return result.response.text();
}