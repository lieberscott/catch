import React, { useState } from 'react';
import { StyleSheet, Switch, Text, YellowBox, View } from 'react-native';


YellowBox.ignoreWarnings([
  'Non-serializable values were found in the navigation state'
]);

const green = "green";
const borderCol = "#e3e3e3";

const Notifications = (props) => {

  const notifications = props.route.params.notifications;

  const userId = props.route.params.userId;
  const deviceToken = props.route.params.deviceToken;

  const [push, setPush] = useState(notifications || false);

  const updateNotifications = (bool) => {
    setPush(bool)
    props.route.params.updateProfile({ getsNotifications: bool }, 1)
  }

  return (
    <View style={ styles.container }>
      <Text style={ styles.sectionHeading }>Turning these off means you might miss alerts from your connections</Text>
      <View style={ styles.section }>
        <View style={ styles.oneLine }>
          <View style={ styles.categoryWrapper }>
            <Text style={ styles.category }>Push Notifications</Text>
          </View>
          <View style={ styles.answerWrapper }>
            <Switch
              trackColor={{ false: "#e4e4e4", true: green }}
              thumbColor="white"
              ios_backgroundColor="#efefef"
              onValueChange={ (bool) => updateNotifications(bool) }
              value={ push }
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

export default Notifications;
