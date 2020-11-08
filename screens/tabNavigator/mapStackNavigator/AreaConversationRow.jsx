import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const imageMarginR = 16;
const imageDimensions = 80;

const AreaConversationRow = ({ users, distance, hours, activeSport, skillLevel }) => {
  const len = users.length;

  const navigation = useNavigation();

  return (
    <TouchableOpacity activeOpacity={ 1 } style={ styles.body } onPress={() => navigation.navigate("UsersList", { users })}>
      <Image style={ styles.image } source={{ uri: users[0].photo }} />
      { len === 1 ? [] : len === 2 ? <Image style={ styles.image2 } source={{ uri: users[1].photo }} /> : <View style={ styles.groupChatAvatar }><Text style={ styles.plusText }>+{ len - 1 }</Text></View> }

      <View style={ styles.textWrapper }>
        <View style={ styles.namesWrapper }>
          <Text style={ styles.name }>{ users[0].name } { len > 1 ? "+ " + (len - 1) : "" }</Text>
        </View>
       <Text style={ styles.distanceText }>{ distance <= 1 ? "Less than a mile away" : distance + " miles away" }</Text>
       <View style={ styles.flexDirRow }>
          <View style={ styles.hoursAgoText } />
          <Text style={ styles.active }> { hours } hours ago</Text>
        </View>
      </View>
      <View style={{ justifyContent: "center", alignItems: "center", flexGrow: 1 }}>
        <Image resizeMode="contain" style={ styles.image3 } source={ activeSport === 0 ? require('../../../assets/ball-and-glove-5.png') : activeSport === 1 ? require('../../../assets/football.png') : activeSport === 2 ? require('../../../assets/frisbee.png') : activeSport === 3 ? require('../../../assets/basketball.png') :require('../../../assets/favicon.png') } />
        <Text style={{ fontWeight: "600" }}>{ skillLevel === 1 ? "Intermediate" : "Advanced" }</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  body: {
    flexDirection: "row",
    paddingVertical: 8,
    backgroundColor: "white"
  },
  flexDirRow: {
    flexDirection: "row"
  },
  groupChatAvatar: {
    backgroundColor: "#eee",
    borderRadius: 50,
    position: "absolute",
    height: imageDimensions * 0.6,
    width: imageDimensions * 0.6,
    left: imageDimensions * 0.6,
    justifyContent: "center"
  },
  hoursAgoText: {
    height: 5,
    width: 5,
    borderRadius: 5,
    backgroundColor: "green",
    alignSelf: "center"
  },
  image: {
    borderRadius: 50,
    height: imageDimensions,
    width: imageDimensions,
    marginRight: imageMarginR
  },
  image2: {
    position: "absolute",
    borderRadius: 50,
    height: imageDimensions * 0.6,
    width: imageDimensions * 0.6,
    left: imageDimensions * 0.6
  },
  image3: {
    borderRadius: 50,
    height: imageDimensions * 0.6,
    width: imageDimensions * 0.6
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    justifyContent: "center",
    marginBottom: 6
  },
  namesWrapper: {
    flexDirection: "row",
    alignItems: "center"
  },
  plusText: {
    textAlign: "center"
  },
  textWrapper: {
    flexDirection: "column",
    justifyContent: "center"
  }
});

export default AreaConversationRow;
