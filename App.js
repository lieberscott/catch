import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState, useContext } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
// import * as Notifications from 'expo-notifications';
import * as firebase from 'firebase';
import AsyncStorage from '@react-native-community/async-storage';

import { StoreContext } from './contexts/storeContext.js';

import LoginStackNavigator from './screens/loginNavigator/loginStackNavigator.jsx';
import StackNavigator from './screens/StackNavigator';
import LoadingScreen from './screens/LoadingScreen';

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: false,
//     shouldSetBadge: false,
//   }),
// });

const firebaseConfig = {
  apiKey: "AIzaSyDPRr5eNoIoOD4zEIS0UWksdrW1S3prgXU",
  authDomain: "catchr-f539d.firebaseapp.com",
  databaseURL: "https://catchr-f539d.firebaseio.com",
  projectId: "catchr-f539d",
  storageBucket: "catchr-f539d.appspot.com",
  messagingSenderId: "524929245897",
  appId: "1:524929245897:web:d944ff91f56e3c3509a318",
  measurementId: "G-13LKM32VEW"
};
console.log("part 6");
if (!firebase.apps.length) {
  console.log("part 7 !firebase.apps.length");
   firebase.initializeApp(firebaseConfig);
}

const MyNavigator = createSwitchNavigator({
  LoadingScreen: LoadingScreen,
  LoginStackNavigator: LoginStackNavigator,
  StackNavigator: StackNavigator
});

const AppContainer = createAppContainer(MyNavigator);

export default function App() {

  // const notificationListener = useRef();
  // const responseListener = useRef();

  // useEffect(() => {
  //   // This listener is fired whenever a notification is received while the app is foregrounded
  //   notificationListener.current = Notifications.addNotificationReceivedListener(handleNotification);

  //   // This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
  //   responseListener.current = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
    
  //   return () => {
  //     console.log("notifications listeners unmounting in App.jsx (but they're commented out)");
  //     Notifications.removeNotificationSubscription(notificationListener);
  //     Notifications.removeNotificationSubscription(responseListener);
  //   }
  // }, []);

  // const handleNotification = notification => {
  //   console.log("handleNotification notification : ", notification);
  // };

  // const handleNotificationResponse = response => {
  //   console.log("handleNotificationResponse response : ", response);
  // }

  return (
    <AppContainer />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
