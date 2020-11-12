import React, { useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const turquoise = "#4ECDC4";
const { width, height } = Dimensions.get("window");

const paddingH = 20;
const marginH = 7;
const numOfImgsPerRow = 2;
const imageW = (width - (paddingH * 2) - (marginH * 2) - 20) / numOfImgsPerRow;
console.log('imageW  : ', imageW);

const Sports = (props) => {

  const sports = props.route.params.sports;
  


  const [baseball, setBaseball] = useState(sports.Baseball ? true : false);
  const [football, setFootball] = useState(sports.Football  ? true : false);
  const [frisbee, setFrisbee] = useState(sports.Frisbee ? true : false);
  const [basketball, setBasketball] = useState(sports.Basketball ? true : false);
  const [disabled, setDisabled] = useState(false);

  const handleDone = () => {

    if (!disabled) {
      props.route.params.updateProfile({
        sports: {
          Baseball: baseball,
          Football: football,
          Frisbee: frisbee,
          Basketball:  basketball,
        }
      }, 3);
    }
    setDisabled(true);
  }

  return (
    <View style={styles.container}>
      <View style={ styles.top }>
        <Text style={ styles.subhead }>Pick your games</Text>
      </View>
      <View style={ styles.middle }>
        <ScrollView showsVerticalScrollIndicator={ false } >
          <View style={ styles.middle }>
            <View style={ styles.buttonsWrapper }>
              <TouchableOpacity activeOpacity={ 1 } onPress={ () => setBasketball(prevState => !prevState) } style={ basketball ? styles.imageWrapperSelected: styles.imageWrapper }>
                <Image
                  resizeMode="contain"
                  source={require('../../../assets/basketball.png')}
                  style={ styles.image }
                />
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={ 1 } onPress={ () => setFootball(prevState => !prevState) } style={ football ? styles.imageWrapperSelected: styles.imageWrapper }>
                <Image
                  resizeMode="contain"
                  source={require('../../../assets/football.png')}
                  style={ styles.image }
                />
              </TouchableOpacity>
            </View>
            <View style={ styles.buttonsWrapper }>
              <TouchableOpacity activeOpacity={ 1 } onPress={ () => setFrisbee(prevState => !prevState) } style={ frisbee ? styles.imageWrapperSelected: styles.imageWrapper }>
                <Image
                  resizeMode="contain"
                  source={require('../../../assets/frisbee.png')}
                  style={ styles.image }
                />
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={ 1 } onPress={ () => setBaseball(prevState => !prevState) } style={ baseball ? styles.imageWrapperSelected: styles.imageWrapper }>
                <Image
                  resizeMode="contain"
                  source={require('../../../assets/ball-and-glove-5.png')}
                  style={ styles.image }
                />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
        <View style={ styles.line } />
        <TouchableOpacity activeOpacity={ 0.6 } onPress={ () => handleDone() } style={ styles.button }>
          <Text style={ styles.turquoise }>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    backgroundColor: "transparent",
    borderRadius: 20,
    paddingVertical: 12,
    borderColor: "red",
    borderWidth: 0.5
  },
  choiceWrapper: {
    flexDirection: "row",
    paddingVertical: 10
  },
  container: {
    paddingHorizontal: paddingH,
    flex: 1,
    backgroundColor: "white"
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
    justifyContent: "center"
  },
  turquoise: {
    textAlign: "center",
    color: "red"
  },
  white: {
    color: "white",
    textAlign: "center"
  }
});

export default Sports;