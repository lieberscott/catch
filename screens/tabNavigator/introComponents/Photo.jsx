import React from 'react';
import { Image, KeyboardAvoidingView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const turquoise = "#4ECDC4";

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
            source={{ uri: photo ? photoUrl : 'https://firebasestorage.googleapis.com/v0/b/catchr-f539d.appspot.com/o/images%2F101120%2Fblank_user.png?alt=media&token=05a1f71c-7377-43a8-9724-8d0d1d068467' }}
            style={ styles.image }
          />
        </TouchableOpacity>
        <View style={ styles.bottomWrapper }>
          <Text style={ styles.small }>Your photo will be displayed to other users in your area</Text>
          <TouchableOpacity activeOpacity={ 0.6 } onPress={ () => props.goRight() } style={ photo ? styles.button : styles.skip }>
            <Text style={ photo ? styles.white : styles.skipText }>{ photo ? "Continue" : "Skip" }</Text>
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
  skip: {
    alignSelf: "center",
    width: "100%",
    alignItems: "center",
    marginTop: 20,
    backgroundColor: "white",
    borderRadius: 20,
    paddingVertical: 12,
    borderWidth: 0.5,
    borderColor: "red"
  },
  skipText: {
    color: "red"
  },
  small: {
    fontSize: 10,
    // textAlign: "center"
  },
  white: {
    color: "white"
  }
})

export default Photo;
