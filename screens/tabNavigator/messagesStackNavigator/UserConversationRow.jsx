import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';


const imageMarginR = 16;
const imageDimensions = 80;

const UserConversationRow = (props) => {

  const { convo, userId } = props;
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
  const navigation = useNavigation();

  const dot = !convo.readByReceiver && convo.lastMessageFromId !== userId;


     return (
      <TouchableOpacity activeOpacity={ 1 } style={ styles.body } onPress={() => navigation.navigate("Conversation", { convo, dot, remove: props.remove })} onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        setWidth(w);
      }}>
        { dot ? <View style={ styles.newMessage } /> : [] }
        <Image
          style={ styles.image }
          source={{ uri: usersArr[firstOtherUserIndex].userAvatar || "https://www.neoarmenia.com/wp-content/uploads/generic-user-icon-19.png" }}
        />
        { usersLen === 2 ? [] : usersLen >= 3 ? <Image style={ styles.image2 } source={{ uri: usersArr[lastOtherUserIndex].userAvatar }} /> : <View style={ styles.groupChatAvatar }><Text>+{ usersLen }</Text></View> }

        <View style={ [styles.textWrapper, { width: width - imageDimensions - imageMarginR }] }>
          <Text style={ styles.name }>{ usersArr[firstOtherUserIndex].userName } { usersLen > 2 ? "+" + (usersLen - 2).toString() : "" }</Text>
          <Text ellipsizeMode="tail" numberOfLines={ 1 } style={ styles.message }>{ convo.lastMessageText }</Text>
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
    backgroundColor: "white"
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
    marginRight: imageMarginR
  },
  image2: {
    position: "absolute",
    borderRadius: 50,
    height: imageDimensions * 0.6,
    width: imageDimensions * 0.6,
    left: imageDimensions * 0.6
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
    borderWidth: 2,
    backgroundColor: "red"
  },
  textWrapper: {
    flexDirection: "column",
    justifyContent: "center"
  }
});

export default UserConversationRow;
