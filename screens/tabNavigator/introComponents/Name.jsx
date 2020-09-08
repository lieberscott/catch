import React from 'react';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
// import isMobilePhone from 'validator/lib/isMobilePhone';
import { StackActions } from '@react-navigation/native';

const turquoise = "#4ECDC4";

const nextPage = 1;
const prevPage = 0; //

const Name = (props) => {

  const activateButton = props.name.length >= 1;

  return (
    <KeyboardAvoidingView behavior="padding" style={[ styles.container, { width: props.width } ]}>
      <View style={ styles.imageWrapper }>
        <Image
          resizeMode="contain"
          source={require('../../../assets/man-throwing-football.png')}
          style={ styles.image }
        />
      </View>
      <View style={ styles.middle }>
        <Text style={ styles.question }>First, tell us your name</Text>
        <View style={ styles.inputWrapper }>
          <TextInput
            // autoFocus={ true }
            placeholder="Your first name"
            value={ props.name }
            onChangeText={ (text) => props.setName(text) }
            style={ styles.input }
            />
        </View>
        <View style={ styles.bottomWrapper }>
          <Text style={ styles.small }>Your first name will be displayed to other users in your area.</Text>
        </View>
        <TouchableOpacity activeOpacity={ 0.6 } onPress={ () => props.goRight() } style={ props.name.length >= 1 ? styles.button : styles.buttonDisabled }>
          <Text style={ styles.white }>Continue</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  button: {
    alignSelf: "center",
    width: "100%",
    alignItems: "center",
    marginTop: 20,
    backgroundColor: turquoise,
    borderRadius: 20,
    paddingVertical: 12
  },
  buttonDisabled: {
    alignSelf: "center",
    width: "100%",
    alignItems: "center",
    marginTop: 20,
    backgroundColor: "lightgray",
    borderRadius: 20,
    paddingVertical: 12
  },
  bottomWrapper: {
    marginTop: 5,
    width: "80%",
    alignSelf: "center"
  },
  container: {
    paddingHorizontal: 80,
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  image: {
    height: null,
    width: null,
    flex: 1
  },
  imageWrapper: {
    flex: 1,
    width: 200
  },
  input: {
    height: 20,
    fontSize: 20,
    display:"flex",
    width:"100%",
    padding:0,
    borderWidth:0,
    justifyContent: "center",
    paddingHorizontal: 3,
    justifyContent: "center"
  },
  inputWrapper: {
    flexDirection: "row",
    height: 40,
    borderRadius: 20,
    borderColor: turquoise,
    borderWidth: 0.5,
    alignItems: "center",
    paddingHorizontal: 15
  },
  middle: {
    flex: 2,
    width: "100%"
  },
  question: {
    fontSize: 18,
    color: "#444",
    textAlign: "center",
    marginBottom: 5
  },
  small: {
    fontSize: 10,
    // textAlign: "center"
  },
  topWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1
  },
  white: {
    color: "white"
  }
})

export default Name;
