import React, {View, Text, Button, TouchableOpacity} from "react-native";
import {Dispatch, SetStateAction, useEffect, useState} from "react";
import { Audio } from 'expo-av';
import transcribeRecording from "@/scripts/transcribeRecording";
import {IconSymbol} from "@/components/ui/IconSymbol";


interface RecordingProps {
  name: string,
  fileUrl: string,
  key: string,
  transcription: string,
  id: string,
  setModalVisible: Dispatch<SetStateAction<boolean>>,
  setTranscriptionText: Dispatch<SetStateAction<string>>,
  setRecordingName: Dispatch<SetStateAction<string>>,
}
export default function RecordingCard(props : RecordingProps) {
  const [sound, setSound] = useState();
  const hasBeenSummarized = props.transcription == "";

  async function playSound() {
    console.log('Loading Sound');


    const { sound } = await Audio.Sound.createAsync({uri: props.fileUrl});
    // @ts-ignore
    setSound(sound);

    console.log('Playing Sound');
    await sound.playAsync();
  }

  const transcribe = () => {
    transcribeRecording(props.fileUrl, props.id).then(r => console.log(r))
  }

  const showTranscription = () => {
    props.setTranscriptionText(props.transcription)
    props.setRecordingName(props.name)
    props.setModalVisible(true);
  }

  useEffect(() => {
    return sound
      ? () => {
        console.log('Unloading Sound');
        // @ts-ignore
        sound.unloadAsync();
      }
      : undefined;
  }, [sound]);
  
  
  return (
    <View  className={"relative flex flex-row justify-between bg-gradient-to-r bg-gray-500 rounded-md text-center p-8 m-4 items-center"}>
      <TouchableOpacity onPress={playSound} onLongPress={showTranscription}>
        <Text>
          {props.name}
        </Text>
      </TouchableOpacity>

      {
        hasBeenSummarized &&
          <TouchableOpacity className={""} onPress={transcribe}>
            <IconSymbol size={28} name={"pencil"} color={"black"}/>
          </TouchableOpacity>
      }
    </View>
  )
}