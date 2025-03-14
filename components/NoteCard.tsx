import React, {StyleSheet, Image, Platform, View, ScrollView, Button, TouchableOpacity, SafeAreaView, Text} from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { router } from 'expo-router';
import summarizeText from "@/scripts/summarizeText";
import {getFunctions, httpsCallable} from "firebase/functions";
import {getApp} from "firebase/app";
import {Dispatch, SetStateAction} from "react";

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
};

export default function NoteCard(props: TodoFormProps) {
  const data = props.data;
  const id = props.id;
  const name = props.title;

  const app = getApp();
  const functions = getFunctions(app);
  const deleteNote = httpsCallable(functions, 'delete_note');
  const hasBeenSummarized = props.summary == "";

  const deleteItem = () => {
    deleteNote({id: props.id}).then(
      (response) => {
        console.log(response.data)
        // props.setChanged(true)
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
    summarizeText(props.data, props.id).then(r => console.log(r))
  }

  const viewSummary = () => {
    props.setSummaryText(props.summary)
    props.setNoteName(props.title)
    props.setModalVisible(true);
  }

  return(
    <View  className={"relative flex flex-row justify-between bg-gradient-to-r bg-gray-500 rounded-md text-center p-8 m-4 justify-between items-center"}>
      <TouchableOpacity onPress={openNote} onLongPress={viewSummary}>
        <Text>
          {props.title}
        </Text>
        {props.editing &&
            <TouchableOpacity onPress={deleteItem} className={"absolute right-0 p-4"}>
                <IconSymbol name={"x.circle"} color={"red"}/>
            </TouchableOpacity>
        }
      </TouchableOpacity>

      {
        hasBeenSummarized &&
          <TouchableOpacity className={""} onPress={summarizeNote}>
              <IconSymbol size={28} name={"pencil"} color={"black"}/>
          </TouchableOpacity>
      }
    </View>
  );
}