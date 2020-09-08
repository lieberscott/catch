// other ideas: someecards, 2truthsandalie, cardsagainsthumanity

import React, { Fragment, useLayoutEffect, useState, useEffect, useRef, useContext } from 'react';
import { Alert, Animated, Dimensions, Easing, Image, Keyboard, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GiftedChat, Actions, Avatar, Bubble, Composer, Constant, InputToolbar, Message, Send } from 'react-native-gifted-chat'
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
// import BottomSheet from 'reanimated-bottom-sheet';
import ReportModal from './ReportModal';

import * as firebase from 'firebase';
import firestore from 'firebase/firestore';

import { StoreContext } from '../../../contexts/storeContext';
// import { registerForPushNotifications, sendPushNotification } from '../../../utils.js';

const turquoise = "#4ECDC4";

const { width, height } = Dimensions.get("window");

import ConversationHeader from './ConversationHeader';

const Conversation = (props) => {

  const store = useContext(StoreContext);
  const user = store.user;
  const userId = user._id;
  const userName = user.name;
  const userAvatar = user.photo;

  const convo = props.route.params.convo; // userChat data
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
      console.log("d : ", d);
      let messages0 = d.messages;
      messages0.reverse();
      setUsersArr(d.userObjects);
      setMessages(messages0);
      setLoaded(true);
    });

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

    const newUsersArray = convo.usersArray.filter((item, i) => item !== userId)

    // Step 1: Remove user from convo in Firebase
    firebase.firestore().collection("conversations").doc(convo.id).update({ usersArray: newUsersArray })
    .then(() => {
      // Step 2: Send to Node to send an email to myself
      return fetch("https://catch-app.glitch.me/report_user", {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({ convo: convo, reportedById: userId, reportedByName: userName })
      })
    })
    .then(() => {
      // Step 3: Delete from local variables
      const newState = store.userConversations.filter((item, i) => item.id !== convo.id);
      store.setAndSaveUserConversations(newState);
      Alert.alert("", "Thanks. We'll take it from here.");
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


  const onSend = (msg) => {
    const text = msg[0].text;
    let messageId;

    let message = {
      text: text,
      createdAt: Date.now(),
      user: {
        _id: userId,
        name: userName,
        avatar: userAvatar
      },
      _id: "k" + Date.now() + Math.random()
    }
    
    // `m0` is added to GiftedChat on front end, `message` is added to Firebase
    let m0 = {...message};
    m0.sending = true;
    m0._id = "k" + Math.random();

    setComposerText("");
    setMessages(previousArr => GiftedChat.append(previousArr, [m0]));
    
    {/* Add the message to the Firestore Database */}
    firebase.firestore().collection("conversations")
    .doc(convo.chatId)
    .update({ messages: firebase.firestore.FieldValue.arrayUnion(message) })
    .then(() => {
      messageId = Date.now();
      {/* Remove and re-add the message to the GiftedChat interface with updated data using object returned from Firebase */}
      let m = [message];
      m[0]._id = messageId;
      m[0].delivered = true;
      setMessages(previousArr => {

        let arr = [...previousArr];
        arr.shift();
        delete arr[0].delivered;

        return GiftedChat.append(arr, m);
      });
      sendPushNotification(userId, userName, otherPersonIdsArray, "You have receivec a new message");
      registerForPushNotifications();
    })
    .catch((err) => {
      
      {/* Remove and re-add the message to the GiftedChat interface with updated data, but using the original object you constructed since Firebase had an error */}
      delete m0.sending;
      m0._id = "k" + Math.random().toString();
      m0.failed = true;
      setMessages(previousArr => {
        let arr = previousArr;
        arr.shift();
        return GiftedChat.append(previousArr, [m0])
      });
      console.log("Err : ", err);
    });
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