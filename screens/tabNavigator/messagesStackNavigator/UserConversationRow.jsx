import React, { useState } from 'react';
import { Button, Image, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import ActiveUsersEmpty from '../mapStackNavigator/ActiveUsersEmpty';

const bodyMarginH = 10; // from Messages.jsx
const imageMarginR = 16;
const imageDimensions = 80;

const UserConversationRow = ({ convo, userId, userName, userAvatar }) => {

  const usersObj = convo.usersArr;
  let usersArr = [];
  Object.keys(usersObj).forEach((key) => {
    usersArr.push(usersObj[key]);
  });

  // first user in conversation other than the current user
  const usersLen = usersArr.length; // if more than 2, then you have a group chat
  const firstOtherUserIndex = usersArr.findIndex((item, i) => item.userId !== userId);
  const [width, setWidth] = useState(0);
  const navigation = useNavigation();


     return (
      <TouchableOpacity activeOpacity={ 1 } style={ styles.body } onPress={() => navigation.navigate("Conversation", { convo })} onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        setWidth(w);
      }}>
        { !convo.readByUser ? <View style={ styles.newMessage } /> : [] }
        <Image
          style={ styles.image }
          source={{ uri: usersArr[firstOtherUserIndex].userAvatar || "https://www.neoarmenia.com/wp-content/uploads/generic-user-icon-19.png" }}
        />
        { usersLen > 2 ? <View style={{ position: "absolute" }}><Text>+ { usersLen - 2 }</Text></View> : [] }

        <View style={ [styles.textWrapper, { width: width - imageDimensions - imageMarginR }] }>
          <Text style={ styles.name }>{ usersArr[firstOtherUserIndex].userName } { usersLen > 2 ? "+" + usersLen - 2 : "" }</Text>
          <Text ellipsizeMode="tail" numberOfLines={ 1 } style={ styles.message }>{ convo.lastMessageText }</Text>
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
  image: {
    borderRadius: 50,
    height: imageDimensions,
    width: imageDimensions,
    marginRight: imageMarginR
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
