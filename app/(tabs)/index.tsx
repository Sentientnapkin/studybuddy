import {
  StyleSheet,
  Image,
  Platform,
  View,
  ScrollView,
  Button,
  TouchableOpacity,
  SafeAreaView,
  Text,
  ActivityIndicator, StatusBar
} from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import {Link, useLocalSearchParams} from "expo-router";
import {useEffect, useState} from "react";
import NoteCard from "@/components/NoteCard";
import { getApp, initializeApp, getApps } from 'firebase/app';
import { getFunctions, httpsCallable } from "firebase/functions";
import { firebaseConfig } from "@/services/firebaseConfig";
import Modal from "react-native-modal";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from "expo-router";

type Note = {
  name: string,
  fileUrl: string,
  summary: string,
  id: string,
}

export default function HomeScreen() {
  const {readyToUpdate} = useLocalSearchParams();
  const [notes, setNotes] = useState<Note[]>([])
  const [editing, setEditing] = useState(false)

  const [modalVisible, setModalVisible] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const [noteName, setNoteName] = useState("");
  const [loading, setLoading] = useState(true); //loading state
  const router = useRouter(); // Expo Router navigation


  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  const auth = getAuth();
  const functions = getFunctions();
  const getNotes = httpsCallable(functions, 'get_notes');

  const closeModal = () => {
    setModalVisible(false)
    setSummaryText("")
    setNoteName("")
  }

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/auth.user

        // console.log(user.uid)

        const uid = user.uid;
        // ...
      } else {
        // User is signed out
        // ...

        router.push("/login")
      }
    })
  });

  const switchEditing =() => {
    setEditing(!editing);
  }

  const updateNotes = () => {
    setLoading(true); //loading sign before notes are fetched
    getNotes()
      .then((result) => {
        const data = result.data;
        // @ts-ignore
        // console.log(data[0].data)
        // @ts-ignore
        setNotes(data[0].data);
      })
      .finally(() => {
        setLoading(false); //stop loading after notes are fetched
      });

  };

  useEffect(() => {
    updateNotes()
  }, [readyToUpdate])

  return (
    <SafeAreaView className="flex bg-gray-100 flex h-screen-safe justify-center">
      <StatusBar
        animated={true}
        backgroundColor="#61dafb"
        barStyle={"default"}
        hidden={false}
      />

      {/* Modal for viewing note summaries */}
      <Modal
        isVisible={modalVisible}
        onBackdropPress={closeModal}
        style={{ margin: 0 }}
      >
        <View className="bg-white rounded-2xl p-6 mx-6 my-auto">
          <Text className="text-2xl font-bold mb-4">{noteName}</Text>
          <ScrollView>
            <Text className="text-gray-700 text-base">{summaryText}</Text>
          </ScrollView>
        </View>
      </Modal>

      {/* Top Bar */}
      <View className="flex-row justify-between items-center p-4">
        <Text className="text-3xl font-bold text-gray-800">My Notes</Text>
        <TouchableOpacity onPress={switchEditing}>
          <Text className="text-xl text-blue-600">{editing ? "Done" : "Edit"}</Text>
        </TouchableOpacity>
      </View>

      {/* Content Section */}
      {loading ? ( // ✅ Show spinner if loading
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-gray-600 mb-4">Loading notes...</Text>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <ScrollView className="px-1">
          {notes.length > 0 ? (
            notes.map(note => (
              <NoteCard
                key={note.id}
                id={note.id}
                title={note.name}
                editing={editing}
                data={note.fileUrl}
                summary={note.summary}
                setNoteName={setNoteName}
                setSummaryText={setSummaryText}
                setModalVisible={setModalVisible}
                updateNotes={updateNotes}
              />
            ))
          ) : (
            // ✅ Optional: show empty message if no notes
            <View className="flex-1 justify-center items-center mt-10">
              <Text className="text-gray-500">No notes yet. Tap + to add one!</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Floating Add Button */}
      <Link href={"/pages/notetaking"} asChild className={"absolute bottom-0 right-0 p-4 m-4 bg-blue-500 rounded-full shadow-lg justify-center items-center"}>
        <TouchableOpacity className="">
          <IconSymbol size={32} name="square.and.pencil" color="white" />
        </TouchableOpacity>
      </Link>
    </SafeAreaView>
  );
}
