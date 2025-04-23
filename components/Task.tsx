import React, { View, Text, TouchableOpacity } from "react-native";
import { getApp } from "firebase/app";
import { getFunctions, httpsCallable } from "firebase/functions";
import { IconSymbol } from "@/components/ui/IconSymbol";
import BouncyCheckbox from "react-native-bouncy-checkbox/lib";
import { useState } from "react";

interface TaskProps {
  name: string;
  description: string;
  key: string;
  id: string;
  priority: string;
  updateTodos: () => void;
}

export default function Task(props: TaskProps) {
  const app = getApp();
  const functions = getFunctions(app);
  const deleteTodo = httpsCallable(functions, "delete_todo");
  const [localChecked, setLocalChecked] = useState<boolean>(false);

  const [deleting, setDeleting] = useState<boolean>(false);


  const finishTask = () => {
    setDeleting(true);
    deleteTodo({id: props.id}).then(
      (response) => {
        console.log(response.data)
        props.updateTodos()
      }
    )
  }

  return (
    <View className={"p-2 rounded-lg flex align-middle items-center flex-row justify-between bg-white drop-shadow-md m-2 h-20"}>
          <View className="p-2 ml-1">
            <BouncyCheckbox
              size={32}
              iconImageStyle={{
                width: 16,
                height: 16,
              }}
              fillColor={"green"}
              onPress={(checked: boolean) => {
                setLocalChecked(!localChecked);
              }}/>
          </View>

          {
            deleting
              ?
              (
                <View className={"p-2"}>
                  <Text className={"text-lg"}>
                    Deleting...
                  </Text>
                </View>
              )
              :
              (
                <View className="p-2">
                  <Text className={`text-lg text-black ${localChecked ? "line-through" : ""}`}>{props.name}</Text>
                  <Text className={`text-sm text-${props.priority}`}>Priority: {props.priority}</Text>
                </View>
              )
          }

          <TouchableOpacity onPress={finishTask} className="flex text-red-500 border-2 border-red-500 p-2 rounded-lg mr-2">
            <IconSymbol size={20} name={"xmark"} color={"red"}/>
          </TouchableOpacity>
    </View>
  );
}
