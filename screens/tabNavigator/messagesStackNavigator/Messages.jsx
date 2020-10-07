import React, { useEffect, useContext } from 'react';
import { Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import { AdMobBanner, setTestDeviceIDAsync } from 'expo-ads-admob';

import { StoreContext } from '../../../contexts/storeContext';

import { declineRequest, acceptRequest, removeFromConversation } from '../../../firebase.js';

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

    try {
      const res = await removeFromConversation(item, newArr);
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

  const accept = async (item) => {

    const userDob = user.date_of_birth.seconds ? new Date(user.date_of_birth.seconds * 1000) : new Date(user.date_of_birth);
    const itemDob = item.date_of_birth.seconds ? new Date(item.date_of_birth.seconds * 1000) : new Date(item.date_of_birth);

    let newConvo = {
      coordinates: { latitude: user0.coordinates.latitude, longitude: user0.coordinates.longitude },
      createdAt: new Date(),
      messages: [],
      userObjects: [
        {
          _id: user._id,
          name: user.name,
          date_of_birth: userDob,
          gender: user.gender,
          coordinates: user.coordinates,
          sports: user.sports,
          photo: user.photo || "https://www.neoarmenia.com/wp-content/uploads/generic-user-icon-19.png",
          getsNotifications: user.getsNotifications,
          notificationToken: user.notificationToken,
          profileText: user.profileText
        },
        {
          _id: item._id,
          name: item.name,
          date_of_birth: itemDob,
          gender: item.gender,
          coordinates: item.coordinates,
          sports: item.sports,
          photo: item.photo || "https://www.neoarmenia.com/wp-content/uploads/generic-user-icon-19.png",
          getsNotifications: item.getsNotifications,
          notificationToken: item.notificationToken,
          profileText: item.profileText
        }
      ]
    }

    try {
      const docId = await acceptRequest(user, item);
      if (docId) {
        const newRequestsArr = [...store.requests];
        const newRequestsArr2 = newRequestsArr.filter((request, i) => request.id !== item.id);
        
        // update the convoArr locally
        newConvo.id = docId;
        const newUserConvosArr = [...store.userConversations];
        newUserConvosArr.unshift(newConvo);

        store.setUserChats(newUserConvosArr);
        store.setRequests(newRequestsArr2);
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
          <View key={data.item.id + Math.random().toString() } style={styles.rowBack}>
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
        renderItem={({ item }) => item.toId ? <RequestRow key={ item.id } request={ item } /> : <UserConversationRow key={item.lastMessageCreatedAt.seconds } convo={ item } userId={ userId } userName={ userName } userAvatar={ userPhoto } /> }
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