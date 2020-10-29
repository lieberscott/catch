import React, { useState } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const turquoise = "#4ECDC4";

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
      <ScrollView>
      <View style={ styles.top }>
        <Text style={ styles.subhead }>Pick your games</Text>
        <Text style={ styles.middleText }>( Please be honest about your skill level )</Text>
      </View>
      <View style={ styles.middle }>
        <View style={ styles.choiceWrapper}>
          <TouchableOpacity activeOpacity={ 0.92 } onPress={ () => props.setBaseball(prevState => !prevState) } style={ props.baseball ? styles.choiceButton : styles.choiceButtonDisabled }>
            <Ionicons name="ios-baseball" size={ 20 } color={ "white" } />
            <Text style={ styles.white }>   Baseball</Text>
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 20 }}>
            <TouchableOpacity activeOpacity={ 0.92 } disabled={ !props.baseball } onPress={ () => props.setBaseballLevel(0) } style={ props.baseball && props.baseballLevel === 0 ? styles.abilityLevel : styles.abilityLevelDisabled }>
              <Text style={ styles.white }>Absolute beginner</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={ 0.92 } disabled={ !props.baseball } onPress={ () => props.setBaseballLevel(1) } style={ props.baseball && props.baseballLevel === 1 ? styles.abilityLevel : styles.abilityLevelDisabled }>
              <Text style={ styles.white }>Played Little League</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={ 0.92 } disabled={ !props.baseball } onPress={ () => props.setBaseballLevel(2) } style={ props.baseball && props.baseballLevel === 2 ? styles.abilityLevel : styles.abilityLevelDisabled }>
              <Text style={ styles.white }>Pretty good HS Player</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={ styles.line } />
        <View style={ styles.choiceWrapper}>
          <TouchableOpacity activeOpacity={ 0.92 } onPress={ () => props.setFootball(prevState => !prevState) } style={ props.football ? styles.choiceButton : styles.choiceButtonDisabled }>
            <Ionicons name="ios-american-football" size={ 20 } color={ "white" } />
            <Text style={ styles.white }>   Football</Text>
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 20 }}>
            <TouchableOpacity activeOpacity={ 0.92 } disabled={ !props.football } onPress={ () => props.setFootballLevel(0) } style={ props.football && props.footballLevel === 0 ? styles.abilityLevel : styles.abilityLevelDisabled }>
              <Text style={ styles.white }>Absolute beginner</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={ 0.92 } disabled={ !props.football } onPress={ () => props.setFootballLevel(1) } style={ props.football && props.footballLevel === 1 ? styles.abilityLevel : styles.abilityLevelDisabled }>
              <Text style={ styles.white }>Can throw a spiral</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={ 0.92 } disabled={ !props.football } onPress={ () => props.setFootballLevel(2) } style={ props.football && props.footballLevel === 2 ? styles.abilityLevel : styles.abilityLevelDisabled }>
              <Text style={ styles.white }>Pretty good HS Player</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={ styles.line } />
        <View style={ styles.choiceWrapper}>
          <TouchableOpacity activeOpacity={ 0.92 } onPress={ () => props.setFrisbee(prevState => !prevState) } style={ props.frisbee ? styles.choiceButton : styles.choiceButtonDisabled }>
            <Ionicons name="ios-disc" size={ 20 } color={ "white" } />
            <Text style={ styles.white }>   Frisbee</Text>
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 20 }}>
            <TouchableOpacity activeOpacity={ 0.92 } disabled={ !props.frisbee } onPress={ () => props.setFrisbeeLevel(0) } style={ props.frisbee && props.frisbeeLevel === 0 ? styles.abilityLevel : styles.abilityLevelDisabled }>
              <Text style={ styles.white }>Absolute beginner</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={ 0.92 } disabled={ !props.frisbee } onPress={ () => props.setFrisbeeLevel(1) } style={ props.frisbee && props.frisbeeLevel === 1 ? styles.abilityLevel : styles.abilityLevelDisabled }>
              <Text style={ styles.white }>Good backhand thrower</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={ 0.92 } disabled={ !props.frisbee } onPress={ () => props.setFrisbeeLevel(2) } style={ props.frisbee && props.frisbeeLevel === 2 ? styles.abilityLevel : styles.abilityLevelDisabled }>
              <Text style={ styles.white }>Play in a league</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={ styles.line } />
        <View style={ styles.choiceWrapper}>
          <TouchableOpacity activeOpacity={ 0.92 } onPress={ () => props.setBasketball(prevState => !prevState) } style={ props.basketball ? styles.choiceButton : styles.choiceButtonDisabled }>
            <Ionicons name="ios-basketball" size={ 20 } color={ "white" } />
            <Text style={ styles.white }>   Basketball</Text>
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 20 }}>
            <TouchableOpacity activeOpacity={ 0.92 } disabled={ !props.basketball } onPress={ () => props.setBasketballLevel(0) } style={ props.basketball && props.basketballLevel === 0 ? styles.abilityLevel : styles.abilityLevelDisabled }>
              <Text style={ styles.white }>Absolute beginner</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={ 0.92 } disabled={ !props.basketball } onPress={ () => props.setBasketballLevel(1) } style={ props.basketball && props.basketballLevel === 1 ? styles.abilityLevel : styles.abilityLevelDisabled }>
              <Text style={ styles.white }>Can dribble with both hands</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={ 0.92 } disabled={ !props.basketball } onPress={ () => props.setBasketballLevel(2) } style={ props.basketball && props.basketballLevel === 2 ? styles.abilityLevel : styles.abilityLevelDisabled }>
              <Text style={ styles.white }>Played HS ball</Text>
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
        <Text style={ styles.small }>Please be honest about your skill level.</Text>
      </View>
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
    paddingHorizontal: 20,
    justifyContent: "center",
    // flex: 1
  },
  line: {
    width: "90%",
    borderBottomWidth: 0.5,
    borderColor: "#777",
    alignSelf: "center"
  },
  middle: {
    flex: 6
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
})

export default Sports;
