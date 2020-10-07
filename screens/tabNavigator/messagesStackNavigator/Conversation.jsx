import React, { useLayoutEffect, useState, useEffect, useContext } from 'react';
import { Alert, Dimensions, Keyboard, StyleSheet, View } from 'react-native';
import { GiftedChat, Bubble } from 'react-native-gifted-chat'
import ReportModal from './ReportModal';

import * as firebase from 'firebase';
import firestore from 'firebase/firestore';

import { StoreContext } from '../../../contexts/storeContext';

import { registerForPushNotifications, sendPushNotification } from '../../../utils.js';

const turquoise = "#4ECDC4";

const { height } = Dimensions.get("window");

import ConversationHeader from './ConversationHeader';
import { sendMessage } from '../../../firebase.js';

const Conversation = (props) => {

  const store = useContext(StoreContext);
  const user = store.user;
  const userId = user._id;
  const userName = user.name;
  const userAvatar = user.photo;

  const convo = props.route.params.convo; // userChat data

  const dot = props.route.params.dot;
  const chatId = convo.chatId;

  const otherPersonArray = convo.usersArr.filter((item, i) => item.userId !== userId);
  const otherPersonIdsArray = otherPersonArray.map((item, i) => {
    if (item.notificationToken !== "-1") {
      return item._id;
    }
  });

  let unsubscribe;

  {/* States */}
  const [composerText, setComposerText] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [reportModal, setReportModal] = useState(false);
  const [usersArr, setUsersArr] = useState([]);

  {/* Set Header */}
  useLayoutEffect(() => {
    props.navigation.setOptions({
      headerTitle: () => <ConversationHeader otherPersonArray={ otherPersonArray }  userName={ userName } handleMenu={ handleMenu } openUsersList={ openUsersList } reportModal={ reportModal } setReportModal={ setReportModal } navigation={ props.navigation } />
    });
  }, [loaded]);

  useEffect(() => {
    unsubscribe = firebase.firestore().collection("conversations").doc(chatId)
    .onSnapshot((snapshot) => {
      const d = snapshot.data();
      let messages0 = d.messages;
      messages0.reverse();
      setUsersArr(d.userObjects);
      setMessages(messages0);
      setLoaded(true);
    });

    if (dot) {
      firebase.firestore().collection("userChats").doc(userId).update({
        [`${chatId}.readByReceiver`]: true
      });
    }

    return () => {
      unsubscribe !== undefined ? unsubscribe() : console.log("chatId " + chatId + " listener unloaded before being fully initialized");
    }
  }, []);


  {/* Functions */}

  const handleMenu = () => {
    Keyboard.dismiss();
    setReportModal(true);
  }


  const handleBlock2 = () => {

    const userInitiatingBlock = userId;
    const userInitiatingBlockName = userName;
    const userBlockedArr = otherPersonArray;
    // const convo = convo; // already defined above

    const newUsersArray = convo.usersArr.filter((item, i) => item !== userId)
    // Step 1: Remove user from convo in Firebase
    firebase.firestore().collection("conversations").doc(chatId).update({ usersArray: newUsersArray })
    .then(() => {
      // Step 2: Add blocked users to blockedUsers
      let promises = [];
      for (let i = 0; i < newUsersArray.length; i++) {
        promises.push(firebase.firestore().collection("users").doc(userId).update({
          blockedUsers: firebase.firestore.FieldValue.arrayUnion(newUsersArray[i])
        }));

        // add current user to OTHER users' blocked users (so this user doesn't show up for them either)
        promises.push(firebase.firestore.collection("users").doc(newUsersArray[i]).update({
          blockedUsers: firebase.firestore.FieldValue.arrayUnion(userId)
        }))


      }

      return Promise.all(promises);
    })
    .then(() => {
      // Step 3: Send to Cloud function to send an email to myself
      return fetch("https://us-central1-catchr-f539d.cloudfunctions.net/sendEmail", {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({ userInitiatingBlock, userInitiatingBlockName, userBlockedArr, messages })
      })
    })
    .then(() => {
      // Step 4: Delete from local variables
      const newState = store.userChats.filter((item, i) => item.chatId !== chatId);
      store.setUserChats(newState);
      Alert.alert("", "Thanks. We'll take it from here.", [
        { text: "OK", onPress: () => {
          setReportModal(false);
          props.navigation.pop()
        }},
      ]);
    })
    .catch((err) => {
      Alert.alert("", "There was a problem with your request");
      console.log("report error : ", err);
    });
  }

  const handleUnmatch2 = () => {
    // Step 1: Remove user from convo in Firebase
    firebase.firestore().collection("conversations").doc(convo.id).set({ usersArray: newUsersArray }, { merge: true })
    .then(() => {
      // Step 2: Delete from local variables
      const newState = store.userConversations.filter((item, i) => item.id !== convo.id);
      store.setAndSaveUserConversations(newState);
      Alert.alert("", "Thanks. We'll take it from here.");
    })
    .catch((err) => {
      Alert.alert("", "There was a problem with your request");
      console.log("report error : ", err);
    });
  }


  const onSend = async (msg) => {

    // Step 0: Compose message object
    const text = msg[0].text;
    const chatId = convo.chatId;

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

    try {
      const res = await sendMessage(chatId, message, userChatUpdate, convo.usersArr);
      if (res) {
        setMessages(GiftedChat.append(arr, [message]));
        setComposerText("");
        sendPushNotification(userId, userName, otherPersonIdsArray, "You have received a new message");
        registerForPushNotifications();
      }
      else {
        Alert.alert("", "There was an error. Please try again.");
      }
    }
    catch (e) {
      Alert.alert("", "There was an error. Please try again.");
    }
  }


  const openUsersList = () => {
    if (otherPersonArray.length > 1) {
      props.navigation.navigate("UsersList", { users: otherPersonArray });
    }
    else {
      const newUsersArray = usersArr.filter((item, i) => item._id !== userId);
      props.navigation.navigate("ProfileFull", { users: newUsersArray });
    }
  }


  {/* Animated Styles */}

  const animatedSendingStyles = {
    transform: [{ rotate: 0 }]
  }

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
        len={ otherPersonArray.length }
        reportModal={ reportModal }
        setReportModal={ setReportModal }
        handleBlock2={ handleBlock2 }
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