import React, {View, Text} from "react-native";

interface TaskProps {
  name: string,
  description: string,
}
export default function Task(props : TaskProps) {

  return (
    <View className={"flex m-3 p-3"}>
      <Text>
        {props.name}
      </Text>

      <Text>
        {props.description}
      </Text>
    </View>
  )
}