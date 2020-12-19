import React, { useState, useEffect } from 'react';
import { Alert, Animated, Image, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Facebook from 'expo-facebook';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from "expo-crypto";
import * as firebase from 'firebase';

import { loginUser } from '../../firebase.js';

const turquoise = "#4ECDC4";

const LandingPage = ({ navigation }) => {

  const [animation, setAnimation] = useState(new Animated.Value(0));
  const [appleReady, setAppleReady] = useState(false);

  useEffect(() => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 250,
      useNativeDriver: false
    }).start();

    (async () => {
      const loginAvailable = await AppleAuthentication.isAvailableAsync();
      console.log("loginAvailable : ", loginAvailable);
      setAppleReady(loginAvailable);
    })();


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
      await Facebook.initializeAsync("768821137213291");

      const options = {
        permissions: ["public_profile"]
      }
      const { type, token } = await Facebook.logInWithReadPermissionsAsync(options);

      if (type === "success") {
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

  const handleApple = async () => {
    try {
      const csrf = Math.random().toString(36).substring(2, 15);
      const nonce = Math.random().toString(36).substring(2, 10);
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256, nonce);
      const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        state: csrf,
        nonce: hashedNonce
      });
      // apple credential data
      const { identityToken, email, state } = appleCredential;

      // set up Firebase
      if (identityToken) {
        const provider = new firebase.auth.OAuthProvider('apple.com');
        const authCredential = provider.credential({
          idToken: identityToken,
          rawNonce: nonce
        });

        if (authCredential) {
          const bool = await loginUser(authCredential);
        }

        // const result = await firebase.auth().signInWithCredential(authCredential);
      }

    } catch (e) {
      console.log(e);
      if (e.code === 'ERR_CANCELED') {
        // handle that the user canceled the sign-in flow
      } else {
        // handle other errors
        Alert.alert("", "There was an error. Please try again");
      }
    }
  }

  return (
    <SafeAreaView style={ styles.container }>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View style={ styles.imageWrapper }>
        <Image
          style={ styles.image }
          resizeMode="contain"
          source={require('../../assets/ball-and-glove-logo.png')}
        />
      </View>
      <View style={{ alignItems: "flex-end", justifyContent: "flex-end", width: "80%" }}>
      <Animated.View style={[ styles.buttonsWrapper, buttonsAnimatedStyles ]}>
        <TouchableOpacity onPress={ handleFacebook } style={ styles.facebook }>
          <Ionicons name="logo-facebook" size={32} color="white" />
          <Text style={ styles.facebookText }>Continue with Facebook</Text>
        </TouchableOpacity>

        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          style={ styles.apple }
          cornerRadius={40}
          onPress={ appleReady ? handleApple : undefined }
        />


        <View style={ styles.orWrapper }>
          <View style={ styles.line } />
          <Text>or</Text>
          <View style={ styles.line } />
        </View>
        <TouchableOpacity onPress={ () => navigation.navigate("PhoneVerification") } style={ styles.cell }>
          <Text>Use cell phone number</Text>
        </TouchableOpacity>
      </Animated.View>
      <View style={ styles.bottomLinks }>
        <TouchableOpacity onPress={ openTerms }>
          <Text style={ styles.bottomLinksText }>Terms of Service</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={ openPrivacy }>
          <Text style={ styles.bottomLinksText }>Privacy Policy</Text>
        </TouchableOpacity>
      </View>
      <Text style={ styles.agreementText }>By tapping Continue, you agree to our Terms</Text>
      </View>
    </SafeAreaView>
  )
}

export default LandingPage;

const styles = StyleSheet.create({
  agreementText: {
    opacity: 0.7,
    alignSelf: "center"
  },
  apple: {
    marginBottom: 10,
    width: 200,
    height: 50
  },
  appleText: {
    color: "white",
    marginLeft: 20
  },
  bottomLinks: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 10
  },
  bottomLinksText: {
    opacity: 0.5
  },
  buttonsWrapper: {
    alignItems: "center",
    justifyContent: "center"
  },
  cell: {
    backgroundColor: "white",
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 20
  },
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "white",
    paddingTop: 40,
    paddingBottom: 10,
    paddingHorizontal: 40
  },
  facebook: {
    flexDirection: "row",
    backgroundColor: "#3b5998",
    alignItems: "center",
    justifyContent: "center",
    // alignSelf: "center",
    paddingVertical: 7,
    paddingHorizontal: 15,
    // paddingHorizontal: 27,
    // width: "80%",
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
    height: 200,
    width: 200,
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
