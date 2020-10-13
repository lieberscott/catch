import React from 'react';
import { Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get("window");

const turquoise = "#4ECDC4";

const ProfileHeader = (props) => {

  return (
    <View style={ styles.container }>
      <MaterialIcons name="chevron-left" size={ 30 } style={ styles.headerLeft } onPress={() => props.navigation.pop() } />
        <Text> { /* Only exists for Android so bar has height (and thus icons are clickable, otherwise there's no height to the container and can't click icons) */}</Text>
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
    // width: width,
    flexDirection: "row",
    // height: 30,
    backgroundColor: "transparent"
  },
  headerLeft: {
    position: "absolute",
    left: Platform.OS === 'android' ? -10 : 10 // hacky
  },
  icon: {
    position: "absolute",
    right: Platform.OS === 'android' ? -5 : 15 // hacky
  },
})

export default ProfileHeader;
