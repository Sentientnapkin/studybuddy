import { useState } from 'react';
import {View, StyleSheet, TouchableOpacity, SafeAreaView} from 'react-native';
import { Audio } from 'expo-av';
import {IconSymbol} from "@/components/ui/IconSymbol";

export default function App() {
  const [recording, setRecording] = useState();
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [isRecording, setIsRecording] = useState(false)

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
      const { recording } = await Audio.Recording.createAsync( Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      // @ts-ignore
      setRecording(recording);
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
    console.log('Recording stopped and stored at', uri);
  }


  return(
    <SafeAreaView style={styles.container}>
        <TouchableOpacity
          onPress={recording ? stopRecording : startRecording}
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