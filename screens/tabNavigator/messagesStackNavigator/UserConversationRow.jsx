import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';


const imageMarginR = 16;
const imageDimensions = 80;

const UserConversationRow = (props) => {

  const { convo, userId } = props;
  const activeSport = convo.activeSport;
  const usersObj = convo.usersArr;
  let usersArr = [];
  Object.keys(usersObj).forEach((key) => {
    usersArr.push(usersObj[key]);
  });

  // first user in conversation other than the current user
  const usersLen = usersArr.length; // if more than 2, then you have a group chat
  const firstOtherUserIndex = usersArr.findIndex((item, i) => item.userId !== userId);
  const reversedArr = usersArr.slice().reverse();
  const index = reversedArr.findIndex((item, i) => item.userId !== userId);
  const count = usersArr.length - 1;
  const lastOtherUserIndex = index >= 0 ? count - index : index;
  const [width, setWidth] = useState(0);
  const [first, setFirst] = useState(true);
  const navigation = useNavigation();

  const dot = !convo.readByReceiver && convo.lastMessageFromId !== userId;

  const handleWidth = (w) => {
    setWidth(w);
    setFirst(false);
  }

     return (
      <TouchableOpacity activeOpacity={ 1 } style={[ styles.body ]} onPress={() => navigation.navigate("Conversation", { convo, dot, remove: props.remove })} onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        if (first) {
          handleWidth(w);
        }
      }}>
        { dot ? <View style={ styles.newMessage } /> : [] }
        <Image
          style={ styles.image }
          source={{ uri: usersArr[firstOtherUserIndex].userAvatar || "https://firebasestorage.googleapis.com/v0/b/catchr-f539d.appspot.com/o/images%2F2020910%2Fblank_user.png?alt=media&token=45db0019-77b8-46ef-b4fb-c78a4749484c" }}
        />
        { usersLen === 2 ? [] : usersLen >= 3 ? <Image style={ styles.image2 } source={{ uri: usersArr[lastOtherUserIndex].userAvatar }} /> : <View style={ styles.groupChatAvatar }><Text>+{ usersLen }</Text></View> }

        <View style={ styles.textWrapper }>
          <Text style={ styles.name }>{ usersArr[firstOtherUserIndex].userName } { usersLen > 2 ? "+" + (usersLen - 2).toString() : "" }</Text>
          <Text ellipsizeMode="tail" numberOfLines={ 1 } style={ styles.message }>{ convo.lastMessageText }</Text>
        </View>
        <View style={{ justifyContent: "center", alignItems: "center", flexGrow: 1 }}>
          <Image resizeMode="contain" style={ styles.image3 } source={ activeSport === 0 ? require('../../../assets/ball-and-glove-5.png') : activeSport === 1 ? require('../../../assets/football.png') : activeSport === 2 ? require('../../../assets/frisbee.png') : activeSport === 3 ? require('../../../assets/basketball.png') : require('../../../assets/favicon.png') } />
        </View>
      </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  absPos: {
    position: "absolute"
  },
  body: {
    flexDirection: "row",
    paddingVertical: 8,
    backgroundColor: "white",
    flex: 1
  },
  groupChatAvatar: {
    backgroundColor: "#eee",
    borderRadius: 50,
    position: "absolute",
    height: imageDimensions * 0.6,
    width: imageDimensions * 0.6,
    left: imageDimensions * 0.6
  },
  image: {
    borderRadius: 50,
    height: imageDimensions,
    width: imageDimensions,
    marginRight: imageMarginR,
    flex: 1
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
  message: {
    textAlign: "left",
    color: "#666",
    fontSize: 15
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    justifyContent: "center",
    marginBottom: 6
  },
  newMessage: {
    position: "absolute",
    top: 5,
    zIndex: 2,
    borderRadius: 20,
    height: 15,
    width: 15,
    borderColor: "white",
    backgroundColor: "red"
  },
  textWrapper: {
    flexDirection: "column",
    justifyContent: "center",
    flex: 2
  }
});

export default UserConversationRow;
