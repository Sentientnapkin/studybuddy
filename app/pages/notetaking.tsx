import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Appearance,
  Button,
  ColorSchemeName, Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {actions, FONT_SIZE, getContentCSS, RichEditor, RichToolbar} from 'react-native-pell-rich-editor';
import {XMath} from '@wxik/core';
import {InsertLinkModal} from '@/components/insertLink';
import {EmojiView} from '@/components/Emoji';
import {Link, router, useLocalSearchParams} from "expo-router";
import {IconSymbol} from "@/components/ui/IconSymbol";
import { getFunctions, httpsCallable } from "firebase/functions";
import {getApp} from "firebase/app";
import {doc, getFirestore, updateDoc} from "firebase/firestore";

type IconRecord = {
  selected: boolean;
  disabled: boolean;
  tintColor: any;
  iconSize: number;
};

interface IProps {
  navigation: INavigation;
  theme?: ColorSchemeName;
  id: string,
  data: string,
}

interface INavigation {
  push: (key: any, params?: Record<string, any>) => void;
}

interface RefLinkModal {
  setModalVisible: (visile: boolean) => void;
}

const imageList = [
  'https://img.lesmao.vip/k/h256/R/MeiTu/1293.jpg',
  'https://pbs.twimg.com/profile_images/1242293847918391296/6uUsvfJZ.png',
  'https://img.lesmao.vip/k/h256/R/MeiTu/1297.jpg',
  'https://img.lesmao.vip/k/h256/R/MeiTu/1292.jpg',
];

const phizIcon = require('../../assets/images/icon.png');
const htmlIcon = require('../../assets/images/html.png');

function createContentStyle(theme: string) {
  // Can be selected for more situations (cssText or contentCSSText).
  const contentStyle = {
    backgroundColor: '#2e3847',
    color: '#fff',
    caretColor: 'red', // initial valid// initial valid
    placeholderColor: 'gray',
    // cssText: '#editor {background-color: #f3f3f3}', // initial valid
    contentCSSText: 'font-size: 16px; min-height: 200px;', // initial valid
  };
  if (theme === 'light') {
    contentStyle.backgroundColor = '#fff';
    contentStyle.color = '#000033';
    contentStyle.placeholderColor = '#a9a9a9';
  }
  return contentStyle;
}

export default function NoteTakingScreen(props: IProps) {
  const {theme: initTheme = Appearance.getColorScheme(), navigation} = props;
  const {id, data, previousName} = useLocalSearchParams();

  const initHTML = (data == undefined) ? `` : data;
  const contentRef = useRef(initHTML);

  const richText = useRef<RichEditor>(null);
  const linkModal = useRef<RefLinkModal>();
  const scrollRef = useRef<ScrollView>(null);
  // save on html
  const [name, setName] = useState(previousName);

  const [shouldUpdate, setShouldUpdate] = useState("")


  const [theme, setTheme] = useState("light");
  const [emojiVisible, setEmojiVisible] = useState(false);
  const [disabled, setDisable] = useState(false);
  const contentStyle = useMemo(() => createContentStyle(theme), [theme]);

  const app = getApp();
  const functions = getFunctions(app);
  const addNote = httpsCallable(functions, 'upload_note');
  const addBlob = httpsCallable(functions, 'upload_generic_note');
  const db = getFirestore(app)

  // on save to preview
  const handleSave = async () => {
    setShouldUpdate("yes")

    if (id == undefined) {
      addNote({ fileName: `${name}.html`, note: contentRef.current })
        .then((result) => {
          // Read result of the Cloud Function.
          /** @type {any} */
          // console.log(result.data);
          router.push({pathname: "/(tabs)", params: {readyToUpdate: shouldUpdate}})
        });
    } else {
      const noteRef = doc(db, "notes", id);

      addBlob({ fileName: `${name}.html`, note: contentRef.current })
        .then(async (result) => {
          // Read result of the Cloud Function.
          /** @type {any} */
          // console.log(result.data);

          await updateDoc(noteRef, {
            name: name,
            fileUrl: result.data[0].url,
          })

          router.push({pathname: "/(tabs)", params: {readyToUpdate: shouldUpdate}})
        });
    }
  };

  const handleHome = useCallback(() => {
    navigation.push('index');
  }, [navigation]);

  // editor change data
  const handleChange = useCallback((html: string) => {
    // save html to content ref;
    contentRef.current = html;
  }, []);

  // theme change to editor color
  const onTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme]);

  const onDisabled = useCallback(() => {
    setDisable(!disabled);
  }, [disabled]);

  const editorInitializedCallback = useCallback(() => {
    // richText.current.registerToolbar(function (items) {
    // console.log('Toolbar click, selected items (insert end callback):', items);
    // });
  }, []);

  const onKeyHide = useCallback(() => {}, []);

  const onKeyShow = useCallback(() => {
    TextInput.State.currentlyFocusedInput() && setEmojiVisible(false);
  }, []);

  // editor height change
  const handleHeightChange = useCallback((height: number) => {
    console.log('editor height change:', height);
  }, []);

  const handleInsertEmoji = useCallback((emoji: string) => {
    richText.current?.insertText(emoji);
    richText.current?.blurContentEditor();
  }, []);

  const handleEmoji = useCallback(() => {
    Keyboard.dismiss();
    richText.current?.blurContentEditor();
    setEmojiVisible(!emojiVisible);
  }, [emojiVisible]);

  const handleInsertVideo = useCallback(() => {
    richText.current?.insertVideo(
      'https://mdn.github.io/learning-area/html/multimedia-and-embedding/video-and-audio-content/rabbit320.mp4',
      'width: 50%;',
    );
  }, []);

  const handleInsertHTML = useCallback(() => {
    // this.richText.current?.insertHTML(
    //     `<span onclick="alert(2)" style="color: blue; padding:0 10px;" contenteditable="false">HTML</span>`,
    // );
    richText.current?.insertHTML(
      `<div style="padding:10px 0;" contentEditable="false">
                <iframe  width="100%" height="220"  src="https://www.youtube.com/embed/6FrNXgXlCGA" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>`,
    );
  }, []);

  const onPressAddImage = useCallback(() => {
    // insert URL
    richText.current?.insertImage(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/100px-React-icon.svg.png',
      'background: gray;',
    );
    // insert base64
    // this.richText.current?.insertImage(`data:${image.mime};base64,${image.data}`);
  }, []);

  const onInsertLink = useCallback(() => {
    // this.richText.current?.insertLink('Google', 'http://google.com');
    linkModal.current?.setModalVisible(true);
  }, []);

  const onLinkDone = useCallback(({title, url}: {title?: string; url?: string}) => {
    if (title && url) {
      richText.current?.insertLink(title, url);
    }
  }, []);

  const handleFontSize = useCallback(() => {
    // 1=  10px, 2 = 13px, 3 = 16px, 4 = 18px, 5 = 24px, 6 = 32px, 7 = 48px;
    let size = [1, 2, 3, 4, 5, 6, 7];
    richText.current?.setFontSize(size[XMath.random(size.length - 1)] as FONT_SIZE);
  }, []);

  const handleForeColor = useCallback(() => {
    richText.current?.setForeColor('blue');
  }, []);

  const handleHaliteColor = useCallback(() => {
    richText.current?.setHiliteColor('red');
  }, []);

  const handlePaste = useCallback((data: any) => {
    console.log('Paste:', data);
  }, []);

  // @deprecated Android keyCode 229
  const handleKeyUp = useCallback(() => {
    // console.log('KeyUp:', data);
  }, []);

  // @deprecated Android keyCode 229
  const handleKeyDown = useCallback(() => {
    // console.log('KeyDown:', data);
  }, []);

  const handleInput = useCallback(() => {
    // console.log(inputType, data)
  }, []);

  const handleMessage = useCallback(({type, id, data}: {type: string; id: string; data?: any}) => {
    switch (type) {
      case 'ImgClick':
        richText.current?.commandDOM(`$('#${id}').src="${imageList[XMath.random(imageList.length - 1)]}"`);
        break;
      case 'TitleClick':
        const color = ['red', 'blue', 'gray', 'yellow', 'coral'];

        // command: $ = document.querySelector
        richText.current?.commandDOM(`$('#${id}').style.color='${color[XMath.random(color.length - 1)]}'`);
        break;
      case 'SwitchImage':
        break;
    }
    console.log('onMessage', type, id, data);
  }, []);

  const handleFocus = useCallback(() => {
    console.log('editor focus');
  }, []);

  const handleBlur = useCallback(() => {
    console.log('editor blur');
  }, []);

  const handleCursorPosition = useCallback((scrollY: number) => {
    // Positioning scroll bar
    scrollRef.current!.scrollTo({y: scrollY - 30, animated: true});
  }, []);

  useEffect(() => {
    setShouldUpdate("no")
    setTheme('light')
    let listener = [
      Keyboard.addListener('keyboardDidShow', onKeyShow),
      Keyboard.addListener('keyboardDidHide', onKeyHide),
    ];
    return () => {
      listener.forEach(it => it.remove());
    };
  }, [onKeyHide, onKeyShow]);

  const {backgroundColor, color, placeholderColor} = contentStyle;
  const dark = theme === 'dark';

  return (
    <SafeAreaView style={[styles.container, dark && styles.darkBack]}>
      <StatusBar barStyle={!dark ? 'dark-content' : 'light-content'} />
      <InsertLinkModal
        placeholderColor={placeholderColor}
        color={color}
        backgroundColor={backgroundColor}
        onDone={onLinkDone}
        forwardRef={linkModal}
      />
      <ScrollView
        style={[styles.scroll, dark && styles.scrollDark]}
        keyboardShouldPersistTaps='handled'
        keyboardDismissMode={"interactive"}
        ref={scrollRef}
        nestedScrollEnabled={true}
        scrollEventThrottle={20}>
        <View className={"flex justify-between items-start bg-[#efefef] p-5 flex-row"}>
          <Link href={"/(tabs)"} className={"flex-row justify-items-center"} >
            <IconSymbol name={"chevron.backward"} color={"black"} size={14}/>
            <Text className={"text-xl"}>Back</Text>
          </Link>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={(previousName == undefined || previousName == "") ? "Set Name Here" : previousName}
            placeholderTextColor={"black"}
          />

          <TouchableOpacity onPress={handleSave} className={"flex-row justify-items-center"}>
            <Text className={"text-xl"}>
              Save
            </Text>
          </TouchableOpacity>


        </View>
        <RichEditor
          // initialFocus={true}
          initialFocus={false}
          firstFocusEnd={false}
          disabled={disabled}
          editorStyle={contentStyle} // default light style
          ref={richText}
          style={styles.rich}
          useContainer={true}
          initialHeight={400}
          enterKeyHint={'done'}
          // containerStyle={{borderRadius: 24}}
          placeholder={'please input content'}
          initialContentHTML={initHTML}
          editorInitializedCallback={editorInitializedCallback}
          onChange={handleChange}
          onHeightChange={handleHeightChange}
          onPaste={handlePaste}
          onKeyUp={handleKeyUp}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          onMessage={handleMessage}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onCursorPosition={handleCursorPosition}
          pasteAsPlainText={true}
        />
      </ScrollView>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <RichToolbar
          style={[styles.richBar, dark && styles.richBarDark]}
          flatContainerStyle={styles.flatStyle}
          editor={richText}
          disabled={disabled}
          // iconTint={color}
          selectedIconTint={'#2095F2'}
          disabledIconTint={'#bfbfbf'}
          onPressAddImage={onPressAddImage}
          onInsertLink={onInsertLink}
          // iconSize={24}
          // iconGap={10}
          actions={[

            actions.undo,
            actions.redo,
            actions.setBold,
            actions.setItalic,
            actions.setUnderline,
            actions.indent,
            actions.outdent,
            actions.insertLink,
            actions.insertImage,
            actions.setStrikethrough,
            actions.insertBulletsList,
            actions.insertOrderedList,
            actions.blockquote,
            actions.alignLeft,
            actions.alignCenter,
            actions.alignRight,
            actions.code,

            'insertEmoji',
            'insertHTML',
            'fontSize',
          ]} // default defaultActions
          iconMap={{
            insertEmoji: phizIcon,
            [actions.foreColor]: () => <Text style={[styles.tib, {color: 'blue'}]}>FC</Text>,
            [actions.hiliteColor]: ({tintColor}: IconRecord) => (
              <Text style={[styles.tib, {color: tintColor, backgroundColor: 'red'}]}>BC</Text>
            ),
            [actions.heading1]: ({tintColor}: IconRecord) => <Text style={[styles.tib, {color: tintColor}]}>H1</Text>,
            [actions.heading4]: ({tintColor}: IconRecord) => <Text style={[styles.tib, {color: tintColor}]}>H4</Text>,
            insertHTML: htmlIcon,
          }}
          insertEmoji={handleEmoji}
          insertHTML={handleInsertHTML}
          insertVideo={handleInsertVideo}
          fontSize={handleFontSize}
          foreColor={handleForeColor}
          hiliteColor={handleHaliteColor}
        />
        {emojiVisible && <EmojiView onSelect={handleInsertEmoji} />}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


const ScreenHeight = Dimensions.get("window").height;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#efefef',
  },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 5,
  },
  rich: {
    height: ScreenHeight,
    flex: 1,
  },
  topVi: {
    backgroundColor: '#fafafa',
  },
  richBar: {
    borderColor: '#efefef',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  richBarDark: {
    backgroundColor: '#191d20',
    borderColor: '#696969',
  },
  scroll: {
    backgroundColor: '#ffffff',
  },
  scrollDark: {
    backgroundColor: '#2e3847',
  },
  darkBack: {
    backgroundColor: '#191d20',
  },
  item: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#e8e8e8',
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
    paddingHorizontal: 15,
  },

  input: {
    flex: 1,
  },

  tib: {
    textAlign: 'center',
    color: '#515156',
  },

  flatStyle: {
    paddingHorizontal: 12,
  },
});