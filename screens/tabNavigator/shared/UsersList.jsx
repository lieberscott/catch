import React, { Fragment, useEffect, useContext, useState } from 'react';
import { Alert, Dimensions, StyleSheet, View, ActivityIndicator, Image, Text, TouchableOpacity } from 'react-native';
import * as firebase from 'firebase';
import firestore from 'firebase/firestore';

// import RequestModal from '../mapStackNavigator/RequestModal';

import { registerForPushNotifications, sendPushNotification } from '../../../utils.js';

import { StoreContext } from '../../../contexts/storeContext.js';


const { width, height } = Dimensions.get("window");

const greenmist = "#A6D785";
const imageMarginR = 16;
const imageDimensions = 80;

const UsersList = (props) => {

  const store = useContext(StoreContext);

  const user = store.user; // user using app

 const users = props.route.params.users;
 const requestAllowed = props.route.params.requestAllowed;
 const conversation = props.route.params.conversation || false; // will request be to an existing conversation
 const conversationId = props.route.params.conversationId || false;

  return (
    <View style={ styles.container }>
      { users.map((user, i) => (
        <TouchableOpacity key={ user._id } style={ styles.body } onPress={() => props.navigation.navigate("ProfileFull", { users: [users[i]], requestAllowed })}>
          <Image style={ styles.image } source={{ uri: user.photo }} />
          <View style={ styles.textWrapper }>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={ styles.name }>{ user.name }</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  body: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc"
  },
  container: {
    flex: 1
  },
  image: {
    borderRadius: 50,
    height: imageDimensions,
    width: imageDimensions,
    marginRight: imageMarginR
  },
  sendMessage: {
    backgroundColor: "rgba(2, 117, 216, 0.9)",
    borderRadius: 10,
    position: "absolute",
    top: "90%",
    width: "95%",
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center"
  },
  textWrapper: {
    flexDirection: "column",
    justifyContent: "center"
  }
})

export default UsersList;
