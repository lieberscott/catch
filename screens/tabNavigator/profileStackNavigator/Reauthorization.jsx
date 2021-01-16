import React, { useState, useEffect, useRef } from 'react';
import { Alert, Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as Facebook from 'expo-facebook';
import * as firebase from 'firebase';
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from "expo-crypto";

const turquoise = "#4ECDC4";

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

const { width } = Dimensions.get("window");

const Reauthorization = (props) => {

  const photoUrl = props.route.params.photoUrl;

  const recaptchaRef = useRef();
  const inputRef = useRef();

  const [code, setCode] = useState("");
  const [verificationId, setVerificationId] = useState();
  const [disabled, setDisabled] = useState(false);
  const [userData, setUserData] = useState({});

  useEffect(() => {
    (async () => {
      const user = firebase.auth().currentUser;

      // providerId either 'phone' or 'facebook.com'
      const providerId = user.providerData[0].providerId;

      Alert.alert("", "You must reauthenticate to delete your profile", [
        { text: "OK", onPress: providerId === "phone" ? () => handlePhone() : providerId === "facebook.com" ? () => handleFacebook() : () => handleApple() }
      ])
      return;

    })()
  }, []);

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
          const user = firebase.auth().currentUser;
          const res001 = await firebase.firestore().collection("userChats").doc(user.uid).get();
          const data = res001.data();
          const convos = Object.keys(data);
          const len = convos.length;
          for (let i = 0; i < len; i++) {
            const res002 = await firebase.firestore().collection("conversations").doc(convos[i]).update({
              ["userObjects." + user.uid]: firebase.firestore.FieldValue.delete()
            });
          }
          const res0 = await firebase.firestore().collection("userChats").doc(user.uid).delete();
          const res1 = await firebase.firestore().collection("users").doc(user.uid).delete();
          if (photoUrl) {
            const deleteRef = firebase.storage().refFromURL(photoUrl);
            const res01 = await deleteRef.delete();
          }
          const res2 = await user.delete();
        }

        else {
          Alert.alert("", "There was an error. Please try again.")
        }

        // const result = await firebase.auth().signInWithCredential(authCredential);
      }
      else {
        Alert.alert("", "There was an error. Please try again.")
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

  const handlePhone = async () => {
    const user = firebase.auth().currentUser;
    const result = await user.reauthenticateWithPhoneNumber(user.phoneNumber, recaptchaRef.current);
    setVerificationId(result);
  }

  const handleFacebook = async (uid) => {

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
          const user = firebase.auth().currentUser;
          const res001 = await firebase.firestore().collection("userChats").doc(user.uid).get();
          const data = res001.data();
          const convos = Object.keys(data);
          const len = convos.length;
          for (let i = 0; i < len; i++) {
            const res002 = await firebase.firestore().collection("conversations").doc(convos[i]).update({
              ["userObjects." + user.uid]: firebase.firestore.FieldValue.delete()
            });
          }
          const res0 = await firebase.firestore().collection("userChats").doc(user.uid).delete();
          const res1 = await firebase.firestore().collection("users").doc(user.uid).delete();
          if (photoUrl) {
            const deleteRef = firebase.storage().refFromURL(photoUrl);
            const res01 = await deleteRef.delete();
          }
          const res2 = await user.delete();
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
  

  const reauthorize = async () => {
    setDisabled(true);

    try {
      const userCredential = await verificationId.confirm(code);
      const user = firebase.auth().currentUser;
      const res001 = await firebase.firestore().collection("userChats").doc(user.uid).get();
      const data = res001.data();
      const convos = Object.keys(data);
      const len = convos.length;
      for (let i = 0; i < len; i++) {
        const res002 = await firebase.firestore().collection("conversations").doc(convos[i]).update({
          ["userObjects." + user.uid]: firebase.firestore.FieldValue.delete()
        });
      }
      const res0 = await firebase.firestore().collection("userChats").doc(user.uid).delete();
      const res1 = await firebase.firestore().collection("users").doc(user.uid).delete();
      if (photoUrl) {
        const deleteRef = firebase.storage().refFromURL(photoUrl);
        const res01 = await deleteRef.delete();
      }
      const res2 = await user.delete();
    }
    catch(err) {
      Alert.alert("", err);
      setDisabled(false);
    }
  }



  return (
    <View style={ styles.container }>

      <FirebaseRecaptchaVerifierModal
        ref={ recaptchaRef }
        firebaseConfig={ firebaseConfig }
      />
      <View style={ styles.top }>
        <Text style={ styles.question }>Reauthorize your account</Text>
        <Text style={ styles.usNo }>Enter the 6 digit code we just sent. Your code will expire in 15 minutes.</Text>
      </View>
      <View style={ styles.flexDirRow }>
        <View style={ styles.bar }>
          <Text style={ styles.text }>{ code.length > 0 ? code[0] : "" }</Text>
        </View>
        <View style={ styles.bar }>
          <Text style={ styles.text }>{ code.length > 1 ? code[1] : "" }</Text>
        </View>
        <View style={ styles.bar }>
          <Text style={ styles.text }>{ code.length > 2 ? code[2] : "" }</Text>
        </View>
        <View style={ styles.bar }>
          <Text style={ styles.text }>{ code.length > 3 ? code[3] : "" }</Text>
        </View>
        <View style={ styles.bar }>
          <Text style={ styles.text }>{ code.length > 4 ? code[4] : "" }</Text>
        </View>
        <View style={ styles.bar }>
          <Text style={ styles.text }>{ code.length > 5 ? code[5] : "" }</Text>
        </View>
      </View>
      <View style={ styles.showKeyboardWrapper }>
        <Text style={ styles.white }>Show Keyboard</Text>
        <TextInput
          keyboardType="numeric"
          caretHidden={true}
          value={ code }
          onChangeText={ (text) => {
            if (text.length <= 6) {
              setCode(text);
            }
          }}
          style={ [styles.input, { position: "absolute" } ]}
        />
      </View>
      <TouchableOpacity disabled={ disabled } onPress={ code.length === 6 ? () => reauthorize() : undefined } style={ code.length === 6 ? styles.button : styles.button2 }>
        <Text style={ styles.white }>Delete</Text>
      </TouchableOpacity>
      <TextInput
        ref={ inputRef }
        autoFocus={ true }
        keyboardType="numeric"
        caretHidden={true}
        value={ code }
        onChangeText={ (text) => {
          if (text.length <= 6) {
            setCode(text);
          }
        }}
        style={ styles.input }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    flex: 1,
    borderBottomWidth: 1,
    marginHorizontal: 3
  },
  button: {
    alignSelf: "center",
    width: "100%",
    alignItems: "center",
    marginTop: 20,
    backgroundColor: turquoise,
    borderRadius: 20,
    paddingVertical: 12
  },
  button2: {
    alignSelf: "center",
    width: "100%",
    alignItems: "center",
    marginTop: 20,
    backgroundColor: "#ddd",
    borderRadius: 20,
    paddingVertical: 12
  },
  container: {
    paddingHorizontal: 80,
    flex: 1,
    width: width
  },
  error: {
    color: "red",
    fontSize: 12,
    alignSelf: "center",
    textAlign: "center",
    flex: 1,
    flexWrap: "wrap"
  },
  flexDirRow: {
    flexDirection: "row"
  },
  height: {
    marginTop: 10,
    flexDirection: "row"
  },
  input: {
    fontSize: 0.5,
    width: "100%",
    color: "green"
  },
  question: {
    fontSize: 23,
    fontWeight: "700",
    color: turquoise,
    textAlign: "center"
  },
  resend: {
    alignItems: "center",
    marginTop: 10
  },
  resendMsg: {
    color: "green",
    fontSize: 12,
    alignSelf: "center",
  },
  resendText: {
    color: "#666"
  },
  showKeyboardWrapper: {
    width: "100%",
    borderRadius: 40,
    backgroundColor: "green",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 10
  },
  text: {
    textAlign: "center",
    height: 25,
    fontSize: 23,
    marginBottom: 12
  },
  top: {
    marginVertical: 20
  },
  usNo: {
    textAlign: "center",
    fontSize: 10,
    marginTop: 10
  },
  white: {
    color: "white"
  }
})

export default Reauthorization;
