// if drag touch starts in bottom half of card, angle should tilt upward instead of downward
import React, {  useLayoutEffect, useEffect, useState, useContext } from 'react';
import { Alert, Dimensions, Image, Keyboard, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import ReportModalProfile from './ReportModalProfile';
import ProfileHeader from './ProfileHeader';

import { StoreContext } from '../../../contexts/storeContext';

import { blockUser } from '../../../firebase.js';

import { getDistance } from '../../../utils.js';

const { width, height } = Dimensions.get("window");

const ProfileFull = (props) => {

  const store = useContext(StoreContext);
  const user0 = store.user;
  
  const user1 = props.route.params.users[0]; // user being displayed in ProfileFull

  const today = new Date();
  const birthDate = user1.date_of_birth.seconds ? new Date(user1.date_of_birth.seconds * 1000) : new Date(user1.date_of_birth);
  let user1Age = today.getFullYear() - birthDate.getFullYear();
  let m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    user1Age--;
  }

  const distance0 = getDistance(user0.coordinates, user1.coordinates);
  const distance = Math.round(distance0 * 10) / 10;

  const sportsKeys = Object.getOwnPropertyNames(user1.sports);

  const [loaded, setLoaded] = useState(false);
  const [reportModal, setReportModal] = useState(false);

  useEffect(() => {
    if (!loaded) {
      setLoaded(true);
    }
  }, []);

  {/* Set Header */}
  useLayoutEffect(() => {
    props.navigation.setOptions({
      headerTitle: () => <ProfileHeader handleMenu={ handleMenu } reportModal={ reportModal } setReportModal={ setReportModal } navigation={ props.navigation } />
    });
  }, [loaded]);

  const handleMenu = () => {
    Keyboard.dismiss();
    setReportModal(true);
  }


  const handleBlock2 = async () => {

    const userObj1 = {
      userAvatar: user1.photo,
      userName: user1.name,
      userId: user1._id
    }
    // const convo = convo; // already defined above

    try {
      const res1 = await blockUser(user0, user1);

      if (res1) {
        const newState2 = {...user0 };
        console.log("newState2 : ", newState2);
        if (newState2.blockedUsers) {
          newState2.blockedUsers.push(userObj1);
        }
        else {
          newState.blockedUsers = [userObj1];
        }
        store.setUser(newState2);
        
        Alert.alert("", "User has been blocked", [
          { text: "OK", onPress: () => {
            setReportModal(false);
            props.navigation.pop()
          }},
        ]);
      }

      else {
        Alert.alert("", "There was a problem. Please try again.");
      }
    }
    catch(e) {
      console.log("handle block error : ", e);
      Alert.alert("", "There was a problem. Please try again.");
    }
  }



  return (
    <View style={{ flexGrow: 1 }}>
      <SafeAreaView style={ styles.flexZero } />
        <ScrollView
          contentContainerStyle={ styles.scrollViewOuter }
          scrollEnabled={ true }
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
          <View style={ styles.nameAndAgeWrapper }>
            <Text style={ styles.distanceText }>{ distance <= 1 ? "Less than a mile away" : distance + " miles away" }</Text>
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
            pitchEnabled={ false }
            rotateEnabled={ false }
          >
            <Marker
              pinColor="red"
              coordinate={{ latitude: user1.coordinates.latitude, longitude: user1.coordinates.longitude }}
            />
          </MapView>
        <View style={ styles.bottom } />
      </ScrollView>
      { reportModal && <ReportModalProfile
          reportModal={ reportModal }
          setReportModal={ setReportModal }
          handleBlock2={ handleBlock2 }
          height={ height }
      /> }
    </View>
  )
}

const styles = StyleSheet.create({
  bottom: {
    height: 600,
    backgroundColor: "#f5f5f5"
  },
  distanceText: {
    fontSize: 13
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
    paddingHorizontal: 20,
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
  skillLevel: {
    fontWeight: "500",
    textAlign: "center",
    fontSize: 12
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