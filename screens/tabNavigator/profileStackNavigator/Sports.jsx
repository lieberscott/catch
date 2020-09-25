import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const turquoise = "#4ECDC4";

const Sports = (props) => {
  
  const s = props.route.params.sports || {
    Baseball: "Played Little League",
    Football: "Can Throw A Pretty Good Spiral",
    Frisbee: "Can Throw a Pretty Good Backhand"
  };

  const [baseball, setBaseball] = useState(s.Baseball ? true : false);
  const [baseballLevel, setBaseballLevel] = useState(1);
  const [football, setFootball] = useState(s.Football ? true : false);
  const [footballLevel, setFootballLevel] = useState(1);
  const [frisbee, setFrisbee] = useState(s.Frisbee ? true : false);
  const [frisbeeLevel, setFrisbeeLevel] = useState(1);

  console.log("baseball : ", baseball);

  const handleDone = () => {
    const baseballText = baseballLevel === 0 ? "Absolute beginner" : baseballLevel === 1 ? "Played Little League" : "Pretty good HS Player";
    const footballText = footballLevel === 0 ? "Absolute beginner" : footballLevel === 1 ? "Can throw a spiral" : "Pretty good HS Player";
    const frisbeeText = frisbeeLevel === 0 ? "Absolute beginner" : frisbeeLevel === 1 ? "Good backhand thrower" : "Play in a league";

    props.route.params.updateProfile({
      sports: {
        Baseball: {
          interested: baseball,
          skill_level: baseballText
        },
        Football: {
          interested: football,
          skill_level: footballText
        },
        Frisbee: {
          interested: frisbee,
          skill_level: frisbeeText
        }
      }
    }, 3);
  }

  return (
    <View style={styles.container}>
      <View style={ styles.top }>
        <Text style={ styles.subhead }>Pick your games</Text>
        <Text style={ styles.middleText }>( Please be honest about your skill level )</Text>
      </View>
      <View style={ styles.middle }>
        <View style={ styles.choiceWrapper}>
          <TouchableOpacity activeOpacity={ 0.92 } onPress={ () => setBaseball(prevState => !prevState) } style={ baseball ? styles.choiceButton : styles.choiceButtonDisabled }>
            <Ionicons name="ios-baseball" size={ 20 } color={ "white" } />
            <Text style={ styles.white }>   Baseball</Text>
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 20 }}>
            <TouchableOpacity activeOpacity={ 0.92 } disabled={ !baseball } onPress={ () => setBaseballLevel(0) } style={ baseball && baseballLevel === 0 ? styles.abilityLevel : styles.abilityLevelDisabled }>
              <Text style={ styles.white }>Absolute beginner</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={ 0.92 } disabled={ !baseball } onPress={ () => setBaseballLevel(1) } style={ baseball && baseballLevel === 1 ? styles.abilityLevel : styles.abilityLevelDisabled }>
              <Text style={ styles.white }>Played Little League</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={ 0.92 } disabled={ !baseball } onPress={ () => setBaseballLevel(2) } style={ baseball && baseballLevel === 2 ? styles.abilityLevel : styles.abilityLevelDisabled }>
              <Text style={ styles.white }>Pretty good HS Player</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={ styles.line } />
        <View style={ styles.choiceWrapper}>
          <TouchableOpacity activeOpacity={ 0.92 } onPress={ () => setFootball(prevState => !prevState) } style={ football ? styles.choiceButton : styles.choiceButtonDisabled }>
            <Ionicons name="ios-american-football" size={ 20 } color={ "white" } />
            <Text style={ styles.white }>   Football</Text>
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 20 }}>
            <TouchableOpacity activeOpacity={ 0.92 } disabled={ !football } onPress={ () => setFootballLevel(0) } style={ football && footballLevel === 0 ? styles.abilityLevel : styles.abilityLevelDisabled }>
              <Text style={ styles.white }>Absolute beginner</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={ 0.92 } disabled={ !football } onPress={ () => setFootballLevel(1) } style={ football && footballLevel === 1 ? styles.abilityLevel : styles.abilityLevelDisabled }>
              <Text style={ styles.white }>Can throw a spiral</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={ 0.92 } disabled={ !football } onPress={ () => setFootballLevel(2) } style={ football && footballLevel === 2 ? styles.abilityLevel : styles.abilityLevelDisabled }>
              <Text style={ styles.white }>Pretty good HS Player</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={ styles.line } />
        <View style={ styles.choiceWrapper}>
          <TouchableOpacity activeOpacity={ 0.92 } onPress={ () => setFrisbee(prevState => !prevState) } style={ frisbee ? styles.choiceButton : styles.choiceButtonDisabled }>
            <Ionicons name="ios-disc" size={ 20 } color={ "white" } />
            <Text style={ styles.white }>   Frisbee</Text>
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 20 }}>
            <TouchableOpacity activeOpacity={ 0.92 } disabled={ !frisbee } onPress={ () => setFrisbeeLevel(0) } style={ frisbee && frisbeeLevel === 0 ? styles.abilityLevel : styles.abilityLevelDisabled }>
              <Text style={ styles.white }>Absolute beginner</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={ 0.92 } disabled={ !frisbee } onPress={ () => setFrisbeeLevel(1) } style={ frisbee && frisbeeLevel === 1 ? styles.abilityLevel : styles.abilityLevelDisabled }>
              <Text style={ styles.white }>Good backhand thrower</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={ 0.92 } disabled={ !frisbee } onPress={ () => setFrisbeeLevel(2) } style={ frisbee && frisbeeLevel === 2 ? styles.abilityLevel : styles.abilityLevelDisabled }>
              <Text style={ styles.white }>Play in a league</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={ styles.line } />
        <TouchableOpacity activeOpacity={ 0.6 } onPress={ () => handleDone() } style={ styles.button }>
          <Text style={ styles.turquoise }>Save</Text>
        </TouchableOpacity>
        <Text style={ styles.small }>Please be honest about your skill level.</Text>
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
  button: {
    marginVertical: 5,
    borderColor: "red",
    borderWidth: 0.5,
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
    flex: 1,
    backgroundColor: "#f8f8f8",
    paddingTop: 20,
    paddingHorizontal: 10
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
  turquoise: {
    color: "red",
    textAlign: "center"
  },
  white: {
    color: "white",
    textAlign: "center"
  }
});

export default Sports;