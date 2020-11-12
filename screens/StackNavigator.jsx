import React, { useState, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, YellowBox, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as firebase from 'firebase/app';
import 'firebase/firestore';

import { StoreContext } from '../contexts/storeContext.js';

import { getAuthUser, getDbUser, getAreaUsersAndConversations } from '../firebase.js';

import TabNavigator from './tabNavigator/TabNavigator';
import ProfileFull from './tabNavigator/shared/ProfileFull';
import Conversation from './tabNavigator/messagesStackNavigator/Conversation';
import UsersList from './tabNavigator/shared/UsersList';
import IntroMaster from './tabNavigator/introComponents/IntroMaster';
import Map from './tabNavigator/messagesStackNavigator/Map';

YellowBox.ignoreWarnings(['Setting a timer']);

const Stack = createStackNavigator();

function MyStack() {

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({});
  const [areaConversations, setAreaConversations] = useState([]);
  const [userChats, setUserChats] = useState([]);
  const [gotAreaConversations, setGotAreaConversations] = useState(false);
  const [gotUserChats, setGotUserChats] = useState(false);
  const [gotRequests, setGotRequests] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false);

  useEffect(() => {
    if (loading) {
      // Step 1: Get user
      (async () => {
        try {
          // Step 2: Get user from auth object
          const uid = await getAuthUser();
          // Step 3: Get user from users collection
          let u = await getDbUser(uid);
          u._id = uid;
          setLoading(false);
          setUser(u);
        }
        catch (e) {
          console.log("error signing user in in StackNavigator.jsx useEffect : ", e);
          firebase.auth().signOut();
        }
      })();
    }
  }, []);


  useEffect(() => {
    let unsubscribe;
    const userId = user._id;
    // Step 4: Set up listener for userChats from Firebase
    if (user.onboardingDone && !gotUserChats) {
      unsubscribe = firebase.firestore().collection("userChats").doc(userId)
      .onSnapshot((snapshot) => {
        let d = snapshot.data();
        d = d ? d : {};

        let chatArray2 = [];

        Object.keys(d).forEach((key) => {
          d[key].id = key;
          chatArray2.push(d[key]);
        });


        let chatArray3 = [];

        // filter out blockedUsers
        if (user.blockedUsers) {

          const blockedUsers = user.blockedUsers || [];
          const chatArrLen = chatArray2.length;

          for (let i = 0; i < chatArrLen; i++) {

            let blocked = false;
            const usersLen = chatArray2[i].usersArr ? chatArray2[i].usersArr.length : 0;

            for (let j = 0; j < usersLen; j++) {
              // check blockedUsers list against the usersArr
              // blockedUsers and usersArr are the same formatted object: { userAvatar, userId, userName }
              // since blockedUsers COMES FROM the usersArr
              const index = blockedUsers.findIndex((item) => item.userId === chatArray2[i].usersArr[j].userId);

              if (index !== -1) {
                blocked = true;
              }

            }
            if (!blocked) {
              chatArray3.push(chatArray2[i]);
            }
          }
        }

        else {
          chatArray3 = [...chatArray2];
        }
        
        // for conversations involving user
        setUserChats(chatArray3);
        setGotUserChats(true);
      });
    }

    return () => {
      if (unsubscribe != undefined) {
        unsubscribe();
      }
    }
  }, [user, loading]);


  useEffect(() => {
    // Step 5: Set up listener and get requests
    let unsubscribe2;
    let arr = [];
    if (gotUserChats && !gotRequests) {
      setGotRequests(true);
    }
  }, [gotUserChats]);


  useEffect(() => {
    if (gotRequests && !allLoaded) {
      // Step 6: If user has completed onboarding, get other users based on geolocation
      (async () => {
        try {
          const arr = await getAreaUsersAndConversations(user._id, user.coordinates);
          
          let blockedUsers = user.blockedUsers ? user.blockedUsers : [];
          // filter out blockedUsers from areaConversations
          let arr1 = arr.filter((item) => {
            let blocked = false;
            for (let i = 0; i < blockedUsers.length; i++) {
              const _ids = Object.keys(item.userObjects);
              const index = _ids.findIndex(_id => _id === blockedUsers[i].userId)
              if (index !== -1) {
                blocked = true;
              }
            }
            return !blocked;
          });
          
          setAreaConversations(arr1);
          setAllLoaded(true);
        }
        catch (e) {
          console.log("get area users error : ", e);
        }
      })();
    }
  }, [gotRequests]);

  return (
    <StoreContext.Provider value={{
      user,
      areaConversations,
      userChats,
      setUser,
      setUserChats,
      setAreaConversations,
    }}>
      { loading ? <View style={ styles.container }><ActivityIndicator /></View>
      : user.onboardingDone ? <Stack.Navigator headerMode="screen" >
        <Stack.Screen name="TabNavigator" component={ TabNavigator } options={{ headerShown: false, title: "" }}/>
        <Stack.Screen name="UsersList" component={UsersList} options={{ title: "" }}/>
        <Stack.Screen name="Conversation" component={Conversation} options={{ title: "" }}/>
        <Stack.Screen name="ProfileFull" component={ProfileFull} options={{ title: "" }}/>
        <Stack.Screen name="MapLoc" component={Map} options={{ title: "" }}/>
      </Stack.Navigator>
      : <IntroMaster /> }
    </StoreContext.Provider>
  );
}

export default function StackNavigator() {
  return (
    <NavigationContainer>
      <MyStack />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
})