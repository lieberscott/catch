import React, { useState, useEffect, useContext } from 'react';
import { Alert, Animated, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Facebook from 'expo-facebook';
import * as firebase from 'firebase';

import { loginUser } from '../../firebase.js';
import { StoreContext } from '../../contexts/storeContext';

const turquoise = "#4ECDC4";

const LandingPage = ({ navigation }) => {

  const store = useContext(StoreContext);
  const [animation, setAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 250,
      useNativeDriver: false
    }).start();
  }, []);

  const yValueAnimation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 0]
  });

  const opacityAnimation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1]
  });

  const buttonsAnimatedStyles = {
    marginTop: yValueAnimation,
    opacity: opacityAnimation
  }

  const openTerms = async () => {
    const result = await WebBrowser.openBrowserAsync('https://www.readoutconsult.com/terms');
  }

  const openPrivacy = async () => {
    const result = await WebBrowser.openBrowserAsync('https://www.readoutconsult.com/privacy');
  }

  const handleFacebook = async () => {

    try {
      await Facebook.initializeAsync();

      const options = {
        permissions: ["public_profile"]
      }
      const { type, token } = await Facebook.logInWithReadPermissionsAsync(options);

      if (type === "success") {
        // const response = await fetch("https://graph.facebook.com/me?fields=id,name,birthday,email&access_token=" + token);
        // const json = await response.json();
        // const facebookId = json.id;
        // const u = await loginUser(facebookId);
        // store.setAndSaveBasicUser(u); // only authId (FB ID or Phone number) and deviceToken
        const credential = firebase.auth.FacebookAuthProvider.credential(token);
        if (credential) {
          const bool = await loginUser(credential);
        }
      }

      else {
        Alert.alert("", "There was a problem. Please try again.");
      }
    }
    catch (e) {
      console.log("e : ", e);
      Alert.alert("", e);
    }
  }

  return (
    <View style={ styles.container }>
      <StatusBar barStyle="dark-content" backgroundColor={ turquoise } />
      <View style={ styles.bottomLinks }>
        <TouchableOpacity onPress={ openTerms }>
          <Text style={ styles.bottomLinksText }>Terms of Service</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={ openPrivacy }>
          <Text style={ styles.bottomLinksText }>Privacy Policy</Text>
        </TouchableOpacity>
      </View>
      <Text style={ styles.agreementText }>By tapping Continue, you agree to our Terms</Text>

      <Animated.View style={[ styles.buttonsWrapper, buttonsAnimatedStyles ]}>
        <TouchableOpacity onPress={ handleFacebook } style={ styles.facebook }>
          <Ionicons name="logo-facebook" size={32} color={ turquoise } />
          <Text style={ styles.facebookText }>Continue with Facebookk</Text>
        </TouchableOpacity>
        <View style={ styles.orWrapper }>
          <View style={ styles.line } />
          <Text>or</Text>
          <View style={ styles.line } />
        </View>
        <TouchableOpacity onPress={ () => navigation.navigate("PhoneVerification") } style={ styles.cell }>
          <Text>Use cell phone number</Text>
        </TouchableOpacity>
      </Animated.View>
      <View style={ styles.imageWrapper }>
        <Image
          style={ styles.image }
          resizeMode="contain"
          source={require('../../assets/new-logo.png')}
        />
      </View>
    </View>
  )
}

export default LandingPage;

const styles = StyleSheet.create({
  agreementText: {
    opacity: 0.7,
    alignSelf: "center"
  },
  apple: {
    flexDirection: "row",
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
    // alignSelf: "center",
    paddingVertical: 7,
    // paddingHorizontal: 27,
    width: "80%",
    borderRadius: 40,
    marginBottom: 10
  },
  appleText: {
    color: "white",
    marginLeft: 20
  },
  bottomLinks: {
    flexDirection: "row",
    justifyContent: "space-around"
  },
  bottomLinksText: {
    opacity: 0.5
  },
  buttonsWrapper: {
    alignItems: "center"
  },
  cell: {
    backgroundColor: turquoise,
    alignItems: "center",
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 17,
    borderRadius: 20,
    marginBottom: 40
  },
  container: {
    flex: 1,
    alignItems: "stretch",
    backgroundColor: turquoise,
    flexDirection: "column-reverse",
    paddingVertical: 40,
    paddingHorizontal: 40
  },
  facebook: {
    flexDirection: "row",
    backgroundColor: "#3b5998",
    alignItems: "center",
    justifyContent: "center",
    // alignSelf: "center",
    paddingVertical: 7,
    // paddingHorizontal: 27,
    width: "80%",
    borderRadius: 40,
    marginBottom: 10
  },
  facebookText: {
    color: "white",
    marginLeft: 20
  },
  image: {
    height: null,
    width: null,
    flex: 1
  },
  image2: {
    marginTop: -290
  },
  imageWrapper: {
    height: 300,
    width: 300,
    alignSelf: "center",
    flexGrow: 4
  },
  line: {
    flex: 1,
    borderWidth: 0.5,
    opacity: 0.3,
    height: 1,
    alignSelf: "center",
    marginHorizontal: 10
  },
  orWrapper:  {
    flexDirection: "row",
    alignSelf: "center"
  },
  welcome: {
    flexGrow: 1,
    justifyContent: "center"
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center"
  }
});
