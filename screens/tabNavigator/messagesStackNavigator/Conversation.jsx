// other ideas: someecards, 2truthsandalie, cardsagainsthumanity

import React, { Fragment, useLayoutEffect, useState, useEffect, useRef, useContext } from 'react';
import { Alert, Animated, Dimensions, Easing, Image, Keyboard, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GiftedChat, Actions, Avatar, Bubble, Composer, Constant, InputToolbar, Message, Send } from 'react-native-gifted-chat'
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
      console.log("usersArr :: ", usersArr);
      const newUsersArray = usersArr.filter((item, i) => item._id !== userId);
      console.log("newUsersArray : ", newUsersArray);
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
        // showUserAvatar={ true }
        // renderAvatar={() => null }
        // renderMessage={(props) => {
        //   return (
        //     <Fragment>
        //       <View>
        //         <Bubble
        //           { ...props }
        //           wrapperStyle={{ left: styles.bubbleWrapperLeft, right: styles.bubbleWrapperRight }}
        //           textStyle={{ left: styles.bubbleTextLeft, right: styles.bubbleTextRight }}

        //           renderTime={() => null }
        //         />
        //         { props.currentMessage.user._id === userId && props.currentMessage.read
        //         ? <View style={ styles.bubbleFooterWrapper }><MaterialCommunityIcons color="blue" name="check-all" size={ 13 } style={ styles.alignSelfFlexStart } /><Text style={ styles.deliveredText }> Read</Text></View>
        //         : props.currentMessage.delivered
        //         ? <View style={ styles.bubbleFooterWrapper }><Text style={ styles.deliveredText }> Delivered</Text></View>
        //         : props.currentMessage.sending
        //         ? <View style={ styles.bubbleFooterWrapper }><MaterialCommunityIcons name="loading" size={9} color="black" /><Text style={ styles.deliveredText }> Sending</Text></View>
        //         : props.currentMessage.failed
        //         ? <View style={ styles.bubbleFooterWrapper }><MaterialIcons name="error-outline" color="red" size={ 15 } /><Text style={ styles.failedText }> Failed</Text></View>
        //         : [] }
        //       </View>
        //     </Fragment>
        //   )
        // }}
        // renderChatEmpty={() => {
        //   return <View style={ styles.chatEmptyWrapper }><ChatEmpty openUsersList={ openUsersList } readReceiptsPress={ readReceiptsPress } otherPerson={ otherPersonName } avatar={ otherPersonAvatar } match_date={ message.date_sent } /></View>
        // }}
        // renderComposer={(props) => <Composer {...props} textInputStyle={ styles.composer } text={ gifView ? gifText : composerText } /> }
        // renderSend={(props) => {
        //   return gifView ? <View style={ styles.renderSend }><MaterialIcons name={ "highlight-off" } color="orange" size={ 27 } onPress={ handleGifView } style={ styles.gifExIcon } /></View>
        //   : composerText.length > 0 ? <Send {...props} containerStyle={ styles.renderSend } />
        //   : <View style={ styles.renderSend }><MaterialIcons name={ "gif" } color="orange" size={ 40 } onPress={ handleGifView } style={ styles.gifIcon } /></View> }
        // }
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
  alignItemsCenter: {
    alignItems: "center"
  },
  alignSelfFlexStart: {
    alignSelf: "flex-start"
  },
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
  // bubbleFooterWrapper: {
  //   flexDirection: "row",
  //   justifyContent: "flex-end",
  //   marginRight: 3,
  //   alignItems: "center",
  //   marginVertical: 5
  // },
  // bubbleTextLeft: {
  //   color: "white"
  // },
  // bubbleTextRight: {
  //   color: "#444"
  // },
  // bubbleWrapperLeft: {
  //   backgroundColor: '#a0d080',
  //   borderTopRightRadius: 5,
  //   borderTopLeftRadius: 1,
  //   borderBottomRightRadius: 5,
  //   borderBottomLeftRadius: 5,
  //   marginTop: 3,
  //   marginLeft: 2
  // },
  // bubbleWrapperRight: {
  //   backgroundColor: '#ECEFF1',
  //   borderTopRightRadius: 1,
  //   borderTopLeftRadius: 5,
  //   borderBottomRightRadius: 5,
  //   borderBottomLeftRadius: 5,
  //   marginTop: 3,
  //   marginRight: 2
  // },
  chatEmptyWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  composer: {
    color: '#444',
    paddingTop: 8.5,
    paddingHorizontal: 12,
    borderWidth: 0.5,
    borderRadius: 20,
    marginLeft: 10,
    marginRight: 5
    // marginVertical: 5
  },
  deliveredText: {
    color: "#444",
    // marginBottom: 3,
    fontSize: 10,
    marginRight: 3,
    alignSelf: "center"
  },
  failedText: {
    color: "red",
    fontSize: 12
  },
  flexDirectionRow: {
    flexDirection: "row",
    position: "absolute",
    bottom: -20,
    right: 0
  },
  gifIcon: {
    marginRight: 15,
    width: 30
  },
  gifExIcon: {
    marginRight: 15,
    width: 30,
    marginBottom: 6,
    marginLeft: 3
  },
  greenButton: {
    marginLeft: 22,
    marginRight: 10
  },
  greenButtonText: {
    fontSize: 15,
    color: "gray",
    flex: 1,
    flexWrap: "wrap",
    marginRight: 10
  },
  greenNotificationInner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    paddingVertical: 10,
    borderBottomRightRadius: 6,
    borderBottomLeftRadius: 6
  },
  greenNotificationOuter: {
    alignItems: "center",
    paddingVertical: 8,
    backgroundColor: "#f9f9f9",
    zIndex: 2
  },
  headerLeft: {
    marginLeft: 10
  },
  heart: {
    marginRight: 10
  },
  icon: {
    // marginHorizontal: 5
  },
  iconImage: {
    width: 32,
    height: 32,
    borderColor: "red",
    borderWidth: 1,
    marginHorizontal: 3
  },
  image: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 5,
  },
  orangeButton: {
    marginHorizontal: 15
  },
  orangeButtonText: {
    color: "gray",
    flex: 1,
    flexWrap: "wrap",
    marginRight: 10,
    fontWeight: "800"
  },
  orangeNotificationWrapper: {
    // height: 125,
    // backgroundColor: "transparent"
  },
  plus: {
    marginLeft: -3,
    marginTop: -3
  },
  readReceipts: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginRight: 3,
    alignItems: "center",
    backgroundColor: "blue",
    borderRadius: 20,
    padding: 2
  },
  renderAccessory: {
     flexDirection: "row",
     position: "absolute",
     right: 50,
     borderWidth: 1
  },
  renderBubble: {
    // flexGrow: 1,
    // flexDirection: "row",
    // alignItems: "center"
  },
  renderComposerWrapper: {
    flexDirection: "row",
    backgroundColor: "red",
    alignItems: "center",
    flex: 1,
    borderRadius: 10,
    borderColor: "black",
    borderWidth: 1,
    marginLeft: 10
  },
  renderSend: {
    width: 75,
    alignItems: "center"
  },
  sending: {
    color: "#444"
  },
  view: {
    flex: 1
  }
});

export default Conversation;