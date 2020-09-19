import React, { useState } from 'react';
import { StyleSheet, Switch, Text, YellowBox, View } from 'react-native';


YellowBox.ignoreWarnings([
  'Non-serializable values were found in the navigation state'
]);

const green = "green";
const borderCol = "#e3e3e3";

const Active = (props) => {

  const active0 = props.route.params.active;
  const timeOfActivation0 = props.route.params.timeOfActivation;

  const timeOfActivation = timeOfActivation0.seconds ? new Date(timeOfActivation0.seconds) : new Date(timeOfActivation0);
  const today = new Date();

  const diff = Math.abs(today - timeOfActivation);

  const milliseconds = Math.abs(dateTwoObj - dateOneObj);
  const hours = milliseconds / 36e5;

  const a = active0 && hours < 6 ? true : false;

  const [active, setActive] = useState(notifications || false);

  const updateActive = (bool) => {
    setActive(bool);
    props.route.params.updateProfile({ active: bool, timeOfActivation: new Date() }, 1)
  }

  return (
    <View style={ styles.container }>
      <Text style={ styles.sectionHeading }>You will be active for the next 6 hours</Text>
      <View style={ styles.section }>
        <View style={ styles.oneLine }>
          <View style={ styles.categoryWrapper }>
            <Text style={ styles.category }>Active</Text>
          </View>
          <View style={ styles.answerWrapper }>
            <Switch
              trackColor={{ false: "#e4e4e4", true: green }}
              thumbColor="white"
              ios_backgroundColor="#efefef"
              onValueChange={ (bool) => updateActive(bool) }
              value={ active }
            />
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  answerWrapper: {
    alignItems: "flex-end",
    flex: 3,
    justifyContent: "center"
  },
  category: {
    fontSize: 17,
    marginVertical: 10
  },
  categoryWrapper: {
    flex: 3,
    alignItems: "flex-start",
    justifyContent: "center"
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    paddingTop: 20
  },
  oneLine: {
    flexDirection: "row",
    width: "100%",
    borderBottomWidth: 1,
    borderColor: borderCol
  },
  sectionHeading: {
    marginHorizontal: 15,
    color: "gray",
    marginBottom: 8
  },
  section: {
    paddingHorizontal: 15,
    backgroundColor: "white"
  }
})

export default Active;
