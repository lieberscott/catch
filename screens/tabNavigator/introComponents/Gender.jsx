import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const turquoise = "#4ECDC4";

const Gender = (props) => {

  const styles = StyleSheet.create({
    button: {
      marginHorizontal: 5,
      borderColor: turquoise,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 10,
      borderRadius: 30
    },
    container: {
      width: props.width,
      paddingHorizontal: 20,
      justifyContent: "center"
    },
    image: {
      height: null,
      width: null,
      flex: 1
    },
    imageWrapper: {
      height: 200,
      width: 200,
      alignSelf: "center"
    },
    middle: {
      flex: 1,
      width: "100%"
    },
    subhead: {
      alignSelf: "center",
      fontSize: 18,
      color: "#444"
    },
    text: {
      backgroundColor: "#eee",
      color: turquoise,
      fontSize: 19,
      fontWeight: "600",
      width: "100%",
      padding: 10,
      textAlign: "center",
      borderRadius: 30,
      overflow: "hidden"
    },
    topWrapper: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center"
    },
    wrapperMale: {
      borderColor: props.gender === false ? turquoise : "transparent",
      borderWidth: 2,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 10,
      borderRadius: 30
    },
    wrapperFemale: {
      borderColor: props.gender === true ? turquoise : "transparent",
      borderWidth: 2,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 10,
      borderRadius: 30
    }
  });

  const handleGender = (bool) => {
    props.setGender(bool);
    setTimeout(() => props.goRight(), 120);
  }

  return (
    <View style={ styles.container }>
      <View style={ styles.topWrapper }>
        <View style={ styles.imageWrapper }>
          <Image
            resizeMode="contain"
            source={require('../../../assets/football.png')}
            style={ styles.image }
          />
        </View>
      </View>
      <View style={ styles.middle }>
        <Text style={ styles.subhead }>Your Gender</Text>
        <TouchableOpacity activeOpacity={ 1 } onPress={() => handleGender(true)} style={ styles.wrapperFemale }>
          <Text style={ styles.text }>female</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={ 1 } onPress={() => handleGender(false) } style={ styles.wrapperMale }>
          <Text style={ styles.text }>male</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={ 1 } onPress={() => props.goBack() } style={ styles.button }>
          <Text style={ styles.text }>Go Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default Gender;
