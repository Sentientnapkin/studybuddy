import { useState } from 'react';
import {View, StyleSheet, TouchableOpacity, SafeAreaView, Image} from 'react-native';
import { Audio } from 'expo-av';
import {IconSymbol} from "@/components/ui/IconSymbol";
import { getFunctions, httpsCallable } from "firebase/functions";
import {getApp} from "firebase/app";

export default function App() {
  const [recording, setRecording] = useState();
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [isRecording, setIsRecording] = useState(false)

  const app = getApp();
  const functions = getFunctions(app);
  // todo change function name
  const addRecording = httpsCallable(functions, 'addRecording');

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

    // todo call the api to upload the uri and see if that works for playing the video
    addRecording({ uri: uri })
      .then((result) => {
        // Read result of the Cloud Function.
        /** @type {any} */
        const data = result.data;
        //@ts-ignore
        const sanitizedMessage = data.text;
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