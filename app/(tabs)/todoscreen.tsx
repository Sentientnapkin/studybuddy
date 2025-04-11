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
  Text, StatusBar
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
import {getFunctions, httpsCallable} from "firebase/functions";

interface task {
  title: string,
  description: string,
  id: string,
}

export default function TodoScreen() {
  const [todos, setTodos] = useState<task[]>([])
  const [newTodoName, setNewTodoName] = useState("")
  const [newTodoDesc, setNewTodoDesc] = useState("")

  const [changed, setChanged] = useState(false)

  const functions = getFunctions();
  const getTodos = httpsCallable(functions, 'get_todos');
  const addTodoFunction = httpsCallable(functions, 'add_todo');

  const addTodo = () => {
    const newTodo = {name: newTodoName, description: newTodoDesc}

    addTodoFunction(newTodo)
      .then((result) => {
        // console.log(result.data)

        setChanged(true)
      })

    setNewTodoName("")
    setNewTodoDesc("")
  }

  const updateTodos = () => {
    getTodos()
      .then((result) => {
        const data = result.data;
        // @ts-ignore
        // console.log(data[0].data);
        // @ts-ignore
        setTodos(data[0].data);
        setChanged(false)
      });
  }

  useEffect(() => {
    updateTodos()
  }, [changed])

  return (
    <SafeAreaView className={"flex h-screen-safe justify-center text-center"}>
      <StatusBar
        animated={true}
        backgroundColor="#61dafb"
        barStyle={"default"}
        hidden={false}
      />

      <View className="flex-row justify-start items-center p-4">
        <Text className="text-3xl font-bold text-gray-800">My Todos</Text>
      </View>

      <View className="flex flex-row mx-4 h-16">
        <TextInput
          onChangeText={setNewTodoName}
          value={newTodoName}
          placeholder={"Enter your task here"}
          placeholderTextColor={"#A9A9A9"}
          className="border-b-2 border-gray-500 text-black flex-grow text-xl"
        />
        <TouchableOpacity
          onPress={addTodo}
          className="ml-2 border-2 border-green-700 p-2  hover:text-white hover:bg-green-500 rounded-lg flex flex-row items-center justify-center w-20"
        >
          <Text className={"text-green-700"}>Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {todos.map(
          (item) => (
            <Task
              name={item.title}
              description={item.description}
              key={item.id} id={item.id}
              updateTodos={updateTodos}/>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
