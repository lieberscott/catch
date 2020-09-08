// if drag touch starts in bottom half of card, angle should tilt upward instead of downward
import React, { Fragment, useState, useContext } from 'react';
import { Alert, Animated, Button, Dimensions, FlatList, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from 'react-native-maps';

import { StoreContext } from '../../../contexts/storeContext';
import { Ionicons } from '@expo/vector-icons';
import * as firebase from 'firebase';
import firestore from 'firebase/firestore';


const { width, height } = Dimensions.get("window");

const ProfileFull = (props) => {

  const store = useContext(StoreContext);
  const user0 = store.user;
  
  const user1 = props.route.params.users[0]; // user being displayed in ProfileFull

  const today = new Date();
  const birthDate = new Date(user1.dateOfBirth.seconds * 1000);
  let user1Age = today.getFullYear() - birthDate.getFullYear();
  let m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    user1Age--;
  }
  
  const conversation = props.route.params.conversation || false; // if request is for a current conversation
  const conversationId = props.route.params.conversationId || false;
  const requestFromOther = props.route.params.requestFromOther;

  const sportsKeys = Object.getOwnPropertyNames(user1.sports);

  const [responded, setResponded] = useState(false);


  return (
    <Fragment>
      <SafeAreaView style={ styles.flexZero } />
        <ScrollView
          contentContainerStyle={ styles.scrollViewOuter }
          // bouncesZoom="true"
          // directionalLockEnabled={ true }
          // fadingEdgeLength={ 500 }
          scrollEnabled={ true }
          // overflow="scroll"
          showsVerticalScrollIndicator={ false }
          pinchGestureEnabled={ false }
        >
          <View style={ styles.scrollViewInner}>
            <Image
              source={{ uri: user1.photo || "https://www.neoarmenia.com/wp-content/uploads/generic-user-icon-19.png" }}
              style={ styles.image }
            />
          </View>
          <View style={ styles.nameAndAgeWrapper }>
            <Text style={ styles.nameAndAgeText }>{ user1.name }, { user1Age }, { user1.gender ? "F" : "M" }</Text>
          </View>
          <View style={ styles.profileTextWrapper }>
            <Text>{ user1.profileText }</Text>
          </View>
          <View style={ styles.sportsWrapper }>
            { sportsKeys.map((item, i) => {
              return (
                <View key={ item } style={ styles.sport }>
                  { item === "Football" ? <Image resizeMode="contain" source={require(`../../../assets/football.png`)} style={ styles.sportsImage } />
                  : item === "Baseball" ? <Image resizeMode="contain" source={require(`../../../assets/ball-and-glove.png`)} style={ styles.sportsImage } />
                  : <Image resizeMode="contain" source={require(`../../../assets/frisbee.png`)} style={ styles.sportsImage } /> }
                  <Text style={ styles.skillLevel }>{ user1.sports[item].skill_level }</Text>
                </View>
              )
            })}
          </View>
          <MapView
            style={ styles.mapStyle }
            provider={PROVIDER_GOOGLE}
            camera={{ center: { latitude: user1.coordinates.latitude, longitude: user1.coordinates.longitude }, pitch: 0, heading: 1, altitude: 11, zoom: 11 }}
            pitchEnabled={ false }
            minZoomLevel={ 7 }
            maxZoomLevel={ 19 }
            // onRegionChangeComplete={(offsets) => handleRegionChange(offsets)}
            pitchEnabled={ false }
            rotateEnabled={ false }
            // onMapReady={() => mapRef.animateCamera({ latitude: userLat, longitude: userLng, latitudeDelta: latDelta, longitudeDelta: lngDelta })}
          >
            <Marker
              pinColor="red"
              coordinate={{ latitude: user1.coordinates.latitude, longitude: user1.coordinates.longitude }}
              // title={ pin.name }
              // description={ pin.profile_text }
              // onCalloutPress={ () => navigation.navigate("ProfileFull", { user: pin }) }
            />
          </MapView>
          <View style={ styles.bottom } />
        </ScrollView>
    </Fragment>
  )
}

const styles = StyleSheet.create({
  bottom: {
    height: 600,
    backgroundColor: "#f5f5f5"
  },
  buttonAccept: {
    backgroundColor: "rgba(2, 117, 216, 0.9)",
    flex: 1,
    paddingVertical: 6,
    borderRadius: 5,
    marginHorizontal: 10
  },
  buttonReject: {
    backgroundColor: "rgba(255, 0, 0, 0.9)",
    flex: 1,
    paddingVertical: 6,
    borderRadius: 5,
    marginHorizontal: 10
  },
  buttonText: {
    textAlign: "center",
    color: "#eee"
  },
  flexZero: {
    flex: 0
  },
  image: {
    height: null,
    width: null,
    flex: 1,
    borderRadius: 300,
    resizeMode: "cover"
  },
  mapStyle: {
    height: 250,
    width: "100%",
    borderRadius: 5,
    alignSelf: "center"
  },
  message: {
    flex: 1
  },
  nameAndAgeWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10
  },
  nameAndAgeText: {
    fontSize: 20
  },
  profileTextWrapper: {
    width: "100%",
    paddingVertical: 20
  },
  scrollViewInner: {
    height: 200,
    width: 200,
    borderRadius: 500,
    alignSelf: "center",
    marginTop: 30
  },
  scrollViewOuter:{
    backgroundColor: "white",
    height: height,
    width: width
  },
  sendMessage: {
    borderRadius: 10,
    position: "absolute",
    top: "90%",
    width: "95%",
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    flexDirection: "row"
  },
  skillLevel: {
    fontWeight: "500",
    textAlign: "center",
    fontSize: 12
  },
  sportText: {
    flexWrap: "wrap",
    fontWeight: "700",
    fontSize: 17
  },
  sport: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18
  },
  sportsImage: {
    height: 50,
    width: 50,
    marginBottom: 10
  },
  sportsWrapper: {
    flexDirection: "row",
    width: "100%",
    backgroundColor: "#f5f5f5"
  }
});

export default ProfileFull;