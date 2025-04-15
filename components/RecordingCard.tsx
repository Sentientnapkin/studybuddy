import React, {View, Text, Button, TouchableOpacity, Image} from "react-native";
import {Dispatch, SetStateAction, useEffect, useState} from "react";
import { Audio } from 'expo-av';
import transcribeRecording from "@/scripts/transcribeRecording";
import {IconSymbol} from "@/components/ui/IconSymbol";
import {getFunctions, httpsCallable} from "firebase/functions";

interface RecordingProps {
  name: string,
  fileUrl: string,
  key: string,
  transcription: string,
  editing: boolean,
  id: string,
  setModalVisible: Dispatch<SetStateAction<boolean>>,
  setTranscriptionText: Dispatch<SetStateAction<string>>,
  setRecordingName: Dispatch<SetStateAction<string>>,
  updateRecordings: () => void,
}
export default function RecordingCard(props : RecordingProps) {
  const [sound, setSound] = useState();
  const [hasBeenSummarized, setHasBeenSummarized] = useState(props.transcription != "");
  const [transcriptionText, setTranscriptionText] = useState("");
  const functions = getFunctions();
  const deleteRecording = httpsCallable(functions, 'delete_recording');

  async function playSound() {
    console.log('Loading Sound');


    const { sound } = await Audio.Sound.createAsync({uri: props.fileUrl});
    // @ts-ignore
    setSound(sound);

    console.log('Playing Sound');
    await sound.playAsync();
  }

  const transcribe = () => {
    transcribeRecording(props.fileUrl, props.id).then(r => {
      console.log(r)
      setHasBeenSummarized(true)
      setTranscriptionText(r)
    })
  }

  const showTranscription = () => {
    props.setTranscriptionText(transcriptionText)
    props.setRecordingName(props.name)
    props.setModalVisible(true);
  }

  const deleteAudio = () => {
    deleteRecording({id: props.id}).then(
      (response) => {
        console.log(response.data)
        props.updateRecordings()
      }
    )
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
    <View  className={"p-2 rounded-lg flex align-middle items-center flex-row justify-between bg-white drop-shadow-md m-2 h-20"}>
      <TouchableOpacity onPress={playSound} onLongPress={showTranscription}>
        <Text className={"p-2 text-xl font-bold text-black"}>
          {props.name.substring(0, props.name.length - 4)}
        </Text>
      </TouchableOpacity>

      {
        !hasBeenSummarized &&
          <TouchableOpacity className={""} onPress={transcribe}>
              <IconSymbol size={28} name={"list.clipboard"} color={"black"}/>
          </TouchableOpacity>
      }
      {props.editing &&
        <TouchableOpacity onPress={deleteAudio}>
          <IconSymbol size={28} name={"trash.fill"} color={"black"}/>
        </TouchableOpacity>
      }
    </View>
  )
}