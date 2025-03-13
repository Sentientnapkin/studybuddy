import React, {View, Text, Button} from "react-native";
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
    <View className={"flex m-3 p-3"}>
      <Text>
        {props.name}
      </Text>

      <Text>
        {props.fileUrl}
      </Text>

      <Button title="Play Sound" onPress={playSound} />
    </View>
  )
}