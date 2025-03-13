import React, {View, Text, Button, TouchableOpacity} from "react-native";
import {useEffect, useState} from "react";
import { Audio } from 'expo-av';


interface RecordingProps {
  name: string,
  fileUrl: string,
}
export default function RecordingCard(props : RecordingProps) {
  const [sound, setSound] = useState();

  async function playSound() {
    console.log('Loading Sound');

    // todo implement the logic better here in order to get the fileUrl properly played by expo av

    const { sound } = await Audio.Sound.createAsync(props.fileUrl);
    // @ts-ignore
    setSound(sound);

    console.log('Playing Sound');
    await sound.playAsync();
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
    <TouchableOpacity onPress={playSound} className={"relative flex flex-row justify-between bg-gradient-to-r bg-gray-500 rounded-md text-center p-8 m-4"}>
      <Text>
        {props.name}
      </Text>

      <Text>
        {props.fileUrl}
      </Text>
    </TouchableOpacity>
  )
}