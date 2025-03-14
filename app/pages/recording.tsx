import { useState } from 'react';
import {View, StyleSheet, TouchableOpacity, SafeAreaView, Image} from 'react-native';
import { Audio } from 'expo-av';
import {IconSymbol} from "@/components/ui/IconSymbol";
import { getFunctions, httpsCallable } from "firebase/functions";
import {getApp} from "firebase/app";
import * as FileSystem from 'expo-file-system';

export default function App() {
  const [recording, setRecording] = useState();
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [isRecording, setIsRecording] = useState(false)
  const [name, setName] = useState("default recording name")

  const app = getApp();
  const functions = getFunctions(app);
  const addRecording = httpsCallable(functions, 'store_audio_metadata');

  async function startRecording() {
    try {
      // @ts-ignore
      if (permissionResponse.status !== 'granted') {
        console.log('Requesting permission..');
        await requestPermission();
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      // @ts-ignore
      setRecording(recording);
      setIsRecording(true);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    console.log('Stopping recording..');
    setRecording(undefined);
    // @ts-ignore
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync(
      {
        allowsRecordingIOS: false,
      }
    );
    // @ts-ignore
    const uri = recording.getURI();

    const base64Data = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64
    });

    // Get file extension from URI
    const fileExtension = uri.split('.').pop();

    addRecording({
      fileName: `${name || Date.now()}.${fileExtension}`,
      audioData: base64Data
    })
      .then((result) => {
        console.log(result.data);
      });

    setIsRecording(false);

    console.log('Recording stopped and stored at', uri);
  }


  return(
    <SafeAreaView className={"flex justify-center items-center bg-[#ecf0f1] p-10 h-screen-safe"}>
        <TouchableOpacity
          onPress={isRecording ? stopRecording : startRecording}
        >
          {isRecording &&
              <IconSymbol size={100} name="record.circle.fill" color={"red"} />
          }

          {!isRecording &&
              <IconSymbol size={100} name="record.circle.fill" color={"black"} />
          }

        </TouchableOpacity>
    </SafeAreaView>
  );
}