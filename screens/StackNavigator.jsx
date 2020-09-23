import React, { useState, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
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
import Name from './tabNavigator/profileStackNavigator/Name';
import DateOfBirth from './tabNavigator/profileStackNavigator/DateOfBirth';
import Gender from './tabNavigator/profileStackNavigator/Gender';
import Notifications from './tabNavigator/profileStackNavigator/Notifications';
import Sports from './tabNavigator/profileStackNavigator/Sports';
import Map from './tabNavigator/profileStackNavigator/Map';
import ProfileText from './tabNavigator/profileStackNavigator/ProfileText';
import Active from './tabNavigator/profileStackNavigator/Active';
import IntroMaster from './tabNavigator/introComponents/IntroMaster';

const Stack = createStackNavigator();

function MyStack() {

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({});
  const [areaUsers, setAreaUsers] = useState([]);
  const [areaConversations, setAreaConversations] = useState([]);
  const [userChats, setUserChats] = useState([]);
  const [requests, setRequests] = useState([]);
  const [gotAreaConversations, setGotAreaConversations] = useState(false);
  const [gotUserChats, setGotUserChats] = useState(false);
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
          console.log("error signing user in in TabNavigator.jsx useEffect : ", e);
          firebase.auth().signOut();
        }
      })();
    }
  }, []);

  useEffect(() => {
    if (user.onboardingDone && !gotAreaConversations) {
      // Step 4: If user has completed onboarding, get other users based on geolocation
      (async () => {
        try {
          const arr = await getAreaUsersAndConversations(user._id, user.coordinates);
          
          // filter out blockedUsers from areaUsers
          const blockedUsers = user.blockedUsers ? user.blockedUsers : [];
          let arr0 = arr[0].filter((item) => {
            let blocked = false;
            for (let i = 0; i < blockedUsers.length; i++) {
              if (item._id === blockedUsers[i].userId) {
                blocked = true;
              }
            }
            return !blocked;
          });

          // filter out blockedUsers from areaConversations
          let arr1 = arr[1].filter((item) => {
            let blocked = false;
            for (let i = 0; i < blockedUsers.length; i++) {
              const index = item.userObjects.findIndex((u) => u._id === blockedUsers[i].userId)
              if (index !== -1) {
                blocked = true;
              }
            }
            return !blocked;
          });
          
          setAreaUsers(arr0);
          setAreaConversations(arr1);
          setGotAreaConversations(true);
        }
        catch (e) {
          console.log("get area users error : ", e);
        }
      })();
    }
  }, [loading, user]);

  useEffect(() => {
    let unsubscribe;
    const userId = user._id;
    // Step 5: Set up listener for userChats from Firebase
    if (gotAreaConversations && !gotUserChats) {
      unsubscribe = firebase.firestore().collection("userChats").doc(userId)
      .onSnapshot((snapshot) => {
        let d = snapshot.data();
        d = d ? d : {};

        let chatArray2 = [];

        
        
        Object.keys(d).forEach((key) => {
          chatArray2.push(d[key]);
        });

        let chatArray3 = [];

        // filter out blockedUsers
        if (user.blockedUsers) {

          const blockedUsers = user.blockedUsers;
          const chatArrLen = chatArray2.length;

          for (let i = 0; i < chatArrLen; i++) {

            let blocked = false;
            const usersLen = chatArray2[i].usersArr.length;

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
        
        
        // for conversations involving user
        setUserChats(chatArray3);
        setGotUserChats(true);
      });
    }

    return () => {
      if (unsubscribe != undefined) {
        console.log("userChats listener defined and unmounting");
        unsubscribe();
      }
    }
  }, [gotAreaConversations, loading]);
  
  useEffect(() => {
    // Step 6: Set up listener and get requests
    let unsubscribe2;
    let arr = [];
    if (gotUserChats && !allLoaded) {
      unsubscribe2 = firebase.firestore().collection("requests")
      .where("toId", "==", user._id)
      .onSnapshot((snapshot) => {
        snapshot.forEach((doc) => {
          let d = doc.data();
          d.id = doc.id;
          arr.push(d);
        });
      });

      // although I save locally that a request has been made to someone (and so to prevent duplicate requests) the system is not perfect (if app refreshes, local data may be lost)
      // so filter out duplicate requests here
      let seen = {};
      const uniqueArr = arr.filter((item) => {
        const id = item._id;
        return seen.hasOwnProperty(id) ? false : (seen[id] = true);
      });

      setRequests(uniqueArr);
      setAllLoaded(true);
    }
    return () => {
      if (unsubscribe2 != undefined) {
        console.log("requests listener defined and unmounting");
        unsubscribe2();
      }    }
  }, [gotUserChats]);


  return (
    <StoreContext.Provider value={{
      user,
      areaUsers,
      areaConversations,
      userChats,
      requests,
      setUser,
      setUserChats,
      setAreaConversations,
      setAreaUsers,
      setRequests
    }}>
      { loading ? <View style={ styles.container }><ActivityIndicator /></View>
      : user.onboardingDone ? <Stack.Navigator>
        <Stack.Screen name="TabNavigator" component={ TabNavigator } options={{ headerShown: false, title: "" }}/>
        <Stack.Screen name="Name" component={Name} options={{ title: "" }}/>
        <Stack.Screen name="DateOfBirth" component={DateOfBirth} options={{ title: "" }}/>
        <Stack.Screen name="Gender" component={Gender} options={{ title: "" }}/>
        <Stack.Screen name="Notifications" component={Notifications} options={{ title: "" }}/>
        <Stack.Screen name="Sports" component={Sports} options={{ title: "" }}/>
        <Stack.Screen name="Map" component={Map} options={{ title: "" }}/>
        <Stack.Screen name="ProfileText" component={ProfileText} options={{ title: "" }}/>
        <Stack.Screen name="Active" component={Active} options={{ title: "" }}/>
        <Stack.Screen name="Conversation" component={Conversation} options={{ title: "" }}/>
        <Stack.Screen name="UsersList" component={UsersList} options={{ title: "" }}/>
        <Stack.Screen name="ProfileFull" component={ProfileFull} options={{ title: "" }}/>
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