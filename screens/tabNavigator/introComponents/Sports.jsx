import React, { useState } from 'react';
import { Dimensions, Image, KeyboardAvoidingView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get("window");

const turquoise = "#4ECDC4";
const paddingH = 20;
const marginH = 7;
const numOfImgsPerRow = 2;
const imageW = (width - (paddingH * 2) - (marginH * 2) - 20) / numOfImgsPerRow;
console.log('imageW  : ', imageW);

const Sports = (props) => {

  const [doneDisabled, setDoneDisabled] = useState(false);

  const donePressed = () => {
    if (!doneDisabled) {
      props.handleDone()
    }
    setDoneDisabled(true);
  }

  return (
    <KeyboardAvoidingView style={[ styles.container, { width: props.width } ]}>
      <ScrollView showsVerticalScrollIndicator={ false } >
        <View style={ styles.top }>
          <Text style={ styles.subhead }>Pick your games</Text>
        </View>
        <View style={ styles.middle }>
          <View style={ styles.buttonsWrapper }>
            <TouchableOpacity activeOpacity={ 1 } onPress={ () => props.setBasketball(prevState => !prevState) } style={ props.basketball ? styles.imageWrapperSelected: styles.imageWrapper }>
              <Image
                resizeMode="contain"
                source={require('../../../assets/basketball.png')}
                style={ styles.image }
              />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={ 1 } onPress={ () => props.setFootball(prevState => !prevState) } style={ props.football ? styles.imageWrapperSelected: styles.imageWrapper }>
              <Image
                resizeMode="contain"
                source={require('../../../assets/football.png')}
                style={ styles.image }
              />
            </TouchableOpacity>
          </View>
          <View style={ styles.buttonsWrapper }>
            <TouchableOpacity activeOpacity={ 1 } onPress={ () => props.setFrisbee(prevState => !prevState) } style={ props.frisbee ? styles.imageWrapperSelected: styles.imageWrapper }>
              <Image
                resizeMode="contain"
                source={require('../../../assets/frisbee.png')}
                style={ styles.image }
              />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={ 1 } onPress={ () => props.setBaseball(prevState => !prevState) } style={ props.baseball ? styles.imageWrapperSelected: styles.imageWrapper }>
              <Image
                resizeMode="contain"
                source={require('../../../assets/ball-and-glove-5.png')}
                style={ styles.image }
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={ styles.line } />
        <TouchableOpacity activeOpacity={ 0.6 } onPress={ donePressed } style={ styles.button }>
          <Text style={ styles.white }>Show Me People Near Me</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={ 0.6 } onPress={ () => props.goBack() } style={ styles.button }>
          <Text style={ styles.white }>Go Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  abilityLevel: {
    backgroundColor: turquoise,
    borderRadius: 20,
    flex: 1,
    marginVertical: 3,
    alignItems:"center",
    justifyContent: "center"
  },
  abilityLevelDisabled: {
    backgroundColor: "#ccc",
    borderRadius: 20,
    flex: 1,
    marginVertical: 3,
    alignItems:"center",
    justifyContent: "center"
  },
  buttonsWrapper: {
    flexDirection: "row",
    alignSelf: "center",
    justifyContent: "space-around",
    marginVertical: 6,
    width: "100%"
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
    borderColor: turquoise,
    borderWidth: 0.5,
    justifyContent: "center",
    alignItems: "center"
  },
  button: {
    marginVertical: 5,
    backgroundColor: turquoise,
    borderRadius: 20,
    paddingVertical: 12
  },
  choiceButton: {
    marginVertical: 20,
    backgroundColor: turquoise,
    borderRadius: 20,
    paddingVertical: 12,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  choiceButtonDisabled: {
    marginVertical: 20,
    backgroundColor: "#ccc",
    borderRadius: 20,
    paddingVertical: 12,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  choiceWrapper: {
    flexDirection: "row",
    paddingVertical: 10
  },
  container: {
    paddingHorizontal: paddingH,
    justifyContent: "center",
    // flex: 1
  },
  image: {
    height: 180,
    width: imageW * 0.5
  },
  imageWrapper: {
    borderWidth: 0.5,
    borderColor: "#999",
    borderRadius: 10,
    width: imageW,
    height: 180,
    alignItems: "center"
    // alignSelf: "center"
  },
  imageWrapperSelected: {
    borderWidth: 1,
    borderColor: "red",
    borderRadius: 10,
    width: imageW,
    height: 180,
    alignItems: "center"
  },
  line: {
    width: "90%",
    borderBottomWidth: 0.5,
    borderColor: "#777",
    alignSelf: "center"
  },
  middleText: {
    alignSelf: "center",
    fontSize: 10,
    marginTop: 5
  },
  subhead: {
    alignSelf: "center",
    fontSize: 20,
    color: "#444"
  },
  small: {
    fontSize: 12,
    marginTop: 10,
    alignSelf: "center",
    textAlign: "center"
  },
  top: {
    flex: 1,
    justifyContent: "center"
  },
  white: {
    color: "white",
    textAlign: "center"
  }
});

export default Sports;
