import {
  StyleSheet,
  Image,
  Platform,
  View,
  ScrollView,
  SafeAreaView,
  Button,
  TouchableOpacity,
  TextInput,
  Text
} from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import {useEffect, useState} from "react";
import Task from "@/components/Task";
import Modal from "react-native-modal";
import {set} from "@firebase/database";
import {Link} from "expo-router";
import {getFunctions, httpsCallable} from "firebase/functions";
import {getApp} from "firebase/app";

interface task {
  title: string,
  description: string,
  id: string,
}

export default function TodoScreen() {
  const [todos, setTodos] = useState<task[]>([])
  const [newTodoName, setNewTodoName] = useState("")
  const [newTodoDesc, setNewTodoDesc] = useState("")
  const [modalVisible, setModalVisible] = useState(false)

  const [changed, setChanged] = useState(false)

  const functions = getFunctions();
  const getTodos = httpsCallable(functions, 'get_todos');
  const addTodoFunction = httpsCallable(functions, 'add_todo');

  const showModal = () => {
    setModalVisible(true)
  }

  const hideModal = () => {
    setModalVisible(false)
  }

  const addTodo = () => {
    const newTodo = {name: newTodoName, description: newTodoDesc}

    addTodoFunction(newTodo)
      .then((result) => {
        console.log(result.data)

        setChanged(true)
      })

    setNewTodoName("")
    setNewTodoDesc("")

    hideModal();
  }

  useEffect(() => {
    getTodos()
      .then((result) => {
        const data = result.data;
        // @ts-ignore
        console.log(data[0].data);
        // @ts-ignore
        setTodos(data[0].data);
        setChanged(false)
      });
  }, [changed])

  return (
    <SafeAreaView className={"flex h-screen-safe justify-center"}>
      <Modal
        isVisible={modalVisible}
        onBackdropPress={hideModal}
        className={"flex justify-center items-center "}
      >
        <View className={"flex justify-center items-center bg-white h-1/3 w-3/4 rounded-lg p-10"}>
          <TextInput
            onChangeText={setNewTodoName}
            value={newTodoName}
            placeholder={"New Todo Name"}
            placeholderTextColor={"#A9A9A9"}
            className={"border-2 border-black p-8 m-2 rounded-md w-auto text-black w-full"}
          >

          </TextInput>

          <TextInput
            onChangeText={setNewTodoDesc}
            value={newTodoDesc}
            placeholder={"New Todo Description"}
            placeholderTextColor={"#A9A9A9"}
            className={"border-2 border-black p-4 m-2 rounded-md text-black w-auto w-full"}
          >

          </TextInput>

          <TouchableOpacity onPress={addTodo} className={"flex justify-center items-center bg-green-700 h-12 w-full p-4 m-4 rounded-lg"}>
            <Text className={"color-white"}>
              Add Todo
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <ScrollView>
        {todos.map(
          (item) => (
            <Task name={item.title} description={item.description} key={item.id} id={item.id} setChanged={setChanged}/>
          )
        )}
      </ScrollView>

      <View className={"absolute bottom-20 right-0 p-10"}>
        <TouchableOpacity className={""} onPress={showModal}>
          <IconSymbol size={52} name={"plus.circle.fill"} color={"green"}/>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
