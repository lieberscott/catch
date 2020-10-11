import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get("window");

const turquoise = "#4ECDC4";

const ProfileHeader = (props) => {

  return (
    <View style={ styles.container }>
      <MaterialIcons name="chevron-left" size={ 30 } style={ styles.headerLeft } onPress={() => props.navigation.pop() } />
      <MaterialIcons name="menu" color={ turquoise } size={ 34 } style={ styles.icon } onPress={ props.handleMenu } />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    // width: width - 34,
    width: width,
    flexDirection: "row",
    backgroundColor: "white"
  },
  headerLeft: {
    position: "absolute",
    left: 10
  },
  icon: {
    position: "absolute",
    right: 15
  }
})

export default ProfileHeader;
