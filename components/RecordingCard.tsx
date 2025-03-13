import React, {View, Text, Button} from "react-native";
import { useAudioPlayer } from 'expo-audio';


interface RecordingProps {
  name: string,
  fileUrl: string,
}
export default function RecordingCard(props : RecordingProps) {
  const player = useAudioPlayer(require(props.fileUrl));

  return (
    <View className={"flex m-3 p-3"}>
      <Text>
        {props.name}
      </Text>

      <Text>
        {props.fileUrl}
      </Text>

      <Button title="Play Sound" onPress={() => player.play()} />
    </View>
  )
}