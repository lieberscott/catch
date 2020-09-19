import React, { useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import * as firebase from 'firebase';


const LoadingScreen = ({ navigation }) => {

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
