import React, { Fragment, useState, useEffect, useContext, useRef } from 'react';
import { Alert, Image, RefreshControl, SafeAreaView, StatusBar, StyleSheet, Text, View, Dimensions, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from 'react-native-maps';
import { AdMobBanner, setTestDeviceIDAsync } from 'expo-ads-admob';
import { SwipeListView } from 'react-native-swipe-list-view';

import { sendRequest, addPushNotification, getAreaUsersAndConversations } from "../../../firebase.js";

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
  const userLat = user.coordinates ? user.coordinates.latitude : 41.87818;
  const userLng = user.coordinates ? user.coordinates.longitude : -87.6298;

  const areaConversations0 = store.areaConversations || [];
  const areaUsers = store.areaUsers || [];
  const areaConversations = areaConversations0.concat(areaUsers);
  areaConversations.unshift(user);

  let _12HoursAgo = new Date();
  _12HoursAgo.setHours(_12HoursAgo.getHours() - 12);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    (async () => {
      // Set global test device ID
      await setTestDeviceIDAsync('EMULATOR');
    })()
  }, []);

  const request = async (item) => {
    if (!user.active) {
      Alert.alert("", "You must mark yourself as `active` on your profile page in order to request games of catch!");
    }
    else {
      try {
        const token = await registerForPushNotifications();
        if (token) {
          const res1 = await addPushNotification(user._id, token);
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
  }

  const onRefresh = async () => {
    try {
      const arr = await getAreaUsersAndConversations(user._id, user.coordinates);
      
      store.setAreaUsers(arr[0]);
      store.setAreaConversations(arr[1]);
    }
    catch (e) {
      console.log("get area users error : ", e);
    }
  }

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
        { /* FlatList of Conversations */ }
        <View style={ styles.top }>
          { areaConversations.length === 0 ? <ActiveUsersEmpty onRefresh={ onRefresh } /> : <SwipeListView
            keyExtractor={ (item, key) => item.userObjects ? item.id + Math.random() : item._id + Math.random() }
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

              let timeOfActivation;
        
              if (data.item.lastMessageTime) {
                timeOfActivation = new Date();
              }
              else {
                timeOfActivation = data.item.timeOfActivation.seconds ? new Date(data.item.timeOfActivation.seconds) : new Date(data.item.timeOfActivation);
              }

              // convo.active indicates this is a user, so check if they are active, else it is an active converastion
              const active = data.item.active ? data.item.active && new Date(timeOfActivation) > new Date(_12HoursAgo) : true;

              return (
              <View key={data.item.id + Math.random().toString() } style={active ? styles.rowBack : styles.rowBackInactive }>
                <TouchableOpacity
                  activeOpacity={ 1 }
                  style={ [styles.backRightBtn, styles.backRightBtnRight] }
                  onPress={ data.item.requestAlreadyMade ? () => Alert.alert("", "You have already requested a game of catch with this user. They are still considering your request.") : () => request(data.item) }
                >
                    <Text style={styles.backTextWhite}>{ "Request To Join" }</Text>
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
              let timeOfActivation;
              let now = new Date();
              let hours;
            
              if (item.lastMessageTime) {
                timeOfActivation = new Date(item.lastMessageTime.seconds * 1000);
                const milliseconds = Math.abs(now - timeOfActivation);
                hours = Math.round(milliseconds / 36e5);
              }
              else {
                timeOfActivation = item.timeOfActivation.seconds ? new Date(item.timeOfActivation.seconds * 1000) : new Date(item.timeOfActivation);
                const milliseconds = Math.abs(now - timeOfActivation);
                hours = Math.round(milliseconds / 36e5);
              }

              if (item.userObjects) {
                const conversation = item.userObjects.length > 1 ? true : false;
              return <AreaConversationRow key={ item.id } users={ item.userObjects } distance={ item.distance } hours={ hours } />
              }
              else {
                // this will always only be one user, but in an array [{ }] so you can reuse the AreaConversationRow component
                return <AreaConversationRow key={ item.id } users={ [item] } distance={ item.distance } hours={ hours } />
              }
            }}
            ListFooterComponent={() => areaConversations.length ?  <View style={ styles.body }>
            <Image style={ styles.calloutImage } source={require('../../../assets/ex1.png')} />
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

          let timeOfActivation;
          let now = new Date();
          let hours;
        
          if (convo.lastMessageTime) {
            timeOfActivation = new Date(convo.lastMessageTime.seconds * 1000);
            const milliseconds = Math.abs(now - timeOfActivation);
            hours = Math.round(milliseconds / 36e5);
          }
          else {
            timeOfActivation = convo.timeOfActivation.seconds ? new Date(convo.timeOfActivation.seconds * 1000) : new Date(convo.timeOfActivation);
            const milliseconds = Math.abs(now - timeOfActivation);
            hours = Math.round(milliseconds / 36e5);
          }

          const users = convo.userObjects ? convo.userObjects : [convo];
          const len = users.length;

          let sixHoursAgo = new Date();
          sixHoursAgo.setHours(sixHoursAgo.getHours() - 6);


          return (
            <Marker
              pinColor={ i === 0 ? "green" : "red" }
              key={ "pin" + convo.id }
              coordinate={{ latitude: convo.coordinates.latitude, longitude: convo.coordinates.longitude }}
              // title={ pin.name }
              // description={ pin.profile_text }
              // onCalloutPress={ () => navigation.navigate("ProfileFull", { user: pin }) }
            >
              <Callout onPress={ i === 0 ? undefined : () => props.navigation.navigate("UsersList", { users }) }>
                <Image style={ styles.image } source={{ uri: users[0].photo }} />
                { len === 1 ? [] : len === 2 ? <Image style={ styles.image2 } source={{ uri: users[1].photo }} /> : <View style={ styles.groupChatAvatar }><Text>+{ len }</Text></View> }
                { i === 0 ?<Text style={ styles.centerText }>{ convo.active && new Date(timeOfActivation) > new Date(sixHoursAgo) ? "Active" : "Inactive" }</Text> : <Fragment><View style={ styles.centerText }>
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
    marginVertical: 8
  },
  calloutImage: {
    borderRadius: 50,
    height: imageDimensions,
    width: imageDimensions,
    marginRight: imageMarginR
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
    width: width,
    paddingTop: 20
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
  rowBackInactive: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    backgroundColor: "gray"
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
