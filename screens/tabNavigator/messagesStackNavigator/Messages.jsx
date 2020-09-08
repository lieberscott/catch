import React, { useState, useEffect, useContext } from 'react';
import { Button, Image, FlatList, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import * as firebase from 'firebase';
import firestore from 'firebase/firestore';
import { GeoFirestore } from 'geofirestore';


import { StoreContext } from '../../../contexts/storeContext';

import { declineRequest, acceptRequest } from '../../../firebase.js';

import MessagesEmpty from './MessagesEmpty';
import UserConversationRow from './UserConversationRow';
import RequestRow from './RequestRow';
// import MatchBubble from './conversationComponents/MatchBubble';
// import MatchesEmpty from './conversationComponents/MatchesEmpty';
// import MessagesEmpty from './conversationComponents/MessagesEmpty';

const Messages = (props) => {

  const store = useContext(StoreContext);

  const user = store.user;
  const userId = user._id;
  const userName = user.name;
  const userPhoto = user.image;
  const deviceToken = user.deviceToken;
  const userLoc = user.loc;
  const requests0 = store.requests || [];
  const userChats = store.userChats || [];
  // const userConversations = userChats.concat(requests0);
  const userConversations = requests0.concat(userChats);

  const decline = (item) => {
    firebase.firestore().collection("requests").doc(item.id).delete()
    .then(() => {

      const newState = [...store.requests];
      const newState2 = newState.filter((request, i) => request.id !== item.id);
      // update the convoArr locally
      store.setAndSaveRequests(newState2);
    })
    .catch((e) => {
      console.log("error : ", e);
      Alert.alert("", "There was an error. Please try again.");
    });
  }

  const accept = (item) => {
    const firestore = firebase.firestore();

    // Create a GeoFirestore reference
    const GeoFirestore = geofirestore.initializeApp(firestore);

    // Create a GeoCollection reference
    const geocollection = GeoFirestore.collection('conversations');

    let newConvo = {
      coordinates: new firebase.firestore.GeoPoint(user.loc[0], user.loc[1]),
      createdAt: new Date(),
      messages: [],
      userObjects: [
        {
          _id: item._id,
          name: item.name,
          dateOfBirth: new Date(item.dateOfBirth.seconds * 1000),
          gender: item.gender,
          loc: item.loc,
          sports: item.sports,
          photo: item.photo || "https://www.neoarmenia.com/wp-content/uploads/generic-user-icon-19.png",
          getsNotifications: item.getsNotifications,
          notificationToken: item.notificationToken,
          profileText: item.profileText
        },
        {
          _id: user._id,
          name: user.name,
          dateOfBirth: new Date(user.dateOfBirth),
          gender: user.gender,
          loc: user.loc,
          sports: user.sports,
          photo: user.photo || "https://www.neoarmenia.com/wp-content/uploads/generic-user-icon-19.png",
          getsNotifications: user.getsNotifications,
          notificationToken: user.notificationToken,
          profileText: user.profileText
        }
      ]
    }

    firebase.firestore().collection("requests").doc(item.id).delete()
    .then(() => {
      return geocollection.add(newConvo);
    })
    .then((docRef) => {
      const newRequestsArr = [...store.requests];
      const newRequestsArr2 = newRequestsArr.filter((request, i) => request.id !== item.id);
      // update the convoArr locally

      newConvo.id = docRef.id;
      const newUserConvosArr = [...store.userConversations];
      newUserConvosArr.unshift(newConvo);

      store.setAndSaveUserConversations(newUserConvosArr);
      store.setAndSaveRequests(newRequestsArr2);
    })
    .catch((e) => {
      console.log("error : ", e);
      Alert.alert("", "There was an error. Please try again.");
    });
  }

  return (
    <SafeAreaView style={ styles.body }>

      { /* Bar that says "Messages" */ }
      <View style={ styles.border }>
        <Text style={ styles.header }>Active Chats</Text>
      </View>

      { /* FlatList of Conversations */ }
      <View style={ styles.bottom }>
        { userConversations.length === 0 ? <MessagesEmpty userPhoto={ userPhoto } /> : <SwipeListView
          keyExtractor={ (item, key) => item.id }
          previewRowKey={'0'}
          previewOpenValue={-100}
          previewOpenDelay={3000}
          data={ userConversations }
          disableRightSwipe={ true }
          stopLeftSwipe={ 200 }
          stopRightSwipe={ -200 }
            // renderItem={ (data, rowMap) => (
            //     <View style={{ borderWidth: 1, backgroundColor: "yellow" }}>
            //         <Text>I am {data.item.text} in a SwipeListView</Text>
            //     </View>
            // )}
            renderHiddenItem={ (data, rowMap) => (
              <View key={Math.random().toString() } style={styles.rowBack}>
            <TouchableOpacity
                style={[styles.backRightBtn, styles.backRightBtnLeft]}
                onPress={ data.item.toId ? () => decline(data.item) : () => remove(data.item) }
            >
                <Text style={styles.backTextWhite}>{ data.item.toId ? "Decline" : "Remove" }</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.backRightBtn, styles.backRightBtnRight]}
                onPress={ data.item.toId ? () => accept(data.item) : () => props.navigation.navigate("Conversation", { convo: data.item}) }
            >
                <Text style={styles.backTextWhite}>{ data.item.toId ? "Accept" : "Open" }</Text>
            </TouchableOpacity>
        </View>
          )}
          leftOpenValue={75}
          rightOpenValue={-150}
          previewRowKey={'0'}
          previewOpenValue={-40}
          previewOpenDelay={3000}
          // leftOpenValue={160}
          // rightOpenValue={-160}
          // ItemSeparatorComponent={() => <View style={ styles.alignCenter }><View style={ styles.separator } /></View> }
          renderItem={({ item }) => item.toId ? <RequestRow key={ item.id } request={ item } /> : <UserConversationRow key={item.lastMessageCreatedAt.seconds } convo={ item } userId={ userId } userName={ userName } userAvatar={ userPhoto } /> }
        /> }
        </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  alignCenter: {
    alignItems: "center"
  },
  backRightBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    backgroundColor: "red",
    top: 0,
    width: 75,
    height: 96 // image is 80, plus paddingVertical of 8
  },
  backRightBtnLeft: {
      backgroundColor: 'red',
      right: 75,
  },
  backRightBtnRight: {
      backgroundColor: 'blue',
      right: 0,
  },
  backTextWhite: {
    color: "white"
  },
  body: {
  	flexGrow: 1,
    paddingHorizontal: 10,
    marginTop: 10,
    width: "100%"
  },
  border: {
    borderTopColor: "#c9c9c9",
    borderTopWidth: 3,
    paddingTop: 10
  },
  bottom: {
    flex: 6,
    backgroundColor: "white"
  },
  flexOne: {
     flex: 1
  },
  header: {
    fontSize: 16,
    color: "gray"
  },
  matchesScrollView: {
    // flex: 3,
    flexDirection: "row"
  },
  rowBack: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    backgroundColor: "red"
    // justifyContent: 'space-between',
    // paddingLeft: 15,
    // borderWidth: 1
  },
  separator: {
    borderWidth: 0.5,
    borderColor: "gray",
    width: "98%"
  }
});

export default Messages;