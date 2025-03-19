import {Dispatch, SetStateAction, useEffect, useState} from 'react';
import {View, StyleSheet, TouchableOpacity, SafeAreaView, Image, TextInput, Text} from 'react-native';
import { Audio } from 'expo-av';
import {IconSymbol} from "@/components/ui/IconSymbol";
import { getFunctions, httpsCallable } from "firebase/functions";
import {getApp} from "firebase/app";
import * as FileSystem from 'expo-file-system';
import Modal from "react-native-modal";
import {router, useLocalSearchParams} from "expo-router";


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

  const saveRecording = () => {
    addRecording({
      fileName: `${name || Date.now()}.m4a`,
      audioData: base64Data
    })
      .then((result) => {
        console.log(result.data);
      });

    hideModal();

    setShouldUpdate("yes")

    router.push({pathname: "/(tabs)/recordings", params: {readyToUpdate: shouldUpdate}})
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
  }, [])


  return(
    <SafeAreaView className={"flex justify-center items-center bg-[#ecf0f1] p-10 h-screen-safe"}>
      <Modal
        isVisible={modalVisible}
        onBackdropPress={hideModal}
        className={"flex justify-center items-center "}
      >
        <View className={"flex justify-center items-center bg-white h-1/3 w-3/4 rounded-lg p-10"}>
          <TextInput
            onChangeText={setName}
            value={name}
            placeholder={"New Recording Name"}
            placeholderTextColor={"#A9A9A9"}
            className={"border-2 border-black p-8 m-2 rounded-md w-auto text-black"}
          >

          </TextInput>

          <TouchableOpacity onPress={saveRecording} className={"flex justify-center items-center bg-green-700 h-12 w-full p-4 m-4 rounded-lg"}>
            <Text className={"color-white"}>
              Stop Recording
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>

        <TouchableOpacity
          onPress={isRecording ? stopRecording : startRecording}
        >
          {isRecording &&
              <IconSymbol size={100} name="record.circle.fill" color={"red"} />
          }

          {!isRecording &&
              <IconSymbol size={100} name="record.circle.fill" color={"black"} />
          }

        </TouchableOpacity>
    </SafeAreaView>
  );
}