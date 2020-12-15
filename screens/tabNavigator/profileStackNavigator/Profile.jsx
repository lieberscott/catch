import React, { useState, useEffect, useContext } from 'react';
import { Alert, Animated, Dimensions, Image, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { AdMobBanner, setTestDeviceIDAsync } from 'expo-ads-admob';

import { createConvo, updateUser, uploadImage, signOut } from '../../../firebase.js';
import { addPhoto } from '../../../utils.js';
import Map from './Map';

import { StoreContext } from '../../../contexts/storeContext.js';
const mHorizontal = 20; // body margin
const turquoise = "#4ECDC4";
const bodyMarginTop = 20;

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const { width } = Dimensions.get("window");

const Profile = (props) => {

  const store = useContext(StoreContext);

  const [activeSport, setActiveSport] = useState(-1);
  const [locationModal, setLocationModal] = useState(false);

  useEffect(() => {
    (async () => {
      // Set global test device ID
      await setTestDeviceIDAsync('EMULATOR');
    })()
  }, []);

  const user = store.user;
  const userId = user._id;
  const userPhoto = user.photo ? user.photo : 'https://firebasestorage.googleapis.com/v0/b/catchr-f539d.appspot.com/o/images%2F101120%2Fblank_user.png?alt=media&token=05a1f71c-7377-43a8-9724-8d0d1d068467';
  const userName = user.name;



  const updateActive1 = (bool) => {

    const ios = Platform.OS === "ios";

    if (bool) {
      Alert.alert("", "Which Activity do you want to play?", [
        { text: "Baseball", onPress: () => updateActive2(true, 0) },
        { text: "Football", onPress: () => updateActive2(true, 1) },
        { text: ios ? "Frisbee" : "Show Others", onPress: ios ? () => updateActive2(true, 2) : () => updateActiveAndroid2(bool) }, // since Android can only show 3 max options, this is needed for that case
        { text: "Basketball", onPress: () => updateActive2(true, 3) }, // again, since Android can only show 3 max options, this does not need a conditional since it will show on ios and simply won't on Android
        { text: "Close" }
      ])
    }
    else {
      updateActive2(false, -1);
    }
  }

  const updateActiveAndroid2 = (bool) => {
    Alert.alert("", "Which Activity do you want to play?", [
      { text: "Frisbee", onPress: () => updateActive2(true, 2) },
      { text: "Basketball", onPress: () => updateActive2(true, 3) },
      { text: "Close" }
    ])
  }

  const updateActive2 = (bool, activeSportNum) => {
    setActiveSport(activeSportNum);
    setLocationModal(true);
  }


  

  {/* Get age */}
  const today = new Date();
  const userDOB = !user.dateOfBirth ? undefined : user.dateOfBirth.seconds ? new Date(user.dateOfBirth.seconds * 1000) : new Date(user.dateOfBirth);
  let userAge = "";
  if (userDOB) {
    const milliseconds = userDOB.getTime();
    const birthday = new Date(milliseconds);
    userAge = today.getFullYear() - birthday.getFullYear();
    if (today.getMonth() < birthday.getMonth() || 
    today.getMonth() == birthday.getMonth() && today.getDate() < birthday.getDate()) {
      userAge--;
    }
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

  const handleLoc = (coords) => {
    Alert.alert("", "Is this game beginner friendly?", [
      { text: "Yes", onPress: () => create(coords, true) },
      { text: "No", onPress: () => create(coords, false) },
      { text: "Cancel", onPress: () => setLocationModal(coords, false) }
    ])
  }

  const create = async (gameCoords, beginnerFriendly) => {
    try {
      const res1 = await createConvo(user, activeSport, gameCoords, beginnerFriendly);
      Alert.alert("", "Your game was created!", [
        { text: "OK", onPress: () => setLocationModal(false) }
      ]);

    }
    catch (e) {
      console.log("create error : ", e);
      Alert.alert("", "Error. Please try again.", [
        { text: "OK", onPress: () => setLocationModal(false) }
      ]);
    }
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
              <Image source={{ uri: userPhoto || "https://firebasestorage.googleapis.com/v0/b/catchr-f539d.appspot.com/o/images%2F101120%2Fblank_user.png?alt=media&token=05a1f71c-7377-43a8-9724-8d0d1d068467" }} style={ styles.image } />
            </TouchableOpacity>
            <AnimatedTouchableOpacity style={ styles.imageIconWrapper } onPress={ () => choosePhoto() }>
              <View style={ styles.imageIconWrapper2 }>
                <MaterialIcons name="add-a-photo" color="gray" size={ 33 } style={ styles.imageIcon } />
              </View>
            </AnimatedTouchableOpacity>
          </View>
          <Text style={ styles.nameAndAge }>{ userName }{ userAge ? ", " + userAge : "" }</Text>
          <View style={ styles.locationWrapper }>
            <Text style={ styles.location }>{ user.location }</Text>
          </View>
        </View>
        <TouchableOpacity style={ styles.createGame } onPress={ () => updateActive1(true) }>
          <Text>Create New Game</Text>
        </TouchableOpacity>



        <View style={ styles.oneSection}>
          <View style={ styles.headerWrapper }>
            <MaterialIcons name="edit-location" size={ 23 } color="gray" />
            <Text style={ styles.header }>Location</Text>
          </View>
          <View style={ styles.buttonWrapper }>
            <TouchableOpacity style={ styles.touchable } onPress={() => props.navigation.navigate("Map", { coordinates: user.coordinates, updateProfile })}>
              <Text>Change Location</Text>
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
          {/* <View style={ styles.buttonWrapper }>
            <TouchableOpacity style={ styles.touchable } onPress={() => props.navigation.navigate("DateOfBirth", { dob: !user.dateOfBirth ? undefined : user.dateOfBirth.seconds ? new Date(user.dateOfBirth.seconds * 1000) : user.dateOfBirth, updateProfile })}>
              <Text>Age</Text>
              <MaterialIcons name="chevron-right" color="gray" size={ 23 } />
            </TouchableOpacity>
          </View> */}
          <View style={ styles.buttonWrapper }>
            <TouchableOpacity style={ styles.touchable } onPress={() => props.navigation.navigate("Gender", { gender: user.gender, updateProfile })}>
              <Text>{ user.gender === true ? "Female" : user.gender === false ? "Male" : "Gender" }</Text>
              <MaterialIcons name="chevron-right" color="gray" size={ 23 } />
            </TouchableOpacity>
          </View>
          <View style={ styles.buttonWrapper }>
            <TouchableOpacity style={ styles.touchable } onPress={() => props.navigation.navigate("ProfileText", { profileText: user.profileText, updateProfile })}>
              <Text>Profile Text</Text>
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

      <Modal
        animationType="slide"
        transparent={true}
        visible={ locationModal }
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
        }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <Map createGame={ true } handleLoc={ handleLoc } coordinates={ user.coordinates } />
        </SafeAreaView>
      </Modal>



    </View>
  )
}

const styles = StyleSheet.create({
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
  createGame: {
    marginHorizontal: mHorizontal,
    marginVertical: 10,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "#efefef",
    borderRadius: 20,
    paddingVertical: 10,
    backgroundColor: "pink"
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
    borderRadius: 30,
    backgroundColor: "white",
    borderColor: "white",
    borderWidth: 3.5,
    right: -10,
    elevation: 1,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1
  },
  imageIconWrapper2: {
    borderRadius: 20,
    borderColor: "#ccc",
    borderWidth: 1
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
