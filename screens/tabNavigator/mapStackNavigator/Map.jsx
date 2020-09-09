import React, { Fragment, useState, useEffect, useContext, useRef } from 'react';
import { FlatList, Image, SafeAreaView, StatusBar, StyleSheet, Text, View, Dimensions, Button, TouchableOpacity, Alert, ScrollView } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from 'react-native-maps';

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
  const usersFromMongo = store.usersFromMongo || [];
  const areaConversations = areaConversations0.concat(usersFromMongo);

  return (
    <Fragment>
      <SafeAreaView style={{ flex: 0 }} />
    <View style={ styles.container }>
      <StatusBar barStyle="dark-content" />
      { /* FlatList of Conversations */ }
      <View style={ styles.top }>
        { areaConversations.length === 0 ? <ActiveUsersEmpty userPhoto={ userPhoto } /> : <FlatList
          keyExtractor={ (item, key) => item.userObjects ? item.id + Math.random() : item._id + Math.random() }
          data={ areaConversations }
          ItemSeparatorComponent={() => <View style={ styles.alignCenter }><View style={ styles.separator } /></View> }
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
        { areaConversations0.length ? areaConversations0.map((convo, i) => {
          return (
            <Marker
              pinColor="red"
              key={ "pin" + i }
              coordinate={{ latitude: convo.coordinates.latitude, longitude: convo.coordinates.longitude }}
              // title={ pin.name }
              // description={ pin.profile_text }
              // onCalloutPress={ () => navigation.navigate("ProfileFull", { user: pin }) }
            >
              <Callout onPress={ () => props.navigation.navigate("ProfileFull", { user }) }>
                <Text>{ user.name }</Text>
                <Text>{ user.profile_text }</Text>
                <View>
                  <Text>Send an intro</Text>
                </View>
              </Callout>
            </Marker>
          )
        }) : <Text>""</Text> }
      </MapView>
    </View>
    </Fragment>
  )
}

const styles = StyleSheet.create({
  body: {
    flexDirection: "row",
    marginVertical: 8
  },
  top: {
    flex: 1,
    backgroundColor: "white",
    borderWidth: 1,
    width: "100%"
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
  textWrapper: {
    justifyContent: "center",
    flex: 1
  }
});

export default Map;
