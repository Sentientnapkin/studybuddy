import {
  StyleSheet,
  Image,
  Platform,
  View,
  ScrollView,
  SafeAreaView,
  Button,
  TouchableOpacity,
  TextInput
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

interface task {
  name: string,
  description: string,
}

export default function TodoScreen() {
  const [todos, setTodos] = useState<task[]>([])
  const [newTodoName, setNewTodoName] = useState("")
  const [newTodoDesc, setNewTodoDesc] = useState("")

  const addTodo = () => {
    // add code to call the cloud function to add a todo here
    const newTodo = {name: "", description: ""}

    setTodos([...todos, newTodo])
    setNewTodoName("")
    setNewTodoDesc("")
  }

  useEffect(() => {
    // call the api to get the notes onto this screen

    setTodos([]);
  }, [])

  return (
    <SafeAreaView>
      <Modal>
        <View>
          <TextInput
            onChangeText={setNewTodoName}
            value={newTodoName}
            placeholder={"New Todo Name"}
          >

          </TextInput>

          <TextInput
            onChangeText={setNewTodoDesc}
            value={newTodoDesc}
            placeholder={"New Todo Description"}
          >

          </TextInput>

          <TouchableOpacity onPress={addTodo}>

          </TouchableOpacity>
        </View>
      </Modal>

      <ScrollView>
        {todos.map(
          (item) => (
            <Task name={item.name} description={item.description}/>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
