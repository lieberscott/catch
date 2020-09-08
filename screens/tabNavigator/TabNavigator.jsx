import React, { useState, useEffect, useContext } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import * as firebase from 'firebase/app';
import 'firebase/firestore';

import { StoreContext } from '../../contexts/storeContext.js';

import { getAuthUser, getDbUser, getAreaUsersAndConversations } from '../../firebase.js';

import LoadingScreen from '../LoadingScreen';
import IntroMaster from './introComponents/IntroMaster';
import Profile from './profileStackNavigator/Profile';
import MapStackNavigator from './mapStackNavigator/MapStackNavigator';
import Messages from './messagesStackNavigator/MessagesStackNavigator';
import { set } from 'react-native-reanimated';

const Tab = createBottomTabNavigator();

function MyTabs() {

  console.log("signed in");

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
    console.log("first useEffect in TabNavigator: get authUser and dbUser");
    
    if (loading) {
      // Step 1: Get user and users from Mongo
      (async () => {
        try {
          // Step 2: Get user from auth object
          const uid = await getAuthUser();

          console.log("uid in TabNavigator : ", uid);

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
      console.log("second useEffect in TabNavigator: get areaUsers");
      (async () => {
        try {
          const arr = await getAreaUsersAndConversations(user._id, user.coordinates);
          console.log("arr in TabNavigator");
          setAreaUsers(arr[0]);
          setAreaConversations(arr[1]);
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
    // Step 6: Set up listener for userChats from Firebase
    if (gotAreaConversations && !gotUserChats) {
      console.log("third useEffect in TabNavigator : get userChats");
      unsubscribe = firebase.firestore().collection("userChats").doc(user._id)
      .onSnapshot((snapshot) => {
        const d = snapshot.data();
        let chatArray = d.chatArray;

        let chatArray2 = [];
        
        Object.keys(chatArray).forEach((key) => {
          chatArray2.push(chatArray[key]);
        });
        
        // for conversations involving user
        setUserChats(chatArray2);
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
    // get requests
    let unsubscribe2;
    let arr = [];
    if (gotUserChats && !allLoaded) {
      console.log("user._id : ", user._id);
      console.log("fourth useEffect in TabNavigator : getting requests");
      unsubscribe2 = firebase.firestore().collection("requests")
      .where("toId", "==", user._id)
      .onSnapshot((snapshot) => {
        snapshot.forEach((doc) => {
          let d = doc.data();
          d.id = doc.id;
          arr.push(d);
        });
      });

      setRequests(arr);
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
      setUser
    }}>
      { loading ? <View style={ styles.container }><ActivityIndicator /></View>
      : user.onboardingDone ? <TabNavigator />
      : <IntroMaster /> }
    </StoreContext.Provider>
  );
}

function TabNavigator() {
  return (
      <Tab.Navigator>
        <Tab.Screen name="Profile" component={ Profile } />
        <Tab.Screen name="Active Users" component={ MapStackNavigator } />
        <Tab.Screen name="Messages" component={ Messages } />
      </Tab.Navigator>
  );
}

const Stack = createStackNavigator();

import ProfileFull from './shared/ProfileFull';
import Conversation from './messagesStackNavigator/Conversation';
import UsersList from './shared/UsersList';

export default function StackNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="TabNavigator" component={ TabNavigator } />
        <Stack.Screen name="ProfileFull" component={ProfileFull} />
        <Stack.Screen name="Conversation" component={Conversation} />
        <Stack.Screen name="UsersList" component={UsersList} />
      </Stack.Navigator>
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