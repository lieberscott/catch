import React, { useEffect, useContext, useState } from 'react';
import { Alert, Platform, RefreshControl, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import { AdMobBanner, setTestDeviceIDAsync } from 'expo-ads-admob';

import { StoreContext } from '../../../contexts/storeContext';

import { deleteConvo, getUserChatsAndRequests, removeFromConversation } from '../../../firebase.js';

import { getDistance } from '../../../utils.js';

import MessagesEmpty from './MessagesEmpty';
import UserConversationRow from './UserConversationRow';

const Messages = (props) => {

  const store = useContext(StoreContext);

  const user = store.user;
  const userId = user._id;
  const userName = user.name;
  const userPhoto = user.photo || "https://firebasestorage.googleapis.com/v0/b/catchr-f539d.appspot.com/o/images%2F101120%2Fblank_user.png?alt=media&token=05a1f71c-7377-43a8-9724-8d0d1d068467";

  const userConversations0 = store.userChats || [];

  const userConversations = userConversations0.map((item) => {
    const user0Loc = user.coordinates.latitude ? { latitude: user.coordinates.latitude, longitude: user.coordinates.longitude } : { latitude: user.coordinates[0], longitude: user.coordinates[1] };
    const user1Loc = item.coordinates.latitude ? { latitude: item.coordinates.latitude, longitude: item.coordinates.longitude } : { latitude: item.coordinates[0], longitude: item.coordinates[1] };


    const dist = getDistance(user0Loc, user1Loc);
    item.distance = Math.floor(dist);
    return item;
  });

  userConversations.sort((a, b) => a.lastMessageCreatedAt.seconds + b.lastMessageCreatedAt.seconds);


  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    (async () => {
      // Set global test device ID
      await setTestDeviceIDAsync('EMULATOR');
    })()
  }, []);

  


  // remove user from conversation
  const remove = async (convo) => {

    const newArr = convo.usersArr.filter((item, i) => item.userId !== userId);
    const userObj = convo.usersArr.filter((item, i) => item.userId === userId);


    try {
      const res = await removeFromConversation(convo, newArr, userObj);
      if (convo.usersArr.length <= 1) { // only person left in convo, so delete it entirely
        const res2 = await deleteConvo(convo.id);
      }
      // update the convoArr locally
      const newUserChatsArr = userConversations.length ? [...userConversations] : [];

      const newUserChatsArr2 = newUserChatsArr.filter((item, i) => item.id !== convo.id);

      console.log("pop");
      props.navigation.pop();
      store.setUserChats(newUserChatsArr2);

    }
    catch(e) {
      console.log("remove error : ", e);
    }
  }

  const onRefresh = async () => {
    setRefreshing(true);
    const blockedUsers = user.blockedUsers ? user.blockedUsers : [];
    try {
      const arr = await getUserChatsAndRequests(userId); // [userChats, requestsArr]

      if (arr) {
      //   // filter out blockedUsers from userChats
      //   let arr0 = arr.filter((item) => {
      //     let blocked = false;
      //     for (let i = 0; i < blockedUsers.length; i++) {
      //       const index = item.usersArr.findIndex((u) => u.userId === blockedUsers[i].userId)
      //       if (index !== -1) {
      //         blocked = true;
      //       }
      //     }
      //     return !blocked;
      //   });

        
        store.setUserChats(arr);
        setRefreshing(false);
      }
    }
    catch (e) {
      console.log("get area users error : ", e);
      setRefreshing(false);
    }
  }


  return (
    <SafeAreaView style={ styles.body }>
    { /* FlatList of Conversations */ }
    <View style={ styles.bottom }>
      <Text style={ styles.topText }>Old conversations may be deleted periodically</Text>
      { userConversations.length === 0 ? <MessagesEmpty onRefresh={ onRefresh } /> : <SwipeListView
        // keyExtractor={ (item, key) => item.chatId }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={ onRefresh } />
        }
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
              onPress={ () => remove(data.item) }
            >
              <Text style={styles.backTextWhite}>{ data.item.toId ? "Decline" : "Remove" }</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.backRightBtn, styles.backRightBtnRight]}
              onPress={ () => props.navigation.navigate("Conversation", { convo: data.item, remove }) }
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
        renderItem={({ item }) => <UserConversationRow key={ item.lastMessageCreatedAt ? item.lastMessageCreatedAt.seconds : Math.random().toString() } convo={ item } userId={ userId } userName={ userName } userAvatar={ userPhoto } remove={ remove } /> }
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
  },
  topText: {
    textAlign: "center"
  }
});

export default Messages;