import React, { useState, useEffect, useContext } from 'react';
import { Animated, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Facebook from 'expo-facebook';
import * as firebase from 'firebase';

// import { loginUser } from '../../utilsUser.js';
import { StoreContext } from '../../contexts/storeContext';

const turquoise = "#4ECDC4";

const LandingPage = ({ navigation }) => {

  console.log("landing page");

  const store = useContext(StoreContext);
  // const deviceToken = store.deviceToken || "-1";
  const deviceToken = "-1";
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

  const handleFacebook = async () => {

    try {
      await Facebook.initializeAsync();

      const options = {
        permissions: ["public_profile"]
      }
      const { type, token } = await Facebook.logInWithReadPermissionsAsync(options);

      if (type === "success") {
        const response = await fetch("https://graph.facebook.com/me?fields=id,name,birthday,email&access_token=" + token);
        const json = await response.json();
        const facebookId = json.id;
        console.log("facebookId : ", facebookId);
        const u = await loginUser(facebookId);
        console.log("u in LandingPage.jsx : ", u);
        // store.setAndSaveBasicUser(u); // only authId (FB ID or Phone number) and deviceToken
        const credential = firebase.auth.FacebookAuthProvider.credential(token);
        await firebase.auth().signInWithCredential(credential);
      }

      else {
        // store.setAndSaveBasicUser({ userId: "", deviceToken: "" });
      }

      // const response = await fetch("https://graph.facebook.com/me?access_token=" + token);
      // const json = await response.json();

      // save FB token and device_token to Storage?

      // use the accessToken to make calls to the Facebook Graph API to get user data to save in Mongo such as
      // const response = await fetch(`https://graph.facebook.com/me/?fields=id,name&access_token=${token}`); //<- use the token you got in your request
      // const userInfo = await response.json();
      // see Stack Overflow answer here: https://stackoverflow.com/questions/54735944/how-to-get-fb-access-token-with-expo
    }
    catch (e) {
      console.log("e : ", e);
    }
  }

  return (
    <View style={ styles.container }>
      <StatusBar barStyle="dark-content" />
      <View style={ styles.bottomLinks }>
        <TouchableOpacity onPress={() => console.log("terms of service")}>
          <Text style={ styles.bottomLinksText }>Terms of Service</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => console.log("privacy policy")}>
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
          source={require('../../assets/ball-and-glove.png')}
        />

        <Image
          style={ styles.image2 }
          resizeMode="contain"
          source={require('../../assets/catch-logo.png')}
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
