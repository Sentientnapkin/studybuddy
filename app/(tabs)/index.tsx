import {
  StyleSheet,
  Image,
  Platform,
  View,
  ScrollView,
  Button,
  TouchableOpacity,
  SafeAreaView,
  Text
} from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import {Link} from "expo-router";
import {useEffect, useState} from "react";
import NoteCard from "@/components/NoteCard";
import { getApp, initializeApp, getApps } from 'firebase/app';
import { getFunctions, httpsCallable } from "firebase/functions";
import { firebaseConfig } from "@/services/firebaseConfig";
import Modal from "react-native-modal";

type Note = {
  name: string,
  fileUrl: string,
  summary: string,
  id: string,
}

export default function HomeScreen() {
  const [notes, setNotes] = useState<Note[]>([])
  const [editing, setEditing] = useState(false)

  const [modalVisible, setModalVisible] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const [noteName, setNoteName] = useState("");

  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  const functions = getFunctions(app);
  const getNotes = httpsCallable(functions, 'get_notes');

  const closeModal = () => {
    setModalVisible(false)
    setSummaryText("")
    setNoteName("")
  }

  useEffect(() => {
    getNotes()
      .then((result) => {
        const data = result.data;
        // @ts-ignore
        console.log(data[0].data)
        // @ts-ignore
        setNotes(data[0].data);
      });
  }, [])

  return (
    <SafeAreaView className={"flex h-screen-safe justify-center"}>
      <Modal
        isVisible={modalVisible}
        onBackdropPress={closeModal}
        style={{margin: 0}}
        className={"flex  "}

      >
        <View className={"flex justify-start bg-white h-4/6 w-full rounded-lg p-10"}>
          <View >
            <Text>{noteName}</Text>
            <Text>{summaryText}</Text>
          </View>
        </View>
      </Modal>

      <ScrollView className={""}>
        {notes.map(
          note => (
            <NoteCard title={note.name} editing={editing} data={note.fileUrl} key={note.id} id={note.id} summary={note.summary} setNoteName={setNoteName} setSummaryText={setSummaryText} setModalVisible={setModalVisible}/>
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
