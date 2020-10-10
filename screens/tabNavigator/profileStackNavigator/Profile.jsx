import React, { useState, useEffect, useContext } from 'react';
import { Alert, Animated, Dimensions, Image, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import MapView from 'react-native-maps';
import { AdMobBanner, setTestDeviceIDAsync } from 'expo-ads-admob';

import { updateUser, uploadImage, deleteUser, signOut, createConvos, getAuthUser, addTestCloudFunctionsData, testCloudFunctionsLocally, deleteOldConvosTest, addRequestTest } from '../../../firebase.js';
import { addPhoto } from '../../../utils.js';

import { StoreContext } from '../../../contexts/storeContext.js';
const mHorizontal = 20; // body margin
const turquoise = "#4ECDC4";
const bodyMarginTop = 20;

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const { width } = Dimensions.get("window");

const Profile = (props) => {

  console.log("Step 7A: Profile 1");

  const store = useContext(StoreContext);
  console.log("Step 7B: Profile 2");

  useEffect(() => {
    (async () => {
      // Set global test device ID
      await setTestDeviceIDAsync('EMULATOR');
    })()
  }, []);

  const user = store.user;
  const userId = user._id;
  const userPhoto = user.photo ? user.photo : "https://www.neoarmenia.com/wp-content/uploads/generic-user-icon-19.png";
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

  const updateActive = (bool) => {
    setActive(bool);
    updateProfile({ active: bool, timeOfActivation: new Date() }, 1)
  }

  {/* Get age */}
  // const today = new Date(); // today is declared above
  const userDOB = user.date_of_birth.seconds ? new Date(user.date_of_birth.seconds * 1000) : new Date(user.date_of_birth);
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
      store.setUser(prevState => ({...prevState, [key]: update[key] }))
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
                onValueChange={ (bool) => updateActive(bool) }
                value={ active }
              />
            </View>
          </View>
          <Text style={ styles.small }>Users will stay active for 6 hours. Conversations are cleared 6 hours after the most recent message.</Text>
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
            <TouchableOpacity style={ styles.touchable } onPress={() => props.navigation.navigate("DateOfBirth", { dob: user.date_of_birth.seconds ? new Date(user.date_of_birth.seconds * 1000) : user.date_of_birth, updateProfile })}>
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
            <TouchableOpacity style={ styles.touchableOrange } onPress={() => signOut()}>
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

        
        <TouchableOpacity onPress={ () => createConvos() } style={[ styles.signoutWrapper, { backgroundColor: "orange" }] }>
          <MaterialIcons name="exit-to-app" color="gray" size={ 29 } style={ styles.imageIcon } />
          <Text style={ styles.signoutText }>Create Convos</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={ () => getAuthUser() } style={[ styles.signoutWrapper, { backgroundColor: "gold" }] }>
          <MaterialIcons name="exit-to-app" color="gray" size={ 29 } style={ styles.imageIcon } />
          <Text style={ styles.signoutText }>Get Auth User</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={ () => addTestCloudFunctionsData() } style={[ styles.signoutWrapper, { backgroundColor: "blue" }] }>
          <MaterialIcons name="exit-to-app" color="gray" size={ 29 } style={ styles.imageIcon } />
          <Text style={ styles.signoutText }>Add data for Cloud function testing</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={ () => testCloudFunctionsLocally() } style={[ styles.signoutWrapper, { backgroundColor: "green" }] }>
          <MaterialIcons name="exit-to-app" color="gray" size={ 29 } style={ styles.imageIcon } />
          <Text style={ styles.signoutText }>Run cloud functions locally to test</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={ () => deleteOldConvosTest() } style={[ styles.signoutWrapper, { backgroundColor: "pink" }] }>
          <MaterialIcons name="exit-to-app" color="gray" size={ 29 } style={ styles.imageIcon } />
          <Text style={ styles.signoutText }>Delete Old Convos Test</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={ () => addRequestTest() } style={[ styles.signoutWrapper, { backgroundColor: "turquoise" }] }>
          <MaterialIcons name="exit-to-app" color="gray" size={ 29 } style={ styles.imageIcon } />
          <Text style={ styles.signoutText }>Add Request Test</Text>
        </TouchableOpacity>
        <View style={ styles.bottomArea } />
      </ScrollView>
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
