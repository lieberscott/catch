import React, { useState, useEffect, useRef } from 'react';
import { Alert, Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as firebase from 'firebase';
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";

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
  console.log("photoUrl : ", photoUrl);

  const recaptchaRef = useRef();

  const [code, setCode] = useState("");
  const [verificationId, setVerificationId] = useState();
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    (async () => {
      const user = firebase.auth().currentUser;
      const result = await user.reauthenticateWithPhoneNumber(user.phoneNumber, recaptchaRef.current);
      setVerificationId(result);
    })()
  }, []);

  

  const reauthorize = async () => {
    setDisabled(true);

    try {
      const userCredential = await verificationId.confirm(code);
      const user = firebase.auth().currentUser;
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
      <TouchableOpacity disabled={ disabled } onPress={ code.length === 6 ? () => reauthorize() : undefined } style={ code.length === 6 ? styles.button : styles.button2 }>
        <Text style={ styles.white }>Delete</Text>
      </TouchableOpacity>
      <TextInput
        autoFocus={ true }
        keyboardType="numeric"
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
    width: 0,
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
  text: {
    textAlign: "center",
    height: 25,
    fontSize: 25,
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
