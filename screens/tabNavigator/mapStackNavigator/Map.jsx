import React, { Fragment, useState, useEffect, useContext } from 'react';
import { Alert, Image, RefreshControl, SafeAreaView, StatusBar, StyleSheet, Text, View, Dimensions, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from 'react-native-maps';
import { AdMobBanner, setTestDeviceIDAsync } from 'expo-ads-admob';
import { SwipeListView } from 'react-native-swipe-list-view';
import { FontAwesome5 } from '@expo/vector-icons';


import { joinConvo, addPushNotification, getAreaUsersAndConversations } from "../../../firebase.js";

import { registerForPushNotifications, sendPushNotification } from '../../../utils.js';

import { StoreContext } from "../../../contexts/storeContext.js";

import AreaConversationRow from './AreaConversationRow';
import ActiveUsersEmpty from './ActiveUsersEmpty';

const { width, height } = Dimensions.get("window");

const imageMarginR = 16;
const imageDimensions = 80;

const Map = (props) => {

  const store = useContext(StoreContext);

  const user = store.user;
  const userLat = user.coordinates ? user.coordinates.latitude : 41.87818;
  const userLng = user.coordinates ? user.coordinates.longitude : -87.6298;

  const areaConversations0 = store.areaConversations || [];
  areaConversations0.unshift(user);

  const areaConversations1 = areaConversations0.filter((item, pos, self) => {
    return self.indexOf(item) == pos;
  });

  const areaConversations = areaConversations1.filter((v,i,a)=>a.findIndex(t=>(t._id === v._id))===i);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    (async () => {
      // Set global test device ID
      await setTestDeviceIDAsync('EMULATOR');
    })()
  }, []);

  const join = async (item) => {
    try {
      const token = await registerForPushNotifications();
      if (token) {
        const res1 = await addPushNotification(user._id, token);
      }

      if (Object.keys(item.userObjects).length < 200) {
        const res2 = await joinConvo(user, item);

        if (res2) {
          // add that user has joined areaConversations locally so you don't join twice
          
          let newAreaConversations = areaConversations.filter((convo, i) => convo._id !== item._id)
          store.setAreaConversations(newAreaConversations);
          Alert.alert("", "You have joined this game!");
        }
        else {
          Alert.alert("", "This game no longer exists. Refresh the page to get current list of games.");
        }
      }
      else {
        Alert.alert("", "This game is maxed out with 200 players. You can start your own game if you are interested.")
      }

    }
    catch(e) {
      console.log("request error : ", e);
    }
  }

  const onRefresh = async () => {
    setRefreshing(true);
    const blockedUsers = user.blockedUsers ? user.blockedUsers : [];
    try {
      const arr = await getAreaUsersAndConversations(user._id, user.coordinates);

      // filter out blockedUsers from areaConversations
      let arr1 = arr.filter((item) => {
        let blocked = false;
        for (let i = 0; i < blockedUsers.length; i++) {
          const _ids = Object.keys(item.userObjects);
          const index = _ids.findIndex(_id => _id === blockedUsers[i].userId);
          if (index !== -1) {
            blocked = true;
          }
        }
        return !blocked;
      });

      store.setAreaConversations(arr1);
      setRefreshing(false);
    }
    catch (e) {
      console.log("get area users error : ", e);
      setRefreshing(false);
    }
  }

  // console.log("areaConversations : ", areaConversations);
  // console.log("areaConversations.length : ", areaConversations.length);

  return (
    <View style={ styles.flexOne }>
      <SafeAreaView style={ styles.flexZero } />
      <AdMobBanner
        bannerSize="banner"
        adUnitID={ Platform.OS === 'ios' ? "ca-app-pub-8262004996000143/8383797064" : "ca-app-pub-8262004996000143/6607680969" } // Test ID, Replace with your-admob-unit-id
        servePersonalizedAds // true or false
        onDidFailToReceiveAdWithError={(err) => console.log("error : ", err)}
      />
      <View style={ styles.container }>
        <StatusBar barStyle="dark-content" />
        <Text>Showing games within 20 miles</Text>
        { /* FlatList of Conversations */ }
        <View style={ styles.top }>
          { areaConversations.length === 1 ? <ActiveUsersEmpty onRefresh={ onRefresh } /> : <SwipeListView
            keyExtractor={ (item, key) => item === true || item === false ? Math.random().toString() : item.userObjects ? item.id.toString() : item._id.toString() }
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={ onRefresh } />
            }
            previewRowKey={'0'}
            previewOpenValue={-100}
            previewOpenDelay={3000}
            disableRightSwipe={ true }
            stopLeftSwipe={ 200 }
            stopRightSwipe={ -200 }
            data={ areaConversations }
            ItemSeparatorComponent={() => <View style={ styles.alignCenter }><View style={ styles.separator } /></View> }
            renderHiddenItem={ (data, rowMap) => {

              if (data.item === true || data.item === false) {
                return;
              }

              return (
              <View key={data.item.id ? data.item.id.toString() : data.item._id.toString() } style={ styles.rowBack }>
                <TouchableOpacity
                  activeOpacity={ 1 }
                  style={ [styles.backRightBtn, styles.backRightBtnRight] }
                  onPress={ data.item.requestAlreadyMade ? () => Alert.alert("", "You have already joined") : () => join(data.item) }
                >
                    <Text style={styles.backTextWhite}>Join Game</Text>
                </TouchableOpacity>
              </View>
            )}}
            leftOpenValue={75}
            rightOpenValue={-150}
            previewRowKey={'0'}
            previewOpenValue={-40}
            previewOpenDelay={3000}
            renderItem={({ item, index }) => {
              if (index === 0) {
                return <View />;
              }
              else if (item._id) {
                return <View />;
              }
              let timeOfActivation;
              let now = new Date();
              let hours;
            
              if (item.lastMessageTime) {
                timeOfActivation = new Date(item.lastMessageTime.seconds * 1000);
                const milliseconds = Math.abs(now - timeOfActivation);
                hours = Math.round(milliseconds / 36e5);
              }
              else {
                timeOfActivation = new Date();
                const milliseconds = Math.abs(now - timeOfActivation);
                hours = Math.round(milliseconds / 36e5);
              }

              if (item.userObjects) {
                const usersArr = Object.keys(item.userObjects).map(_id => item.userObjects[_id]);
                return <AreaConversationRow key={ item.id } users={ usersArr } distance={ item.distance } hours={ hours } activeSport={ item.activeSport } beginnerFriendly={ item.beginnerFriendly } />
              }
              else if (item === true || item === false) {
                return <View key={ Math.random().toString() } />;
              }
              else {
                // this will always only be one user, but in an array [{ }] so you can reuse the AreaConversationRow component
                return <AreaConversationRow key={ item.id } users={ [item] } distance={ item.distance } hours={ hours } activeSport={ item.activeSport } beginnerFriendly={ item.beginnerFriendly } />
              }
            }}
            ListFooterComponent={() => areaConversations.length ?  <View style={ styles.body }>
            <FontAwesome5 name="camera-retro" style={ styles.calloutImage } size={ 40 } color="#00008b" />
            <View style={ styles.textWrapper }>
              <Text style={ styles.message }>That's it for now. Pull down to check for new users.</Text>
            </View>
          </View> : [] }
          /> }

        </View>
        <MapView
          style={ styles.mapStyle }
          provider={PROVIDER_GOOGLE}
          camera={{ center: { latitude: userLat, longitude: userLng }, pitch: 1, heading: 0, altitude: 5, zoom: 10 }}
          pitchEnabled={ false }
          minZoomLevel={ 7 }
          maxZoomLevel={ 19 }
          pitchEnabled={ false }
          rotateEnabled={ false }
        >
        { areaConversations.length ? areaConversations.map((convo, i) => {

          if (convo === true) {
            return;
          }

          if (convo === false) {
            return;
          }

          let timeOfActivation;
          let now = new Date();
          let hours;
        
          if (convo.lastMessageTime) {
            timeOfActivation = new Date(convo.lastMessageTime.seconds * 1000);
            const milliseconds = Math.abs(now - timeOfActivation);
            hours = Math.round(milliseconds / 36e5);
          }
          else {
            timeOfActivation = new Date();
          }

          let userLoc;
          if (convo.coordinates && convo.coordinates.latitude) {
            userLoc = { latitude: convo.coordinates.latitude, longitude: convo.coordinates.longitude };
          }
          else {
            userLoc = { latitude: convo.coordinates[0], longitude: convo.coordinates[1] }
          }

          let users = [];
          if (convo.userObjects) {
            // convert userObjects from an object where each value is itself an object to an array of objects
            users = Object.keys(convo.userObjects).map(_id => convo.userObjects[_id]);
          }
          else {
            users = [convo];
          }
          const len = users.length;

          return (
            <Marker
              pinColor={ i === 0 ? "green" : "red" }
              key={ convo.id ? "pin" + convo.id : "pin" + convo._id }
              coordinate={ userLoc }
              // title={ pin.name }
              // description={ pin.profile_text }
              // onCalloutPress={ () => navigation.navigate("ProfileFull", { user: pin }) }
            >
              <Callout onPress={ i === 0 ? undefined : () => props.navigation.navigate("UsersList", { users }) }>
                <Image style={ styles.image } source={{ uri: users[0].photo || "https://firebasestorage.googleapis.com/v0/b/catchr-f539d.appspot.com/o/images%2F101120%2Fblank_user.png?alt=media&token=05a1f71c-7377-43a8-9724-8d0d1d068467" }} />
                { len === 1 ? [] : len === 2 ? <Image style={ styles.image2 } source={{ uri: users[1].photo || "https://firebasestorage.googleapis.com/v0/b/catchr-f539d.appspot.com/o/images%2F101120%2Fblank_user.png?alt=media&token=05a1f71c-7377-43a8-9724-8d0d1d068467" }} /> : <View style={ styles.groupChatAvatar }><Text>+{ len }</Text></View> }
                { i === 0 ? [] : <Fragment><View style={ styles.centerText }>
                  <Text style={ styles.name }>{ users[0].name } { len > 1 ? "+ " + (len - 1) : "" }</Text>
                </View>
                <View>
                  <Text style={ styles.active }>{ hours } hours ago</Text>
                </View>
                <Text style={ styles.distanceText }>{ convo.distance <= 1 ? "Less than a mile away" : convo.distance + " miles away" }</Text></Fragment> }
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
  active: {
    backgroundColor: "green",
    color: "white",
    textAlign: "center"
  },
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
  backRightBtnRight: {
      backgroundColor: 'blue',
      right: 0,
  },
  backTextWhite: {
    color: "white"
  },
  body: {
    flexDirection: "row",
    marginVertical: 8,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center"
  },
  calloutImage: {
    borderRadius: 50,
    width: imageDimensions,
    marginRight: imageMarginR,
    textAlign: "center",
  },
  centerText: {
    flexDirection: "row",
    alignItems: "center",
    textAlign: "center"
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    width: width
  },
  flexOne: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "white"
  },
  flexZero: {
    flex: 0
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
  mapStyle: {
    flex: 1,
    width: width,
    height: height,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    justifyContent: "center",
    marginBottom: 6
  },
  rowBack: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    backgroundColor: "blue"
  },
  textWrapper: {
    justifyContent: "center",
    height: imageDimensions,
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
