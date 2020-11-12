import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const turquoise = "#4ECDC4";

const Gender = (props) => {

  const styles = StyleSheet.create({
    buttonsWrapper: {
      flexDirection: "row",
      width: "90%",
      alignSelf: "center",
      marginVertical: 4
    },
    button: {
      flex: 1,
      marginHorizontal: 5,
      borderRadius: 30,
      borderColor: props.gender === false ? turquoise : "gray",
      borderWidth: 0.5,
      justifyContent: "center",
      alignItems: "center"
    },
    button2: {
      flex: 1,
      marginHorizontal: 5,
      backgroundColor: turquoise,
      borderRadius: 30
    },
    button3: {
      flex: 1,
      marginHorizontal: 5,
      color: "white",
      borderRadius: 30,
      borderColor: props.gender === true ? turquoise : "gray",
      borderWidth: 0.5,
      justifyContent: "center",
      alignItems: "center"
    },
    // button: {
    //   marginHorizontal: 5,
    //   borderColor: turquoise,
    //   justifyContent: "center",
    //   alignItems: "center",
    //   marginTop: 10,
    //   borderRadius: 30
    // },
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
    skip: {
      flex: 1,
      marginHorizontal: 5,
      backgroundColor: "white",
      borderRadius: 30,
      borderWidth: 1,
      borderColor: "red"
    },
    skipText: {
      width: "100%",
      padding: 10,
      textAlign: "center",
      overflow: "hidden",
      color: "red"
    },
    subhead: {
      alignSelf: "center",
      fontSize: 18,
      color: "#444"
    },
    textGender: {
      width: "100%",
      padding: 10,
      textAlign: "center",
      overflow: "hidden",
      color: "gray",
      borderRadius: 30,
      overflow: "hidden"
    },
    text: {
      width: "100%",
      padding: 10,
      textAlign: "center",
      overflow: "hidden",
      color: "white"
    },
    topWrapper: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center"
    }
  });

  const handleGender = (bool) => {
    props.setGender(bool);
    setTimeout(() => props.goRight(), 120);
  }

  const skip = () => {
    props.setGender(undefined);
    setTimeout(() => props.goRight(), 60);
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
        <View style={ styles.buttonsWrapper }>
          <TouchableOpacity activeOpacity={ 1 } onPress={ () => handleGender(true) } style={ styles.button3 }>
            <Text style={ styles.textGender }>Female</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={ 1 } onPress={ () => handleGender(false) } style={ styles.button }>
            <Text style={ styles.textGender }>Male</Text>
          </TouchableOpacity>
        </View>
        <View style={ styles.buttonsWrapper }>
          <TouchableOpacity activeOpacity={ 1 } onPress={ props.goBack } style={ styles.button2 }>
            <Text style={ styles.text }>Go Back</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={ 1 } onPress={ skip } style={ styles.skip }>
            <Text style={ styles.skipText }>Skip</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default Gender;
