import React, {SafeAreaView, TouchableOpacity, StyleSheet, Alert} from 'react-native';
import { useState, useEffect } from 'react';
import { useAudioRecorder, RecordingOptions, AudioModule, RecordingPresets } from 'expo-audio';
import {IconSymbol} from "@/components/ui/IconSymbol";


export default function RecordingScreen() {
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isRecording, setIsRecording] = useState(false)

  const record = async () => {
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
  };

  const stopRecording = async () => {
    // The recording will be available on `audioRecorder.uri`.
    // write code to upload the uri to firebase

    await audioRecorder.stop();
  };

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert('Permission to access microphone was denied');
      }
    })();
  }, []);


  return(
    <SafeAreaView style={styles.container}>
        <TouchableOpacity
          onPress={audioRecorder.isRecording ? stopRecording : record}
        >
          {isRecording &&
              <IconSymbol size={28} name="record.circle.fill" color={"red"} />
          }

          {!isRecording &&
              <IconSymbol size={28} name="record.circle.fill" color={"black"} />
          }

        </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    padding: 10,
  },
});