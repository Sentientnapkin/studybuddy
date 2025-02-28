import {StyleSheet, Image, Platform, View, ScrollView, Button, TouchableOpacity, SafeAreaView} from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { router } from 'expo-router';

interface TodoFormProps {
  title: String,
  data: String,
  editing: boolean
};

export default function NoteCard(props: TodoFormProps) {

  const deleteItem = () => {
    // run API here to delete this note
  }

  const openNote = () => {
    // write in code here that takes in the

    router.navigate("/pages/notetaking")
  }

  return(
    <TouchableOpacity onPress={openNote} className={"relative flex flex-row justify-between bg-gradient-to-r bg-gray-500 rounded-md text-center p-8 m-4"}>
      {props.title}
      {props.editing &&
        <TouchableOpacity onPress={deleteItem} className={"absolute right-0 p-4"}>
          <IconSymbol name={"x.circle"} color={"red"}/>
        </TouchableOpacity>
      }
    </TouchableOpacity>
  );
}