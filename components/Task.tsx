import React, {View, Text, TouchableOpacity} from "react-native";
import {getApp} from "firebase/app";
import {getFunctions, httpsCallable} from "firebase/functions";
import {IconSymbol} from "@/components/ui/IconSymbol";

interface TaskProps {
  name: string,
  description: string,
  key: string,
  id: string,
  updateTodos: () => void,
}
export default function Task(props : TaskProps) {
  const app = getApp();
  const functions = getFunctions(app);
  const deleteTodo = httpsCallable(functions, 'delete_todo');


  const finishTask = () => {
    deleteTodo({id: props.id}).then(
      (response) => {
        console.log(response.data)
        props.updateTodos()
      }
    )
  }

  return (
    <View className={"relative flex flex-row justify-between bg-gradient-to-r bg-white drop-shadow-md rounded-md text-center p-8 m-4"}>
      <Text>
        {props.name}
      </Text>

      <Text>
        {props.description}
      </Text>

      <TouchableOpacity onPress={finishTask}>
        <IconSymbol size={28} name={"trash.fill"} color={"black"}/>
      </TouchableOpacity>
    </View>
  )
}