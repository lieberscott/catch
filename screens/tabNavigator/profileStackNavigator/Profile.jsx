import React, { useState, useEffect, useContext } from 'react';
import { Alert, Animated, Dimensions, Image, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import MapView from 'react-native-maps';
import { AdMobBanner, setTestDeviceIDAsync } from 'expo-ads-admob';

import { updateUser, uploadImage, signOut } from '../../../firebase.js';
import { addPhoto } from '../../../utils.js';

import { StoreContext } from '../../../contexts/storeContext.js';
const mHorizontal = 20; // body margin
const turquoise = "#4ECDC4";
const bodyMarginTop = 20;

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const { width } = Dimensions.get("window");

const Profile = (props) => {

  const store = useContext(StoreContext);

  useEffect(() => {
    (async () => {
      // Set global test device ID
      await setTestDeviceIDAsync('EMULATOR');
    })()
  }, []);

  const user = store.user;
  const userId = user._id;
  const userPhoto = user.photo ? user.photo : "https://firebasestorage.googleapis.com/v0/b/catchr-f539d.appspot.com/o/images%2F2020910%2Fblank_user.png?alt=media&token=45db0019-77b8-46ef-b4fb-c78a4749484c";
  const userName = user.name;


   {/* Get active status */}
  const active0 = user.active;
  const timeOfActivation0 = user.timeOfActivation || new Date();
  const timeOfActivation = timeOfActivation0.seconds ? new Date(timeOfActivation0.seconds) : new Date(timeOfActivation0);
  const today = new Date();
  const milliseconds0 = Math.abs(today - timeOfActivation);
  const hours = milliseconds0 / 36e5;

  const a = active0 && hours < 6 ? true : false;

  const [active, setActive] = useState(a);

  const updateActive1 = (bool) => {
    if (bool) {
      Alert.alert("", "Which Activity do you want to play?", [
        { text: "Baseball", onPress: () => updateActive2(true, 0) },
        { text: "Football", onPress: () => updateActive2(true, 1) },
        { text: "Frisbee", onPress: () => updateActive2(true, 2) },
        { text: "Basketball", onPress: () => updateActive2(true, 3) }
      ])
    }
    else {
      updateActive2(false, -1);
    }
  }

  const updateActive2 = (bool, activeSportNum) => {
    setActive(bool);
    updateProfile({ active: bool, activeSport: activeSportNum, timeOfActivation: new Date() }, 1)
  }

  {/* Get age */}
  // const today = new Date(); // today is declared above
  const userDOB = user.dateOfBirth.seconds ? new Date(user.dateOfBirth.seconds * 1000) : new Date(user.dateOfBirth);
  const milliseconds = userDOB.getTime();
  const birthday = new Date(milliseconds);
  let userAge = today.getFullYear() - birthday.getFullYear();
  if (today.getMonth() < birthday.getMonth() || 
  today.getMonth() == birthday.getMonth() && today.getDate() < birthday.getDate()) {
    userAge--;
  }

  const choosePhoto = async () => {
    let arr;
    let downloadUrl;
    let result;
    try {
      arr = await addPhoto(userId);
      if (arr) { // arr == [blob, name] || false
        downloadUrl = await uploadImage(arr[0], arr[1], user.photo); // user.photo == prevUrl
      }
      if (downloadUrl) {
        const update = { photo: downloadUrl }
        result = await updateUser(update, userId)
      }
      if (result) {
        // update locally
        store.setUser(prevState => ({...prevState, photo: downloadUrl}))
      }
    }
    catch (e) {
      console.log("choose Photo error : ", e);
      Alert.alert("", "There was an error. Please try again.");
    }
  }

  const updateProfile = async (update, num, coords) => {
    const result = await updateUser(update, userId, coords);
    if (result) {
      // update locally
      const key = Object.keys(update);
      if (key.length > 1) {
        store.setUser(prevState => ({...prevState, [key[0]]: update[key[0]], [key[1]]: update[key[1]], [key[2]]: update[key[2]] }))
      }
      else {
        store.setUser(prevState => ({...prevState, [key]: update[key] }))
      }
    }
    if (num > 2) {
      props.navigation.pop();
    }
  }

  const handleDelete = () => {
    Alert.alert("", "Are you sure you want to delete your profile? This can not be undone. All data will be lost.", [
      { text: "OK", onPress: () => props.navigation.navigate("Reauthorization", { photoUrl: user.photo }) },
      { text: "Cancel" }
    ]);
  }

  const signOut1 = () => {
    Alert.alert("", "Are you sure you want to sign out?", [
      { text: "Yes", onPress: () => signOut() },
      { text: "No" }
    ])
  }


  return (
     <View style={ styles.container }>
      <SafeAreaView style={ styles.flexZero } />
      <AdMobBanner
        bannerSize="banner"
        adUnitID={ Platform.OS === 'ios' ? "ca-app-pub-8262004996000143/8383797064" : "ca-app-pub-8262004996000143/6607680969" } // Test ID, Replace with your-admob-unit-id
        servePersonalizedAds // true or false
        onDidFailToReceiveAdWithError={(err) => console.log("error : ", err)}
      />
      <ScrollView style={ styles.body }>
        <View style={ styles.top }>
          <View>
            <TouchableOpacity style={ styles.imageWrapper } onPress={ () => props.navigation.navigate("ProfileFull", { users: [user] })}>
              <Image source={{ uri: userPhoto }} style={ styles.image } />
            </TouchableOpacity>
            <AnimatedTouchableOpacity style={ styles.imageIconWrapper } onPress={ () => choosePhoto() }>
              <MaterialIcons name="add-a-photo" color="gray" size={ 33 } style={ styles.imageIcon } />
            </AnimatedTouchableOpacity>
          </View>
          <Text style={ styles.nameAndAge }>{ userName }, { userAge }</Text>
          <View style={ styles.locationWrapper }>
            <Text style={ styles.location }>{ user.location }</Text>
          </View>
        </View>
        <View style={ styles.oneSection}>
          <View style={ styles.buttonWrapper }>
            <View style={ styles.touchable } onPress={() => props.navigation.navigate("ProfileText", { profileText: user.profileText, updateProfile })}>
              <Text>Active</Text>
              <Switch
                trackColor={{ false: "#e4e4e4", true: "green" }}
                thumbColor="white"
                ios_backgroundColor="#efefef"
                onValueChange={ (bool) => updateActive1(bool) }
                value={ active }
              />
            </View>
          </View>
          <Text style={ active && user.activeSport < 4 && user.activeSport > -1 ? styles.activeSportText : styles.activeSportText2 }>{ user.activeSport === 0 ? "Baseball" : user.activeSport === 1 ? "Football" : user.activeSport === 2 ? "Frisbee" : user.activeSport === 3 ? "Basketball" : "Not currently active" }</Text>
          <Text style={ styles.small }>Users will stay active for 6 hours.</Text>
        </View>



        <View style={ styles.oneSection}>
          <View style={ styles.headerWrapper }>
            <MaterialIcons name="person-outline" size={ 23 } color="gray" />
            <Text style={ styles.header }>Location</Text>
          </View>
          <View style={ styles.mapContainer }>
          <MapView
              style={ styles.mapStyle }
              // showsUserLocation={ true }
              // followsUserLocation={ true }
              region={{ latitude: user.coordinates.latitude, longitude: user.coordinates.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
              // maxZoomLevel={ 17 }
              // minZoomLevel={ 6 }
              // provider={PROVIDER_GOOGLE}
              zoomEnabled={ false }
              scrollEnabled={ false }
              // onUserLocationChange={() => changeLocation() }
            />
            <View style={ styles.imageWrapper2 }>
              <Image
                source={require('../../../assets/pin.png')}
                style={ styles.image }
                resizeMode="contain"
              />
            </View>
          </View>
          <View style={ styles.buttonWrapper }>
            <TouchableOpacity style={ styles.touchable } onPress={() => props.navigation.navigate("Map", { coordinates: user.coordinates, updateProfile })}>
              <Text>Change Location</Text>
              <MaterialIcons name="chevron-right" color="gray" size={ 23 } />
            </TouchableOpacity>
          </View>
        </View>



        <View style={ styles.oneSection}>
          <View style={ styles.buttonWrapper }>
            <TouchableOpacity style={ styles.touchable } onPress={() => props.navigation.navigate("ProfileText", { profileText: user.profileText, updateProfile })}>
              <Text>Profile Text</Text>
              <MaterialIcons name="chevron-right" color="gray" size={ 23 } />
            </TouchableOpacity>
          </View>
        </View>
        <View style={ styles.oneSection}>
          <View style={ styles.headerWrapper }>
            <MaterialIcons name="person-outline" size={ 23 } color="gray" />
            <Text style={ styles.header }>Personal</Text>
          </View>
          <View style={ styles.buttonWrapper }>
            <TouchableOpacity style={ styles.touchable } onPress={() => props.navigation.navigate("Name", { name: user.name, updateProfile })}>
              <Text>{ user.name || "Name" }</Text>
              <MaterialIcons name="chevron-right" color="gray" size={ 23 } />
            </TouchableOpacity>
          </View>
          <View style={ styles.buttonWrapper }>
            <TouchableOpacity style={ styles.touchable } onPress={() => props.navigation.navigate("DateOfBirth", { dob: user.dateOfBirth.seconds ? new Date(user.dateOfBirth.seconds * 1000) : user.dateOfBirth, updateProfile })}>
              <Text>{ userAge || "Age" }</Text>
              <MaterialIcons name="chevron-right" color="gray" size={ 23 } />
            </TouchableOpacity>
          </View>
          <View style={ styles.buttonWrapper }>
            <TouchableOpacity style={ styles.touchable } onPress={() => props.navigation.navigate("Gender", { gender: user.gender, updateProfile })}>
              <Text>{ user.gender ? "Female" : "Male" }</Text>
              <MaterialIcons name="chevron-right" color="gray" size={ 23 } />
            </TouchableOpacity>
          </View>
        </View>
        <View style={ styles.oneSection}>
          <View style={ styles.headerWrapper }>
            <MaterialIcons name="card-travel" size={ 23 } color="gray" />
            <Text style={ styles.header }>Basic Info</Text>
          </View>
          <View style={ styles.buttonWrapper }>
            <TouchableOpacity style={ styles.touchable } onPress={() => props.navigation.navigate("Sports", { sports: user.sports, updateProfile })}>
              <Text>{ user.occupation || "Sports" }</Text>
              <MaterialIcons name="chevron-right" color="gray" size={ 23 } />
            </TouchableOpacity>
          </View>
          <View style={ styles.buttonWrapper }>
            <TouchableOpacity style={ styles.touchable } onPress={() => props.navigation.navigate("Notifications", { notifications: user.getsNotifications, updateProfile })}>
              <Text>{ user.company || "Notifications" }</Text>
              <MaterialIcons name="chevron-right" color="gray" size={ 23 } />
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ height: 60 }} />
        <View style={ styles.oneSection}>
          <View style={ styles.headerWrapper }>
            <MaterialIcons name="settings" size={ 23 } color="gray" />
            <Text style={ styles.header }>Danger Zone</Text>
          </View>
          <View style={ styles.buttonWrapper }>
            <TouchableOpacity style={ styles.touchableOrange } onPress={() => signOut1()}>
              <Text style={{ color: "orange" }}>Sign Out</Text>
              <MaterialIcons name="chevron-right" color="orange" size={ 23 } />
            </TouchableOpacity>
          </View>
          <View style={ styles.buttonWrapper }>
            <TouchableOpacity style={ styles.touchableRed } onPress={() => handleDelete() }>
              <Text style={{ color: "red" }}>Delete</Text>
              <MaterialIcons name="chevron-right" color="red" size={ 23 } />
            </TouchableOpacity>
          </View>
        </View>
        <View style={ styles.bottomArea } />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  activeSportText: {
    backgroundColor: "green",
    padding: 5,
    color: "white",
    textAlign: "center",
    marginVertical: 4
  },
  activeSportText2: {
    backgroundColor: "#efefef",
    padding: 5,
    color: "black",
    textAlign: "center",
    marginVertical: 4
  },
  body: {
  	backgroundColor: "#fdfdfd",
    flexGrow: 1,
    width: width,
    marginTop: bodyMarginTop
    // alignItems: "center"
  },
  bottomArea: {
    height: 300
  },
  buttonWrapper: {
    flexDirection: "row"
  },
  container: {
    alignItems: "center",
    backgroundColor: "#fdfdfd"
  },
  flexZero: {
    flex: 0
  },
  header: {
    color: "gray",
    marginLeft: 10
  },
  headerWrapper: {
    flexDirection: "row",
    alignItems: "center"
  },
  image: {
    height: null,
    width: null,
    flex: 1,
    borderRadius: 90
  },
  imageWrapper: {
    height: 150,
    width: 150,
    borderRadius: 90
  },
  imageWrapper2: {
    position: "absolute",
    left: "49%",
    bottom: "50%",
    height: 30,
    width: 30 
  },
  imageIcon: {
    alignSelf: "center",
    borderRadius: 20,
    padding: 5
  },
  imageIconWrapper: {
    position: "absolute",
    borderRadius: 20,
    backgroundColor: "white",
    right: -10,
    elevation: 1,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1
  },
  location: {
    fontSize: 18,
    color: "red",
    fontWeight: "600"
  },
  locationWrapper: {
    flexDirection: "row",
    alignItems: "center"
  },
  mapContainer: {
    height: 300,
    width: "100%",
    borderRadius: 20,
    alignSelf: "center"
  },
  mapStyle: {
    flex: 1,
    overflow: "hidden",
    borderRadius: 20
  },
  nameAndAge: {
    fontSize: 28
  },
  oneSection: {
    marginHorizontal: mHorizontal,
    marginVertical: 10
  },
  signoutText: {
    flexWrap: "wrap",
    flex: 1
  },
  signoutWrapper: {
    width: "95%",
    backgroundColor: turquoise,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    marginTop: 2,
    alignSelf: "center",
    marginBottom: 40
  },
  small: {
    width: "80%",
    alignSelf: "center",
    marginTop: 5
  },
  top: {
    alignItems: "center",
    justifyContent: "center",
    flex: 7,
    width: "100%"
  },
  touchable: {
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 1,
    borderWidth: 0.5,
    borderColor: "gray",
    borderRadius: 20,
    padding: 10,
    marginTop: 10,
    alignItems: "center"
  },
  touchableOrange: {
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 1,
    borderWidth: 0.5,
    borderColor: "orange",
    borderRadius: 20,
    padding: 10,
    marginTop: 10,
    alignItems: "center"
  },
  touchableRed: {
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 1,
    borderWidth: 0.5,
    borderColor: "red",
    borderRadius: 20,
    padding: 10,
    marginTop: 10,
    alignItems: "center"
  }
});

export default Profile;
