import React, { useLayoutEffect, useState, useEffect, useContext } from 'react';
import { Alert, Dimensions, Keyboard, StyleSheet, View } from 'react-native';
import { GiftedChat, Bubble } from 'react-native-gifted-chat'
import ReportModal from './ReportModal';

import * as firebase from 'firebase';
import firestore from 'firebase/firestore';

import { StoreContext } from '../../../contexts/storeContext';

import { registerForPushNotifications, sendPushNotification } from '../../../utils.js';
import { addPushNotification, sendMessage, sendMessageAndOverwrite } from '../../../firebase.js';

const turquoise = "#4ECDC4";

const { height } = Dimensions.get("window");

import ConversationHeader from './ConversationHeader';

const Conversation = (props) => {

  const store = useContext(StoreContext);
  const user = store.user;
  const userId = user._id;
  const userName = user.name;
  const userAvatar = user.photo;

  const convo = props.route.params.convo; // userChat data

  const dot = props.route.params.dot;
  const chatId = convo.chatId ? convo.chatId : convo.id;

  let otherPersonArray = convo.usersArr.filter((item, i) => item.userId !== userId);
  if (otherPersonArray.length === 0) {
    otherPersonArray = convo.usersArr.slice();
  }

  let unsubscribe;

  {/* States */}
  const [composerText, setComposerText] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [reportModal, setReportModal] = useState(false);
  const [usersArr, setUsersArr] = useState([]);
  const [gameLoc, setGameLoc] = useState({});

  {/* Set Header */}
  useLayoutEffect(() => {
    props.navigation.setOptions({
      headerTitle: () => <ConversationHeader otherPersonArray={ otherPersonArray }  userName={ userName } handleMenu={ handleMenu } openUsersList={ openUsersList } reportModal={ reportModal } setReportModal={ setReportModal } navigation={ props.navigation } />,
      headerLeft: null
    });
  }, [loaded]);

  useEffect(() => {
    unsubscribe = firebase.firestore().collection("conversations").doc(chatId)
    .onSnapshot((snapshot) => {
      const d = snapshot.data();

      if (d) {
        let messages0 = d.messages;
        messages0.reverse();

        setUsersArr(d.userObjects);
        setMessages(messages0);
        setGameLoc(d.coordinates);
        setLoaded(true);
      }
      else {
        // conversation has been deleted, but listener went down
        Alert.alert("", "This conversation no longer exists", [
          {text: "OK", onPress: () => {
            // Step 1: Delete from userChat locally
            const userChats0 = store.userChats.slice();
            const userChats1 = userChats0.filter((item) => item.id !== chatId);
            store.setUserChats(userChats1);

            // Step 2: pop()
            props.navigation.pop();
          }}
        ])
      }
    });

    return () => {
      unsubscribe !== undefined ? unsubscribe() : console.log("chatId " + chatId + " listener unloaded before being fully initialized");
    }
  }, []);

  useEffect(() => {
    if (loaded) {
      if (dot) {
        firebase.firestore().collection("userChats").doc(userId).update({
          [`${chatId}.readByReceiver`]: true
        });
      }
    }
  }, [loaded]);


  {/* Functions */}

  const handleMenu = () => {
    Keyboard.dismiss();
    setReportModal(true);
  }


  const handleReport2 = async () => {

    const userInitiatingBlock = userId;
    const userInitiatingBlockName = userName;
    // const convo = convo; // already defined above

    try {
      const res1 = await props.route.params.remove(convo);
      const res3 = fetch("https://us-central1-catchr-f539d.cloudfunctions.net/sendEmail", {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({ userInitiatingBlock, userInitiatingBlockName, userBlockedArr: [], messages })
      });

      Alert.alert("", "Thanks. Conversation reported.", [
        { text: "OK", onPress: () => {
          setReportModal(false);
          props.navigation.pop()
        }},
      ]);

    }
    catch (e) {
      console.log("handleBlock error : ", e);
      Alert.alert("", "There was an error. Please try again.")
    }
  }

  const handleUnmatch2 = async () => {
    try {
      const res1 = await props.route.params.remove(convo);
      // props.navigation.pop();
    }
    catch(e) {
      console.log("handleUnmatch error : ", e);
      Alert.alert("", "There was an error. Please try again.");
    }
  }

  const showOnMap = () => {
    setReportModal(false);
    props.navigation.navigate("MapLoc", { userLat: gameLoc.latitude, userLng: gameLoc.longitude });
  }


  const onSend = async (msg) => {

    // Step 0: Compose message object
    const text = msg[0].text;
    // const chatId = convo.chatId;

    const message = {
      _id: "k" + Date.now() + Math.random(),
      text: text,
      createdAt: Date.now(),
      user: {
        _id: userId,
        name: userName,
        avatar: userAvatar
      }
    }

    // Step 0.1: Compose userChat update object
    const userChatUpdate = {
      lastMessageCreatedAt: new Date(),
      lastMessageFromId: userId,
      lastMessageFromName: userName,
      lastMessageText: text,
      readByReceiver: false
    }

    // Step 0.2: Compose array of notifications
    const newUsersArray = usersArr.filter((item, i) => item._id !== userId && item.notificationToken !== "-1");
    const tokensArr = newUsersArray.map((item, i) => item.notificationToken);
    const notificationsArr = tokensArr.map((item, i) => {
      return {
        to: item,
        sound: 'default',
        title: "You have received a new message!",
        // body,
        // data: { data: 'goes here' }
      };
    });

    // Step 0.3: Check length of current messages array. If larger than 250, then delete last 40 messages and override the array with the new one
    // If less than 250, then just add message to array
    let overwrite = false;
    let newMessagesArr = [];

    if (messages.length >= 250) { // <-- this is the messages array in state
      overwrite = true;

      // slice out the previous 20 items
      newMessagesArr = messages.slice(0, 200);
    }

    try {
      const res = overwrite ? await sendMessageAndOverwrite(chatId, newMessagesArr, userChatUpdate, convo.usersArr) : await sendMessage(chatId, message, userChatUpdate, convo.usersArr);
      if (res) {
        // setMessages(prevState => GiftedChat.append(prevState, [message]));
        setComposerText("");
        sendPushNotification(notificationsArr);
        const token = await registerForPushNotifications(userId, user.notificationToken);
        if (token !== user.notificationToken) {
          const res = await addPushNotification(userId, token);
        }
      }
      else {
        Alert.alert("", "There was an error. Please try again.");
      }
    }
    catch (e) {
      Alert.alert("", "There was an error 2. Please try again.");
    }
  }


  const openUsersList = () => {
    if (otherPersonArray.length > 1) {
      let newUsersArray = usersArr.filter((item, i) => item._id !== userId);
      if (newUsersArray.length === 0) {
        newUsersArray = usersArr;
      }
      props.navigation.navigate("UsersList", { users: newUsersArray });
    }
    else {
      let newUsersArray = usersArr.filter((item, i) => item._id !== userId);
      if (newUsersArray.length === 0) {
        newUsersArray = usersArr;
      }
      props.navigation.navigate("ProfileFull", { users: newUsersArray });
    }
  }


  {/* Animated Styles */}

  return (
    <View style={ styles.view }>
      <GiftedChat
        messages={messages}
        onSend={newMessage => onSend(newMessage)}
        animated={ true }
        alwaysShowSend={ true }
        // alignTop={ true }
        dateFormat="lll"
        user={{
          _id: userId,
          name: userName,
          avatar: userAvatar
        }}
        onInputTextChanged={(t) => {
          if (t.length < 400) {
            setComposerText(t);
          }
        }}
        placeholder="Type a message"
        maxInputLength={ 380 }
        renderBubble={(props) => {
          return <Bubble
            {...props }
            wrapperStyle={{ left: styles.bubbleLeft, right: styles.bubbleRight }}
            textStyle={{ left: styles.bubbleLeftText, right: styles.bubbleRightText }}
            renderTime={() => null }
          />
        }}
      />

      { reportModal && <ReportModal
        showOnMap={ showOnMap } 
        len={ otherPersonArray.length }
        reportModal={ reportModal }
        setReportModal={ setReportModal }
        handleReport2={ handleReport2 }
        handleUnmatch2={ handleUnmatch2 }
        height={ height }
      /> }

    </View>
  )
}

const styles = StyleSheet.create({
  bubbleLeft: {
    backgroundColor: turquoise
  },
  bubbleLeftText: {
    color: "white"
  },
  bubbleRight: {
    backgroundColor: "#e3e3e3"
  },
  bubbleRightText: {
    color: "#333"
  },
  view: {
    flex: 1
  }
});

export default Conversation;