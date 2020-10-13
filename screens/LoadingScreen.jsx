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
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
    
        // Navigate to Master Component
        navigation.navigate("StackNavigator");
      }
      else {
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
