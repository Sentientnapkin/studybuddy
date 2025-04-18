import {
  ScrollView,
  SafeAreaView,
  TouchableOpacity, View,
  Text, StatusBar, ActivityIndicator,

} from 'react-native';

import { IconSymbol } from '@/components/ui/IconSymbol';
import {useCallback, useEffect, useState} from "react";
import RecordingCard from "@/components/RecordingCard";
import {Link, router, useFocusEffect, useLocalSearchParams} from "expo-router";
import {getFunctions, httpsCallable} from "firebase/functions";
import {getApp} from "firebase/app";
import Modal from "react-native-modal";
import {useIsFocused} from "@react-navigation/core";

interface recording {
  name: string,
  fileUrl: string,
  id: string,
  transcription: string,
}

export default function RecordingsScreen() {
  const {readyToUpdate} = useLocalSearchParams();
  const [recordings, setRecordings] = useState<recording[]>([])
  const [modalVisible, setModalVisible] = useState(false);
  const [transcriptionText, setTranscriptionText] = useState("");
  const [recordingName, setRecordingName] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const app = getApp();
  const functions = getFunctions(app);
  const getRecordings = httpsCallable(functions, 'get_audios');

  const closeModal = () => {
    setModalVisible(false)
    setTranscriptionText("")
    setRecordingName("")
  }

  const switchEditing =() => {
    setEditing(!editing);
  }

  const updateRecordings = () => {
    setLoading(true)
    getRecordings()
      .then((result) => {
        // Read result of the Cloud Function.
        /** @type {any} */
        const data = result.data;
        // @ts-ignore
        // console.log(data[0].data)
        // const sanitizedMessage = data.text;

        // @ts-ignore
        setRecordings(data[0].data);
      }).finally(() => {
        setLoading(false);
    })
  }

  useFocusEffect(
    useCallback(() => {
      updateRecordings();
    }, [])
  )

  useEffect(() => {
    updateRecordings();
  }, [readyToUpdate])

  return (
    <SafeAreaView className={"flex h-screen-safe justify-center"}>
      <StatusBar
        animated={true}
        backgroundColor="#61dafb"
        barStyle={"default"}
        hidden={false}
      />

      <Modal
        isVisible={modalVisible}
        onBackdropPress={closeModal}
        backdropOpacity={0.7}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        className="justify-end m-0"
      >
        <View className="bg-white rounded-3xl pt-4 h-2/3">
          {/* Modal Header */}
          <View className="flex-row justify-between items-center px-6 pb-4 border-b border-slate-100">
            <View className="flex-row items-center space-x-3">
              <IconSymbol name="doc.text.fill" size={24} color="#3b82f6" />
              <Text className="text-xl font-semibold text-slate-800 ml-2">Recording Details</Text>
            </View>
            <TouchableOpacity onPress={closeModal} className="p-2">
              <IconSymbol name="xmark.circle.fill" size={24} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Content Area */}
          <View className="flex-1 px-6 py-5">
            {/* Recording Name */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-slate-500 mb-1">Title</Text>
              <Text
                className="text-lg text-slate-800 font-semibold"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {recordingName.substring(0, recordingName.length - 4)}
              </Text>
            </View>

            {/* Transcription Section */}
            <View className="flex-1">
              <Text className="text-sm font-medium text-slate-500 mb-3">Transcription</Text>
              <ScrollView
                className="bg-slate-50 rounded-xl p-4"
                showsVerticalScrollIndicator={false}
              >
                <Text className="text-slate-700 leading-6">
                  {transcriptionText || "No transcription available"}
                </Text>
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>

      <View className="flex-row justify-between items-center p-4">
        <Text className="text-3xl font-bold text-gray-800">My Recordings</Text>
        <View className="flex flex-row">
          <TouchableOpacity onPress={updateRecordings} className="mr-4">
            <IconSymbol name={"arrow.2.circlepath"} color={"blue"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={switchEditing}>
            <Text className="text-xl text-blue-600">{editing ? "Done" : "Edit"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? ( // ✅ Show spinner if loading
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-gray-600 mb-4">Loading recordings...</Text>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
      <ScrollView className="px-1">
        {recordings.map(
          (item) => (
            <RecordingCard
              name={item.name}
              fileUrl={item.fileUrl}
              key={item.id}
              transcription={item.transcription}
              id={item.id}
              editing={editing}
              setModalVisible={setModalVisible}
              setTranscriptionText={setTranscriptionText}
              setRecordingName={setRecordingName}
              updateRecordings={updateRecordings}/>
          )
        )}
      </ScrollView>
      )}
      <Link href={"/pages/recording"} className={"absolute bottom-0 right-0 p-4 m-4 bg-red-600 rounded-full shadow-lg justify-center items-center"}>
        <TouchableOpacity className={""}>
          <IconSymbol size={32} name={"microphone"} color={"white"}/>
        </TouchableOpacity>
      </Link>
    </SafeAreaView>
  );
}
