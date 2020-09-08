import React, { Fragment, useEffect, useContext, useState } from 'react';
import { Alert, Dimensions, StyleSheet, View, ActivityIndicator, Image, Text, TouchableOpacity } from 'react-native';
import * as firebase from 'firebase';
import firestore from 'firebase/firestore';

// import RequestModal from '../mapStackNavigator/RequestModal';

import { registerForPushNotifications, sendPushNotification } from '../../../utils.js';

import { StoreContext } from '../../../contexts/storeContext.js';


const { width, height } = Dimensions.get("window");

const greenmist = "#A6D785";
const imageMarginR = 16;
const imageDimensions = 80;

const UsersList = (props) => {

  const store = useContext(StoreContext);

  const user = store.user; // user using app

 const users = props.route.params.users;
 const requestAllowed = props.route.params.requestAllowed;
 const conversation = props.route.params.conversation || false; // will request be to an existing conversation
 const conversationId = props.route.params.conversationId || false;

 const [requestModal, setRequestModal] = useState(false);

 const sendRequest = () => {
  console.log("send request");
  firebase.firestore().collection("requests")
  .add({
    _id: user.userId,
    name: user.name,
    dateOfBirth: new Date(user.dateOfBirth),
    gender: user.gender,
    loc: user.loc,
    sports: user.sports,
    photo: user.photo || "https://www.neoarmenia.com/wp-content/uploads/generic-user-icon-19.png",
    profileText: user.profileText,
    getsNotifications: user.getsNotifications,
    notificationToken: user.notificationToken,
    toId: users[0]._id,
    toName: users[0].name,
    toLoc: users[0].loc,
    responded: false,
    accepted: false,
    createdAt: new Date(),
    conversation: conversation, // true if for an existing conversation
    conversationId: conversationId // will be an Id value if for an existing conversation
  })
  .then((docRef) => {
    // update local data
    // Set the requests array to include new person so you can't send them a request twice
    let newState = [...store.areaConversations];
    let data = docRef.data();

    let index;
    
    // find index of areaConversation
    if (conversation) {
      for (let i = 0; i < newState.length; i++) {
        if (newState[i].userObjects) {
          if (newState[i].userObjects[0]._id === users[0]._id) {
            index = i;
          }
        }
      }
      newState[i].userObjects[0].sentRequest = true;
    }

    else {
      for (let i = 0; i < newState.length; i++) {
        if (newState[i]._id === users[0]._id) {
          index = i;
        }
      }
      newState[index].sentRequest = true;
    }

    setRequestModal(true);
    store.setAndSaveAreaConversations(newState);
    sendPushNotification(userId, userName, otherPersonIdsArray, "You have received a new Catch Request" );
    registerForPushNotifications();

  })
  .catch((err) => {
    console.log("Error : ", err)
    Alert.alert("", "There was a problem with your request. Please try again.")
  })

}

  return (
    <View style={ styles.container }>
      { users.map((user, i) => (
        <TouchableOpacity key={ user._id } style={ styles.body } onPress={() => props.navigation.navigate("ProfileFull", { users: [users[0]], requestAllowed })}>
          <Image style={ styles.image } source={{ uri: user.photo }} />
          <View style={ styles.textWrapper }>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={ styles.name }>{ user.name }</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
      { requestAllowed ? <Fragment><TouchableOpacity activeOpacity={ users[0].sentRequest ? 1 : 0.8 } onPress={ users[0].sentRequest ? undefined : sendRequest } style={ styles.sendMessage }>
          <Text>{ users[0].sentRequest ? "Already requested" : "Request a game of catch with " + users[0].name }</Text>
        </TouchableOpacity>
        <RequestModal
          user={ user }
          otherPerson={ users[0] }
          height={ height }
          requestModal={ requestModal }
          setRequestModal={ setRequestModal }
        /></Fragment> : [] }
    </View>
  )
}

const styles = StyleSheet.create({
  body: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc"
  },
  container: {
    flex: 1
  },
  image: {
    borderRadius: 50,
    height: imageDimensions,
    width: imageDimensions,
    marginRight: imageMarginR
  },
  sendMessage: {
    backgroundColor: "rgba(2, 117, 216, 0.9)",
    borderRadius: 10,
    position: "absolute",
    top: "90%",
    width: "95%",
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center"
  },
  textWrapper: {
    flexDirection: "column",
    justifyContent: "center"
  }
})

export default UsersList;
