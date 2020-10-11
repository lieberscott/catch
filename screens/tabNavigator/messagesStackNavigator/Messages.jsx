import React, { useEffect, useContext } from 'react';
import { Alert, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import { AdMobBanner, setTestDeviceIDAsync } from 'expo-ads-admob';

import { StoreContext } from '../../../contexts/storeContext';

import { declineRequest, acceptRequestUser, acceptRequestConvo, removeFromConversation } from '../../../firebase.js';

import MessagesEmpty from './MessagesEmpty';
import UserConversationRow from './UserConversationRow';
import RequestRow from './RequestRow';

const Messages = (props) => {

  const store = useContext(StoreContext);

  const user = store.user;
  const userId = user._id;
  const userName = user.name;
  const userPhoto = user.image;
  const requests0 = store.requests || [];
  const userChats = store.userChats || [];

  userChats.sort((a, b) => a.lastMessageCreatedAt.seconds - b.lastMessageCreatedAt.seconds);

  for (let i = 0; i < requests0.length; i++) {
    console.log("requests0 id : ", requests0[i].id);
  }


  // const userConversations = userChats.concat(requests0);
  const userConversations = requests0.concat(userChats);

  useEffect(() => {
    (async () => {
      // Set global test device ID
      await setTestDeviceIDAsync('EMULATOR');
    })()
  }, []);


  // remove user from conversation
  const remove = async (convo) => {

    const newArr = convo.usersArr.filter((item, i) => item.userId !== userId);
    const userObj = convo.usersArr.filter((item, i) => item.userId === userId)

    try {
      const res = await removeFromConversation(convo, newArr, userObj);
      // update the convoArr locally
      const newUserChatsArr = userChats.length ? [...userChats] : [];

      const newUserChatsArr2 = newUserChatsArr.filter((item, i) => item.id !== convo.id);

      console.log("part 3 newUserChatsArr2.length : ", newUserChatsArr2.length);

      store.setUserChats(newUserChatsArr2);
    }
    catch(e) {
      console.log("remove error : ", e);
    }
  }

  const decline = async (item) => {
    try {
      const res = await declineRequest(item.id);
      const newState = [...store.requests];
      const newState2 = newState.filter((request, i) => request.id !== item.id);
      // update the convoArr locally
      store.setRequests(newState2);
    }
    catch(e) {
      console.log("decline request error : ", e);
    }
  }

  const accept = async (request) => {

    // Step 1: Get all current conversaitons via the store
    let userChats0 = userChats.length ? [...userChats] : [];
    console.log("userChats0 : ", userChats0);
    console.log("request : ", request);
    // Step 2: Filter through current conversations to get the one this user is requesting to join
    const userChat = userChats0.filter((item, i) => item.chatId === request.conversationId);
    console.log("userChat : ", userChat);
    // Step 3: Get all current users in that conversation
    const usersArr = userChat[0].usersArr;
    // Step 4: Send it as an extra argument


    try {
      console.log("hello 1")
      const docId = request.existingConversation ? await acceptRequestConvo(user, request, usersArr) : await acceptRequestUser(user, request);

      if (docId) {
        let newRequestsArr = [];
        console.log("hello 4");
        
        for (let i = 0; i < requests0.length; i++) {
          newRequestsArr.push(requests0[i]);
        }
        // store.requests.length ? [...requests0] : [];
        const newRequestsArr2 = newRequestsArr.filter((item, i) => item.id !== request.id);
        // // update the convoArr locally
        // newConvo.id = docId;
        // const newUserConvosArr = store.userConversations ? [...store.userConversations] : [];
        // newUserConvosArr.unshift(newConvo);

        // console.log("part 3 newUserConvosArr.length : ", newUserConvosArr.length);

        // store.setUserChats(newUserConvosArr);
        store.setRequests(newRequestsArr2);
      }
      else {
        Alert.alert("", "There was an error. Please try again.");
      }
    }
    catch (e) {
      console.log("accept request error : ", e);
      Alert.alert("", "There was an error. Please try again.");
    }
  }

  return (
    <SafeAreaView style={ styles.body }>

    { /* FlatList of Conversations */ }
    <View style={ styles.bottom }>
      { userConversations.length === 0 ? <MessagesEmpty userPhoto={ userPhoto } /> : <SwipeListView
        keyExtractor={ (item, key) => item.chatId }
        previewRowKey={'0'}
        previewOpenValue={-100}
        previewOpenDelay={3000}
        data={ userConversations }
        disableRightSwipe={ true }
        stopLeftSwipe={ 200 }
        stopRightSwipe={ -200 }
        renderHiddenItem={ (data, rowMap) => (
          <View key={data.item.id } style={styles.rowBack}>
            <TouchableOpacity
              style={[styles.backRightBtn, styles.backRightBtnLeft]}
              onPress={ data.item.toId ? () => decline(data.item) : () => remove(data.item) }
            >
              <Text style={styles.backTextWhite}>{ data.item.toId ? "Decline" : "Remove" }</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.backRightBtn, styles.backRightBtnRight]}
              onPress={ data.item.toId ? () => accept(data.item) : () => props.navigation.navigate("Conversation", { convo: data.item, remove }) }
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
        renderItem={({ item }) => {
        if (item.toId) {
          return <RequestRow key={ item._id.toString() } request={ item } />
        }
        else {
          return <UserConversationRow key={ item.lastMessageCreatedAt ? item.lastMessageCreatedAt.seconds : Math.random().toString() } convo={ item } userId={ userId } userName={ userName } userAvatar={ userPhoto } remove={ remove } />
        }}}
      /> }
      </View>
      <AdMobBanner
        bannerSize="mediumRectangle"
        adUnitID={ Platform.OS === 'ios' ? "ca-app-pub-8262004996000143/8383797064" : "ca-app-pub-8262004996000143/6607680969" } // Test ID, Replace with your-admob-unit-id
        servePersonalizedAds // true or false
        onDidFailToReceiveAdWithError={(err) => console.log("error : ", err)}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
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
    width: "100%",
    alignItems: "center"
  },
  bottom: {
    flex: 6,
    backgroundColor: "white",
    paddingHorizontal: 10,
    width: "100%"
  },
  rowBack: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    backgroundColor: "red"
  }
});

export default Messages;