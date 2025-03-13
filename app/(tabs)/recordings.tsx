import {
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';

import { IconSymbol } from '@/components/ui/IconSymbol';
import {useEffect, useState} from "react";
import RecordingCard from "@/components/RecordingCard";
import {Link} from "expo-router";

interface recording {
  name: string,
  fileUrl: string,
}

export default function RecordingsScreen() {
  const [recordings, setRecordings] = useState<recording[]>([])
  const [newRecordingName, setNewRecordingName] = useState("")

  const addTodo = () => {
    // add code to call the cloud function to add a recording here
    const newRecording = {name: "", fileUrl: ""}

    setRecordings([...recordings, newRecording])
    setNewRecordingName("")
  }

  useEffect(() => {
    // call the api to get the notes onto this screen

    setRecordings([]);
  }, [])

  return (
    <SafeAreaView className={"flex h-screen-safe justify-center"}>
      <ScrollView>
        {recordings.map(
          (item) => (
            <RecordingCard name={item.name} fileUrl={item.fileUrl}/>
          )
        )}
      </ScrollView>
      <Link href={"/pages/recording"} className={"absolute bottom-0 right-0 p-10"}>
        <TouchableOpacity className={""} onPress={() => {}}>
          <IconSymbol size={52} name={"record.circle"} color={"red"}/>
        </TouchableOpacity>
      </Link>
    </SafeAreaView>
  );
}
