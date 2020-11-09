import React from 'react';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import * as firebase from 'firebase';

import LoginStackNavigator from './screens/loginNavigator/loginStackNavigator.jsx';
import StackNavigator from './screens/StackNavigator';
import LoadingScreen from './screens/LoadingScreen';

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
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const MyNavigator = createSwitchNavigator({
  LoadingScreen: LoadingScreen,
  LoginStackNavigator: LoginStackNavigator,
  StackNavigator: StackNavigator
});

const AppContainer = createAppContainer(MyNavigator);

export default function App() {

  return <AppContainer />
}