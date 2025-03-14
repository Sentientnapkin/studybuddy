import {StyleSheet, Image, Platform, View, ScrollView, Button, TouchableOpacity, SafeAreaView} from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import {Link} from "expo-router";
import {useEffect, useState} from "react";
import NoteCard from "@/components/NoteCard";
import { getApp, initializeApp, getApps } from 'firebase/app';
import { getFunctions, httpsCallable } from "firebase/functions";
import { firebaseConfig } from "@/services/firebaseConfig";

type Note = {
  title: String,
  data: String,
  summary: String,
  TimeStamps: String[]
}

export default function HomeScreen() {
  const [notes, setNotes] = useState<Note[]>([])
  const [editing, setEditing] = useState(false)

  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  const functions = getFunctions(app);
  const getNotes = httpsCallable(functions, 'getNotes');

  useEffect(() => {
    // call the api to get the notes onto this screen
    getNotes({})
      .then((result) => {
        // Read result of the Cloud Function.
        /** @type {any} */
        const data = result.data;
        // const sanitizedMessage = data.text;

        // @ts-ignore
        setNotes(data);
      });
  }, [])

  return (
    <SafeAreaView className={"flex h-screen-safe justify-center"}>
      <ScrollView className={""}>
        {notes.map(
          note => (
            <NoteCard title={note.title} editing={editing} data={note.data}/>
          )
        )}
      </ScrollView>
      <Link href={"/pages/notetaking"} className={"absolute bottom-20 right-0 p-10"}>
        <TouchableOpacity className={""}>
          <IconSymbol size={52} name={"square.and.pencil"} color={"white"}/>
        </TouchableOpacity>
      </Link>
    </SafeAreaView>
  );
}
