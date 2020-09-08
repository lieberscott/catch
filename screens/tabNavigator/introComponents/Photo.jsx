import React from 'react';
import { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
// import isMobilePhone from 'validator/lib/isMobilePhone';
import { StackActions } from '@react-navigation/native';


const turquoise = "#4ECDC4";

const nextPage = 1;
const prevPage = 0; //

const Photo = (props) => {

  const photo = props.photo;
  const photoUrl = props.photoUrl;

  return (
    <KeyboardAvoidingView behavior="padding" style={[ styles.container, { width: props.width } ]}>
      <View style={ styles.middle }>
        <Text style={ styles.question }>Finally, upload a photo</Text>
        <TouchableOpacity style={ styles.imageWrapper } onPress={ props.addPhoto }>
          <Image
            // autoFocus={ true }
            resizeMode="contain"
            source={{ uri: photo ? photoUrl : 'https://www.neoarmenia.com/wp-content/uploads/generic-user-icon-19.png' }}
            style={ styles.image }
            />
        </TouchableOpacity>
        <View style={ styles.bottomWrapper }>
          <Text style={ styles.small }>Your photo will be displayed to other users in your area</Text>
          <TouchableOpacity activeOpacity={ 0.6 } onPress={ () => props.goRight() } style={ photo ? styles.button : styles.buttonDisabled }>
            <Text style={ styles.white }>Continue</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={ 0.6 } onPress={ () => props.goBack() } style={ styles.button }>
            <Text style={ styles.white }>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  button: {
    alignSelf: "center",
    width: "100%",
    alignItems: "center",
    marginTop: 5,
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
    width: "100%",
    alignSelf: "center",
    flex: 1
  },
  container: {
    paddingHorizontal: 80,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    height: 200,
    width: 200,
    borderRadius: 100
  },
  imageWrapper: {
    flex: 1,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50
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
    flex: 1,
    width: "100%",
    justifyContent: "center"
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
  usNo: {
    alignSelf: "center",
    textAlign: "center",
    fontSize: 10,
    marginTop: 3
  },
  white: {
    color: "white"
  }
})

export default Photo;
