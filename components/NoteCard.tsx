import React, {StyleSheet, Image, Platform, View, ScrollView, Button, TouchableOpacity, SafeAreaView, Text} from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { router } from 'expo-router';
import summarizeText from "@/scripts/summarizeText";
import {getFunctions, httpsCallable} from "firebase/functions";
import {getApp} from "firebase/app";
import {Dispatch, SetStateAction, useState} from "react";

interface TodoFormProps {
  title: string,
  data: string,
  editing: boolean,
  key: string,
  id: string,
  summary: string,
  setModalVisible: Dispatch<SetStateAction<boolean>>,
  setSummaryText: Dispatch<SetStateAction<string>>,
  setNoteName: Dispatch<SetStateAction<string>>,
  updateNotes: () => void;
};

export default function NoteCard(props: TodoFormProps) {
  const data = props.data;
  const id = props.id;
  const name = props.title;

  const app = getApp();
  const functions = getFunctions(app);
  const deleteNote = httpsCallable(functions, 'delete_note');
  const [hasBeenSummarized, setHasBeenSummarized] = useState(props.summary != "");
  const [summary, setSummary] = useState("");
  const [deleting, setDeleting] = useState(false);

  const deleteItem = () => {
    setDeleting(true);
    deleteNote({id: props.id}).then(
      (response) => {
        console.log(response.data)
        props.updateNotes()
      }
    )
  }

  const openNote = async () => {
    // Use XMLHttpRequest or another method to fetch the file
    const text = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => resolve(xhr.responseText);
      xhr.onerror = () => reject(new Error('Failed to fetch HTML file'));
      xhr.open('GET', data);
      xhr.send();
    });

    console.log('HTML Content:', text);

    // @ts-ignore
    router.push({pathname: '/pages/notetaking', params: {id: id, data: text, previousName: name}})
  }

  const summarizeNote = () => {
    summarizeText(props.data, props.id).then(r =>
    {
      console.log(r)
      setSummary(r)
      setHasBeenSummarized(true)
    })
  }

  const viewSummary = () => {
    props.setSummaryText(summary)
    props.setNoteName(props.title)
    props.setModalVisible(true);
  }

  return(
    <View  className={"p-2 rounded-lg flex align-middle items-center flex-row justify-between bg-white drop-shadow-md m-2 h-20"}>
      {
        deleting
          ?
          (
            <View className={"p-2"}>
              <Text className={"text-lg"}>
                Deleting...
              </Text>
            </View>
          )
          :
          (
          <TouchableOpacity onPress={openNote} onLongPress={viewSummary}>
            <Text className={"p-2 text-xl font-bold text-black"}>
              {props.title.substring(0, props.title.length - 5)}
            </Text>
          </TouchableOpacity>
          )
      }

      <View className={"p-2 flex flex-row"}>
        {
          !hasBeenSummarized &&
            <TouchableOpacity className={`${props.editing ? 'mr-8' : ''}`} onPress={summarizeNote}>
                <IconSymbol size={28} name={"list.clipboard"} color={"black"}/>
            </TouchableOpacity>
        }
        {props.editing &&
            <TouchableOpacity onPress={deleteItem}>
                <IconSymbol size={28} name={"trash.fill"} color={"red"}/>
            </TouchableOpacity>
        }
      </View>
    </View>
  );
}