import React, { useState, useEffect } from 'react';
import { Button, Image, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const bodyMarginH = 10; // from Messages.jsx
const imageMarginR = 16;
const imageDimensions = 80;

const AreaConversationRow = ({ users }) => {
  const len = users.length;
  const sportsKeys = Object.getOwnPropertyNames(users[0].sports);

  const navigation = useNavigation();

  return (
      <TouchableOpacity style={ styles.body } onPress={() => navigation.navigate("UsersList", { users, requestAllowed: true })}>
        <Image style={ styles.image } source={{ uri: users[0].photo }} />
        { len === 1 ? [] : len === 2 ? <Image style={ styles.image2 } source={{ uri: users[1].photo }} /> : <View style={ styles.groupChatAvatar }><Text>+{ len }</Text></View> }

        <View style={ styles.textWrapper }>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={ styles.name }>{ users[0].name } { len > 1 ? "+ " + (len - 1) : "" }</Text>
          </View>
          { sportsKeys.map((item, i) => (
            <Text key={ sportsKeys[i] } ellipsizeMode="tail" numberOfLines={ 1 } style={ styles.message }>{ sportsKeys[i] }: { users[0].sports[sportsKeys[i]].skill_level }</Text>
          ))}
        </View>
      </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  acceptButton: {
    backgroundColor: "blue",
    alignSelf: "center",
    paddingHorizontal: 2
  },
  acceptText: {
    color: "white",
    fontSize: 12
  },
  body: {
    flexDirection: "row",
    marginVertical: 8
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

export default AreaConversationRow;
