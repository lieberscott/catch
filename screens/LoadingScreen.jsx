import React, { useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';


import * as firebase from 'firebase';
import firestore from 'firebase/firestore';
import { GeoFirestore } from 'geofirestore';


const LoadingScreen = ({ navigation }) => {


  const user = {
    _id: "5f427dac757786183232b537",
    sports: { football: { interested: true, skill_level: "Can throw a spiral" }, baseball: { interested: true, skill_level: "Played Little League"}, frisbee: { interested: true, skill_level: "Play in a league" }},
    hashedId: null,
    deviceToken: "$2b$10$l6rQ5HgeZW/d8T7Eyvm6VeAXs1Rr5HTUc38zK5V9R9qBv10DhbsO.",
    name: "Scott",
    photo: "",
    date_added: new Date(),
    available: true,
    time_made_available: new Date(),
    getsNotifications: true,
    notificationToken: "-1",
    loc:[],
    date_of_birth: new Date(1984, 3, 4),
    gender: false,
    onboardingDone: false
  }

  useEffect(() => {
    checkIfLoggedIn();

    return () => {
      console.log("loading screen unmounting");
    }
  }, [])

  const checkIfLoggedIn = () => {
    console.log("check if logged in in Loading Screen second?");
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        console.log("navigate to TabNavigator");
    
        // Navigate to Master Component
        navigation.navigate("StackNavigator");
      }
      else {
        console.log("navigate to LoginNavigator");
        navigation.navigate("LoginStackNavigator");
      }
    });
  }


  return (
    <View style={ styles.container }>
      <ActivityIndicator />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
})

export default LoadingScreen;
