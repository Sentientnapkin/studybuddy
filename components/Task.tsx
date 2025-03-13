import React, {View, Text} from "react-native";

interface TaskProps {
  name: string,
  description: string,
}
export default function Task(props : TaskProps) {
  const finishTask = () => {
    // run API here to delete this note


  }


  return (
    <View className={"relative flex flex-row justify-between bg-gradient-to-r bg-gray-500 rounded-md text-center p-8 m-4"}>
      <Text>
        {props.name}
      </Text>

      <Text>
        {props.description}
      </Text>
    </View>
  )
}