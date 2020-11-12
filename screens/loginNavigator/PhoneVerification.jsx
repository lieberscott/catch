import React, { Fragment, useState, useRef } from 'react';
import { Dimensions, Image, KeyboardAvoidingView, SafeAreaView, StyleSheet, TouchableOpacity, View, ScrollView } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import * as firebase from 'firebase';
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";

import { loginUser } from '../../firebase.js';

import Cell from './Cell';
import Code from './Code';

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

const PhoneVerification = ({ navigation }) => {

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [error, setError] = useState(false);
  const [error2, setError2] = useState(false);
  const [resentMessage, setResentMessage] = useState(false);
  const [page1, setPage1] = useState(true);
  const [disabled, setDisabled] = useState(false);

  const recaptchaRef = useRef();
  const scrollViewRef = useRef();
  const textInputRef1 = useRef();
  const textInputRef2 = useRef();

  const checkPhone = async (page) => {

    try {
      const phoneProvider = new firebase.auth.PhoneAuthProvider();
      const verificationId = await phoneProvider.verifyPhoneNumber(
        "+1" + phone,
        recaptchaRef.current
      );

      // go to page 2
      if (verificationId && page === 1) {
        scrollViewRef.current.scrollTo({ x: width, animated: true });
        textInputRef2.current.focus();
        setPage1(false);
        setVerificationId(verificationId);
      }

      else if (verificationId && page === 2) {
        setResentMessage(true);
        setVerificationId(verificationId);
      }

      else if (page === 1) {
        setError(true);
        setError2(false);
      }

      else {
        setError2(true);
        setError1(false);
      }
    }

    catch (e) {
      if (page === 1) {
        setError(true);
        setError2(false);
      }
      else {
        setError(false);
        setError2(true);
      }
      console.log("e : ", e);
    }
  }

  const checkCode = async () => {
    try {
      const credential = firebase.auth.PhoneAuthProvider.credential(
        verificationId,
        code
      );
      if (credential) {
        const bool = await loginUser(credential);
      }
    }
    
    catch (err) {
      setError2(true);
      console.log("error : ", err);
    }
  }

  const goToPage1 = () => {
    scrollViewRef.current.scrollTo({ x: 0, animated: true });
    textInputRef1.current.focus();
    setResentMessage(false);
    setError(false);
    setError2(false);
    setPage1(true);
  }

  const pop = () => {
    if (!disabled) {
      navigation.pop();
    }
    setDisabled(true);
  }

  return (
    <Fragment>
      <SafeAreaView style={ styles.flexZero } />
      <SafeAreaView style={ styles.container }>
        <FirebaseRecaptchaVerifierModal
          ref={ recaptchaRef }
          firebaseConfig={ firebaseConfig }
        />
        <TouchableOpacity activeOpacity={ 1 } onPress={ page1 ? pop : goToPage1 } style={ styles.chevron }>
          <Entypo name="chevron-left" size={ 20 } />
        </TouchableOpacity>
        <View style={ styles.imageWrapper }>
        <Image
          style={ styles.image }
          resizeMode="contain"
          source={require('../../assets/basketball.png')}
        />

        
      </View>
        <KeyboardAvoidingView>
        <ScrollView
          horizontal
          pagingEnabled
          ref={ scrollViewRef }
          scrollEnabled={ false }
          keyboardShouldPersistTaps="always"
          contentContainerStyle={ styles.scrollViewStyle }
          showsHorizontalScrollIndicator={ false }
          >
          <Cell
            phone={ phone }
            setPhone={ setPhone }
            verificationId={ verificationId }
            setVerificationId={ setVerificationId }
            width={ width }
            checkPhone={ checkPhone }
            error={ error }
            textInputRef1={ textInputRef1 }
            />
          <Code
            phone={ phone }
            width={ width }
            verificationId={ verificationId }
            code={ code }
            setCode={ setCode }
            goToPage1={ goToPage1 }
            checkPhone={ checkPhone } // for resending code
            resentMessage={ resentMessage }
            error2={ error2 }
            textInputRef2={ textInputRef2 }
            checkCode={ checkCode }
            />
        </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Fragment>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  chevron: {
    position: "absolute",
    width: 40,
    height: 40,
    left: 20,
    top: 20,
    borderWidth: 2,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center"
  },
  flexZero: {
    flex: 0
  },
  image: {
    height: null,
    width: null,
    flex: 1
  },
  imageWrapper: {
    height: 200,
    width: 200,
    alignSelf: "center",
    marginTop: 60
  },
  scrollViewStyle: {
    justifyContent: "center",
    alignItems: "center"
  }
});

export default PhoneVerification;