import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get("window");

const imageDimensions = 80;

const turquoise = "#4ECDC4";

const ConversationHeader = (props) => {

  const otherPersonArray = props.otherPersonArray;
  const len = otherPersonArray.length;

  return (
    <View style={ styles.container }>
      <MaterialIcons name="chevron-left" size={ 30 } style={ styles.headerLeft } onPress={() => props.navigation.pop() } />
      <TouchableOpacity  onPress={() => props.openUsersList() } style={ styles.wrapper }>
        <View style={ styles.flexDirRow }>
          <Image source={{ uri: otherPersonArray[0].userAvatar }} style={ styles.image } />
          { len > 1 ? <View style={ styles.groupChatAvatar }><Text>+{ len }</Text></View> : [] }
        </View>
        <Text style={ styles.userName }> { otherPersonArray[0].userName }{ len > 1 ? " +" + len - 1 : "" }</Text>
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
    // width: width - 34,
    width: width,
    flexDirection: "row",
    backgroundColor: "white"
  },
  flexDirRow: {
    flexDirection: "row"
  },
  headerLeft: {
    position: "absolute",
    left: 10
  },
  icon: {
    position: "absolute",
    right: 15
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
    fontWeight: "500"
  },
  wrapper: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  }
})

export default ConversationHeader;
