import {StyleSheet, Image, Platform, View, ScrollView, Button, TouchableOpacity, SafeAreaView} from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import {Link} from "expo-router";

export default function HomeScreen() {
  return (
    <SafeAreaView className={"flex h-screen-safe justify-center"}>
      <ScrollView className={""}>
      </ScrollView>
      <Link href={"/pages/notetaking"} className={"absolute bottom-0 right-0 p-10"}>
        <TouchableOpacity className={""}>
          <IconSymbol size={52} name={"square.and.pencil"} color={"white"}/>
        </TouchableOpacity>
      </Link>
    </SafeAreaView>
  );
}
