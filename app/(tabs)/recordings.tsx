import {
  ScrollView,
  SafeAreaView,
  TouchableOpacity, View,
  Text,

} from 'react-native';

import { IconSymbol } from '@/components/ui/IconSymbol';
import {useEffect, useState} from "react";
import RecordingCard from "@/components/RecordingCard";
import {Link, router} from "expo-router";
import {getFunctions, httpsCallable} from "firebase/functions";
import {getApp} from "firebase/app";
import Modal from "react-native-modal";

interface recording {
  name: string,
  fileUrl: string,
  id: string,
  transcription: string,
}

export default function RecordingsScreen() {
  const [recordings, setRecordings] = useState<recording[]>([])
  const [modalVisible, setModalVisible] = useState(false);
  const [transcriptionText, setTranscriptionText] = useState("");
  const [recordingName, setRecordingName] = useState("");

  const app = getApp();
  const functions = getFunctions(app);
  const getRecordings = httpsCallable(functions, 'get_audios');

  const closeModal = () => {
    setModalVisible(false)
    setTranscriptionText("")
    setRecordingName("")
  }

  useEffect(() => {
    getRecordings()
      .then((result) => {
        // Read result of the Cloud Function.
        /** @type {any} */
        const data = result.data;
        // @ts-ignore
        console.log(data[0].data)
        // const sanitizedMessage = data.text;

        // @ts-ignore
        setRecordings(data[0].data);
      });
  }, [router])

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
            <Text>{recordingName}</Text>
            <Text>{transcriptionText}</Text>
          </View>
        </View>
      </Modal>

      <ScrollView>
        {recordings.map(
          (item) => (
            <RecordingCard name={item.name} fileUrl={item.fileUrl} key={item.id} transcription={item.transcription} id={item.id} setModalVisible={setModalVisible} setTranscriptionText={setTranscriptionText} setRecordingName={setRecordingName}/>
          )
        )}
      </ScrollView>
      <Link href={"/pages/recording"} className={"absolute bottom-20 right-0 p-10"}>
        <TouchableOpacity className={""} onPress={() => {}}>
          <IconSymbol size={52} name={"record.circle"} color={"red"}/>
        </TouchableOpacity>
      </Link>
    </SafeAreaView>
  );
}
