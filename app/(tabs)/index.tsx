import {StyleSheet, Image, Platform, View, ScrollView, Button, TouchableOpacity, SafeAreaView} from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import {Link} from "expo-router";
import {useEffect, useState} from "react";
import NoteCard from "@/components/NoteCard";

type Note = {
  title: String,
  data: String,
  summary: String,
  TimeStamps: String[]
}

export default function HomeScreen() {
  const [notes, setNotes] = useState<Note[]>([])
  const [editing, setEditing] = useState(false)


  useEffect(() => {
    // call the api to get the notes onto this screen

    setNotes([]);
  })

  return (
    <SafeAreaView className={"flex h-screen-safe justify-center"}>
      <ScrollView className={""}>
        {notes.map(
          note => (
            <NoteCard title={note.title} editing={editing} data={note.data}/>
          )
        )}
      </ScrollView>
      <Link href={"/pages/notetaking"} className={"absolute bottom-0 right-0 p-10"}>
        <TouchableOpacity className={""}>
          <IconSymbol size={52} name={"square.and.pencil"} color={"white"}/>
        </TouchableOpacity>
      </Link>
    </SafeAreaView>
  );
}
