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
  Text, StatusBar, ActivityIndicator
} from 'react-native';

import {useCallback, useEffect, useState} from "react";
import Task from "@/components/Task";
import Modal from "react-native-modal";
import {getFunctions, httpsCallable} from "firebase/functions";
import {useFocusEffect} from "expo-router";

interface task {
  title: string,
  description: string,
  id: string,
  priority: string;  // Added for priority of tasks
}

export default function TodoScreen() {
  const [todos, setTodos] = useState<task[]>([])
  const [newTodoName, setNewTodoName] = useState("")
  const [newTodoDesc, setNewTodoDesc] = useState("")
  const [priority, setPriority] = useState("low") // setting priority

  const [changed, setChanged] = useState(false)
  const [loading, setLoading] = useState(false)

  const functions = getFunctions();
  const getTodos = httpsCallable(functions, 'get_todos');
  const addTodoFunction = httpsCallable(functions, 'add_todo');

  const addTodo = () => {
    const newTodo = {
      name: newTodoName,
      description: newTodoDesc,
      priority: priority,  // added priority to call (updated backend functions too)
    }

    addTodoFunction(newTodo)
      .then((result) => {
        // console.log(result.data)

        setChanged(true)
      })

    setNewTodoName("")
    setNewTodoDesc("")
    setPriority("low")  //priority change
  }

  const updateTodos = () => {
    setLoading(true)
    getTodos()
      .then((result) => {
        const data = result.data;
        // @ts-ignore
       // console.log(data[0].data);
       // @ts-ignore
        setTodos(data[0].data);
      }).finally(() => {
        setLoading(false)
        setChanged(false)
    });
  }

  useFocusEffect(
    useCallback(() => {
      updateTodos();
    }, [])
  )

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
          className="ml-2 border-2 border-green-700 p-2 hover:text-white hover:bg-green-500 rounded-lg flex flex-row items-center justify-center w-20"
        >
          <Text className={"text-green-700"}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Priority Selector UI UPDATES */}
      <View className="flex-row justify-start items-center mx-4">
        <Text className="text-xl">Priority:</Text>
        <TouchableOpacity onPress={() => setPriority("high")} style={{ backgroundColor: "red", padding: 5, margin: 5 }}>
          <Text className="text-white">High</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setPriority("medium")} style={{ backgroundColor: "yellow", padding: 5, margin: 5 }}>
          <Text className="text-black">Medium</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setPriority("low")} style={{ backgroundColor: "green", padding: 5, margin: 5 }}>
          <Text className="text-white">Low</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-gray-600 mb-4">Loading todos...</Text>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
      <ScrollView>
        {todos.map((item) => (
          <Task
            key={item.id}
            name={item.title}
            description={item.description}
            id={item.id}
            priority={item.priority} // priority of task being sent to the task.tsx component
            updateTodos={updateTodos}
          />
        ))}
      </ScrollView>
      )}
    </SafeAreaView>
  );
}
