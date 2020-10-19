import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const imageDimensions = 40;

const turquoise = "#4ECDC4";

const { width } = Dimensions.get("window");

const ConversationHeader = (props) => {

  const otherPersonArray = props.otherPersonArray;
  const len = otherPersonArray.length;

  return (
    <View style={ styles.container }>
      <MaterialIcons name="chevron-left" size={ 30 } style={ styles.headerLeft } onPress={() => props.navigation.pop() } />
      <TouchableOpacity  onPress={() => props.openUsersList() } style={ styles.wrapper }>
        <View style={ styles.flexDirRow }>
          <Image source={{ uri: otherPersonArray[0].userAvatar }} style={ styles.image } />
          { len > 1 ? <View style={ styles.groupChatAvatar }><Text style={ styles.groupChatText }>+{ len - 1 }</Text></View> : [] }
        </View>
        <Text style={ styles.userName }> { otherPersonArray[0].userName }{ len > 1 ? " +" + (len - 1).toString() : "" }</Text>
      </TouchableOpacity>
      <MaterialIcons name="menu" color={ turquoise } size={ 34 } style={ styles.icon } onPress={ props.handleMenu } />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    width: width
  },
  flexDirRow: {
    flexDirection: "row"
  },
  groupChatAvatar: {
    alignItems:"center",
    justifyContent: "center",
    backgroundColor: "#eee",
    borderRadius: 50,
    position: "absolute",
    height: imageDimensions * 0.6,
    width: imageDimensions * 0.6,
    left: imageDimensions * 0.7
  },
  groupChatText: {
    textAlign: "center",
    fontSize: 11
  },
  headerLeft: {
    position: "absolute",
    left: Platform.OS === 'android' ? -10 : 10 // hacky
  },
  icon: {
    position: "absolute",
    right: Platform.OS === 'android' ? -15 : 15 // hacky
  },
  image: {
    height: 40,
    width: 40,
    borderRadius: 20
  },
  image2: {
    position: "absolute",
    borderRadius: 50,
    height: imageDimensions * 0.6,
    width: imageDimensions * 0.6,
    left: imageDimensions * 0.6
  },
  userName: {
    fontWeight: "500",
    textAlign: "center"
  },
  wrapper: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  }
})

export default ConversationHeader;
