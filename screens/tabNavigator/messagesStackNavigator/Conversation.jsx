import React, { useLayoutEffect, useState, useEffect, useContext } from 'react';
import { Alert, Dimensions, Keyboard, StyleSheet, View } from 'react-native';
import { GiftedChat, Bubble } from 'react-native-gifted-chat'
import ReportModal from './ReportModal';

import * as firebase from 'firebase';
import firestore from 'firebase/firestore';

import { StoreContext } from '../../../contexts/storeContext';

import { registerForPushNotifications, sendPushNotification } from '../../../utils.js';
import { addPushNotification } from '../../../firebase.js';

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
  const chatId = convo.chatId ? convo.chatId : convo.id;

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

      if (d) {
        let messages0 = d.messages;
        messages0.reverse();

        setUsersArr(d.userObjects);
        setMessages(messages0);
        setLoaded(true);
      }
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


  const handleBlock2 = async () => {

    const userInitiatingBlock = userId;
    const userInitiatingBlockName = userName;
    const userBlockedArr = otherPersonArray;
    // const convo = convo; // already defined above

    const newUsersArray = convo.usersArr.filter((item, i) => item.userId !== userId);
    
    let promises = [];

      // add users to blocked users
      for (let i = 0; i < newUsersArray.length; i++) {
        promises.push(firebase.firestore().collection("users").doc(userId).update({
          blockedUsers: firebase.firestore.FieldValue.arrayUnion(newUsersArray[i])
        }));

        // add current user to OTHER users' blocked users (so this user doesn't show up for them either)
        promises.push(firebase.firestore().collection("users").doc(newUsersArray[i].userId).update({
          blockedUsers: firebase.firestore.FieldValue.arrayUnion(userId)
        }))
      }

    try {
      const res1 = await props.route.params.remove(convo);
      const res2 = await Promise.all(promises);
      const res3 = fetch("https://us-central1-catchr-f539d.cloudfunctions.net/sendEmail", {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({ userInitiatingBlock, userInitiatingBlockName, userBlockedArr, messages })
      });

      const newState2 = {...user };
      for (let i = 0; i < newUsersArray.length; i++) {
        newState2.blockedUsers.push(newUsersArray[i]);
      }
      store.setUser(newState2);
      Alert.alert("", "Thanks. We'll take it from here.", [
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
      props.navigation.pop();
    }
    catch(e) {
      console.log("handleUnmatch error : ", e);
      Alert.alert("", "There was an error. Please try again.");
    }
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
    })


    try {
      const res = await sendMessage(chatId, message, userChatUpdate, convo.usersArr);
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
      props.navigation.navigate("UsersList", { users: otherPersonArray });
    }
    else {
      const newUsersArray = usersArr.filter((item, i) => item._id !== userId);
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