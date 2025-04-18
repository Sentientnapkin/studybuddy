import React, {Dispatch, SetStateAction, useEffect, useState} from 'react';
import {View, StyleSheet, TouchableOpacity, SafeAreaView, Image, TextInput, Text} from 'react-native';
import { Audio } from 'expo-av';
import {IconSymbol} from "@/components/ui/IconSymbol";
import { getFunctions, httpsCallable } from "firebase/functions";
import {getApp} from "firebase/app";
import * as FileSystem from 'expo-file-system';
import Modal from "react-native-modal";
import {Link, router, useLocalSearchParams} from "expo-router";


export default function RecordingScreen() {
  const [recording, setRecording] = useState();
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [isRecording, setIsRecording] = useState(false)
  const [name, setName] = useState("default recording name")
  const [modalVisible, setModalVisible] = useState(false)
  const [base64Data, setBase64Data] = useState("")

  const [shouldUpdate, setShouldUpdate] = useState("")

  const app = getApp();
  const functions = getFunctions(app);
  const addRecording = httpsCallable(functions, 'store_audio_metadata');

  const showModal = () => {
    setModalVisible(true)
  }

  const hideModal = () => {
    setModalVisible(false)
  }

  const saveRecording = async () => {
    setShouldUpdate("yes")

    addRecording({
      fileName: `${name || Date.now()}.m4a`,
      audioData: base64Data
    })
      .then((result) => {
        // console.log(result.data);
      });

    hideModal();

    router.navigate({pathname: "/(tabs)/recordings", params: {readyToUpdate: shouldUpdate}})
  }

  async function startRecording() {
    try {
      // @ts-ignore
      if (permissionResponse.status !== 'granted') {
        console.log('Requesting permission..');
        await requestPermission();
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      // @ts-ignore
      setRecording(recording);
      setIsRecording(true);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    console.log('Stopping recording..');
    setRecording(undefined);
    // @ts-ignore
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync(
      {
        allowsRecordingIOS: false,
      }
    );
    // @ts-ignore
    const uri = recording.getURI();

    const base64Data = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64
    });

    setBase64Data(base64Data)

    setIsRecording(false)

    console.log('Recording stopped and stored at', uri);

    showModal()
  }

  useEffect(() => {
    setShouldUpdate("no")
  }, [isRecording])

  return(
    <SafeAreaView className={"flex-1 justify-center items-center bg-slate-700 "}>
      {/* Save Recording Modal */}
      <Modal
        isVisible={modalVisible}
        onBackdropPress={hideModal}
        backdropOpacity={0.7}
        animationIn="zoomIn"
        animationOut="zoomOut"
      >
        <View className="bg-white rounded-2xl p-6 mx-4 mb-32">
          <Text className="text-2xl font-bold text-slate-800 mb-4">Save Recording</Text>

          <Text className="text-slate-600 mb-2">Recording Name</Text>
          <TextInput
            onChangeText={setName}
            value={name}
            placeholder="Enter recording name..."
            placeholderTextColor="#94a3b8"
            className="border border-slate-300 rounded-lg px-4 py-3 mb-6
                     text-slate-800 focus:border-blue-500"
            autoFocus
          />

          <View className="flex-row justify-between space-x-3">
            <TouchableOpacity
              onPress={hideModal}
              className="px-6 py-3 rounded-lg bg-slate-100 active:bg-slate-200"
            >
              <Text className="text-slate-600 font-medium">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={saveRecording}
              className="px-6 py-3 rounded-lg bg-blue-500 active:bg-blue-600"
            >
              <Text className="text-white font-medium">Save Recording</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/** Back Button **/}
      <Link href={"/(tabs)/recordings"} className={"absolute top-12 left-0 p-4 m-4 bg-transparent justify-center items-center rounded-lg"}>
        <TouchableOpacity className={"flex flex-row items-center justify-center"}>
          <IconSymbol name={"chevron.backward"} color={"white"} size={32}/>
        </TouchableOpacity>
      </Link>

      {/* Main Content */}
      <View className="flex-1 justify-center items-center">
        {/* Status Indicator */}
        <View className="mb-8">
          <Text className="text-slate-100 text-lg font-semibold">
            {isRecording ? 'Recording...' : 'Ready to Record'}
          </Text>
        </View>

        {
          isRecording &&
            <TouchableOpacity
                onPress={isRecording ? stopRecording : startRecording}
                className={`w-32 h-32 rounded-full justify-center items-center 
                bg-red-500 animate-pulse shadow-lg shadow-red-500/50`}
                activeOpacity={0.8}
            >
                <IconSymbol
                    size={64}
                    name="record.circle.fill"
                    color={'white'}
                />
            </TouchableOpacity>
        }

        {
          !isRecording &&
            <TouchableOpacity
                onPress={isRecording ? stopRecording : startRecording}
                className={`w-32 h-32 rounded-full justify-center items-center
                bg-slate-100 shadow-lg shadow-slate-100/20`}
                activeOpacity={0.8}
            >
                <IconSymbol
                    size={64}
                    name="record.circle.fill"
                    color={'#ef4444'}
                />
            </TouchableOpacity>
        }

        {/* Helper Text */}
        <Text className="text-slate-400 mt-6 text-center px-8">
          {isRecording ? 'Tap to stop recording' : 'Tap the button above to start a new recording'}
        </Text>
      </View>
    </SafeAreaView>
  );
}