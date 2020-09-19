import React, { Fragment, useState, useEffect, useContext, useRef } from 'react';
import { Alert, FlatList, Image, SafeAreaView, StatusBar, StyleSheet, Text, View, Dimensions, Button, TouchableOpacity, ScrollView } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from 'react-native-maps';
import { AdMobBanner, setTestDeviceIDAsync } from 'expo-ads-admob';
import { SwipeListView } from 'react-native-swipe-list-view';

import { sendRequest, addPushNotification } from "../../../firebase.js";

import { registerForPushNotifications } from '../../../utils.js';

import { StoreContext } from "../../../contexts/storeContext.js";

import AreaConversationRow from './AreaConversationRow';
import ActiveUsersEmpty from './ActiveUsersEmpty';

const { width, height } = Dimensions.get("window");

const imageMarginR = 16;
const imageDimensions = 80;

const Map = (props) => {

  const store = useContext(StoreContext);
  const mapRef = useRef();

  const user = store.user;
  const userPhoto = user.photo;
  const userLat = user.loc ? user.loc[0] : 41.87818;
  const userLng = user.loc ? user.loc[1] : -87.6298;

  const areaConversations0 = store.areaConversations || [];
  const areaUsers = store.areaUsers || [];
  const areaConversations = areaConversations0.concat(areaUsers);
  // console.log("areaConversations : ", areaConversations);

  useEffect(() => {
    (async () => {
      // Set global test device ID
      await setTestDeviceIDAsync('EMULATOR');
    })()
  }, []);

  const request = async (item) => {
    try {
      const token = await registerForPushNotifications();
      if (token) {
        const res1 = await addPushNotification(user._id, token)
      }
      const res2 = await sendRequest(user, item);

      if (res2) {
        // add that outgoing request has been made to areaConversations locally so you don't request twice
        
        if (item.createdAt) { // createdAt is a property on the pure user object, but is not included in the areaConversation "user" object
          let newAreaUsers = areaUsers.map((user, i) => {
            if (user._id == item._id) {
              user.requestAlreadyMade = true;
            }
            return user;
          });
          // console.log("newAreaUsers : ", newAreaUsers);
          store.setAreaUsers(newAreaUsers);
        }
        else {
          let newAreaConversations = areaConversations0.map((convo, i) => {
            if (convo._id == item._id) {
              convo.requestAlreadyMade = true;
            }
            return convo;
          });
          store.setAreaConversations(newAreaConversations);
        }
        Alert.alert("", "Your request has been sent!");
      }

    }
    catch(e) {
      console.log("request error : ", e);
    }
  }

  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <SafeAreaView style={{ flex: 0 }} />
      <AdMobBanner
        bannerSize="banner"
        adUnitID={ Platform.OS === 'ios' ? "ca-app-pub-8262004996000143/8383797064" : "ca-app-pub-8262004996000143/6607680969" } // Test ID, Replace with your-admob-unit-id
        servePersonalizedAds // true or false
        onDidFailToReceiveAdWithError={(err) => console.log("error : ", err)}
      />
    <View style={ styles.container }>
      <StatusBar barStyle="dark-content" />
      { /* FlatList of Conversations */ }
      <View style={ styles.top }>
        { areaConversations.length === 0 ? <ActiveUsersEmpty userPhoto={ userPhoto } /> : <SwipeListView
          keyExtractor={ (item, key) => item.userObjects ? item.id + Math.random() : item._id + Math.random() }
          previewRowKey={'0'}
          previewOpenValue={-100}
          previewOpenDelay={3000}
          disableRightSwipe={ true }
          stopLeftSwipe={ 200 }
          stopRightSwipe={ -200 }
          data={ areaConversations }
          ItemSeparatorComponent={() => <View style={ styles.alignCenter }><View style={ styles.separator } /></View> }
          renderHiddenItem={ (data, rowMap) => (
            <View key={Math.random().toString() } style={styles.rowBack}>
              <TouchableOpacity
                  style={[styles.backRightBtn, styles.backRightBtnRight]}
                  onPress={ data.item.requestAlreadyMade ? () => Alert.alert("", "You have already requested a game of catch with this user. They are still considering your request.") : () => request(data.item) }
              >
                  <Text style={styles.backTextWhite}>Request To Join</Text>
              </TouchableOpacity>
            </View>
          )}
          leftOpenValue={75}
          rightOpenValue={-150}
          previewRowKey={'0'}
          previewOpenValue={-40}
          previewOpenDelay={3000}
          renderItem={({ item, index }) => {
            if (item.userObjects) {
              const conversation = item.userObjects.length > 1 ? true : false;
            return <AreaConversationRow key={ item.id + Math.random() } users={ item.userObjects } active={ true } conversation={ conversation } conversationId={ item.id } />
          }
          else {
            // this will always only be one user, but in an array [{ }] so you can reuse the AreaConversationRow component
            return <AreaConversationRow key={ item._id + Math.random() } users={ [item] } active={ item.active } />
          }}}
          ListFooterComponent={() => areaConversations.length ?  <View style={ styles.body }>
          <Image style={ styles.image } source={require('../../../assets/ex1.png')} />
          <View style={ styles.textWrapper }>
            <Text style={ styles.message }>That's it for now. Pull down to check for new users.</Text>
          </View>
        </View> : [] }
        /> }

      </View>
      <MapView
        style={ styles.mapStyle }
        ref={ mapRef }
        provider={PROVIDER_GOOGLE}
        camera={{ center: { latitude: userLat, longitude: userLng }, pitch: 0, heading: 1, altitude: 11, zoom: 11 }}
        pitchEnabled={ false }
        minZoomLevel={ 7 }
        maxZoomLevel={ 19 }
        pitchEnabled={ false }
        rotateEnabled={ false }
      >
        { areaConversations.length ? areaConversations.map((convo, i) => {
          return (
            <Marker
              pinColor="red"
              key={ "pin" + i + Math.random() }
              coordinate={{ latitude: convo.coordinates.latitude, longitude: convo.coordinates.longitude }}
              // title={ pin.name }
              // description={ pin.profile_text }
              // onCalloutPress={ () => navigation.navigate("ProfileFull", { user: pin }) }
            >
              <Callout onPress={ () => props.navigation.navigate("ProfileFull", { user }) }>
                <Text>{"i : " + i }</Text>
                <Text>{ convo.coordinates.latitude + ", " + convo.coordinates.longitude }</Text>
                <View>
                  <Text>Send an intro</Text>
                </View>
              </Callout>
            </Marker>
          )
        }) : <Text>""</Text> }
      </MapView>
    </View>
    </View>
  )
}

const styles = StyleSheet.create({
  backRightBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    backgroundColor: "blue",
    top: 0,
    width: 150,
    height: 96 // image is 80, plus paddingVertical of 8
  },
  backRightBtnLeft: {
      backgroundColor: 'blue',
      right: 75,
  },
  backRightBtnRight: {
      backgroundColor: 'blue',
      right: 0,
  },
  backTextWhite: {
    color: "white"
  },
  body: {
    flexDirection: "row",
    marginVertical: 8
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    width: width
  },
  image: {
    borderRadius: 50,
    height: imageDimensions,
    width: imageDimensions,
    marginRight: imageMarginR
  },
  mapStyle: {
    flex: 1,
    width: width,
    height: height,
  },
  rowBack: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    backgroundColor: "blue"
    // justifyContent: 'space-between',
    // paddingLeft: 15,
    // borderWidth: 1
  },
  textWrapper: {
    justifyContent: "center",
    flex: 1
  },
  top: {
    flex: 1,
    backgroundColor: "white",
    width: "100%",
    paddingHorizontal: 10
  }
});

export default Map;
