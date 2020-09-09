// if drag touch starts in bottom half of card, angle should tilt upward instead of downward
import React, { Fragment, useState, useRef, useEffect, useContext, InputAccessoryView } from 'react';
import { Alert, Animated, Button, Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';

import { updateUser, uploadImage, signOut } from '../../../firebase.js';
import { addPhoto } from '../../../utils.js';

import { StoreContext } from '../../../contexts/storeContext.js';
const mHorizontal = 20; // body margin
const turquoise = "#4ECDC4";

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const { width, height } = Dimensions.get("window");
const bodyMarginTop = 20;
const fullWidth = width * 4; // ScrollView width: width * number of pages

const Profile = (props) => {

  const store = useContext(StoreContext);
  const accessoryViewID = "accessoryViewID";

  const user = store.user;
  const userId = user._id;
  const deviceToken = user.device_token;
  const userPhoto = user.photo ? user.photo : "https://www.neoarmenia.com/wp-content/uploads/generic-user-icon-19.png";
  const userName = user.name;

  {/* Get age */}
  const today = new Date();
  const userDOB = new Date(user.date_of_birth);
  const milliseconds = userDOB.getTime();
  const birthday = new Date(milliseconds);
  let userAge = today.getFullYear() - birthday.getFullYear();
  if (today.getMonth() < birthday.getMonth() || 
  today.getMonth() == birthday.getMonth() && today.getDate() < birthday.getDate()) {
    userAge--;
  }
  const location = user.city;
  const school = user.school;
  const occupation = user.occupation;
  const employer = user.employer;

  // const navigation = useNavigation();

  const [page, setPage] = useState(0);
  const [bottomView, setBottomView] = useState(false);
  const [scrollPos, setScrollPos] = useState(0);
  const scrollViewRef = useRef();

  const [settingsButton, setSettingsButton] = useState(new Animated.Value(1));

  useEffect(() => {
    if (bottomView) {
      scrollViewRef.current.scrollTo({ y: scrollPos, animated: true });
    }
  });

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

  const updateProfile = async (update, num) => {
    const result = await updateUser(update, userId);
    if (result) {
      // update locally
      const key = Object.keys(update);
      store.setUser(prevState => ({...prevState, [key]: update[key] }))
    }
    if (num > 2) {
      props.navigation.pop();
    }
  }
  
  return (
    <Fragment>
    <ScrollView style={ styles.body }>
      <View style={ styles.top }>
        <View style={ styles.imageWrapper }>
          <Image source={{ uri: userPhoto }} style={ styles.image } />
          <AnimatedTouchableOpacity style={ styles.imageIconWrapper } onPress={ () => choosePhoto() }>
            <MaterialIcons name="add-a-photo" color="gray" size={ 33 } style={ styles.imageIcon } />
          </AnimatedTouchableOpacity>
        </View>
        <Text style={ styles.nameAndAge }>{ userName }, { userAge }</Text>
        { occupation ? employer ? <Text style={ styles.school }>{ occupation } at { employer }</Text> : [] : [] }
        { school ? <Text style={ styles.school }>{ school }</Text> : [] }
        <View style={ styles.locationWrapper }>
          <MaterialIcons name="location-on" color="red" onPress={ () => console.log("settings") } size={ 25 } style={ styles.imageIcon } />
          <Text style={ styles.location }>{ user.location }</Text>
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
              <Text>{ user.occupation || "Name" }</Text>
              <MaterialIcons name="chevron-right" color="gray" size={ 23 } />
            </TouchableOpacity>
          </View>
          <View style={ styles.buttonWrapper }>
            <TouchableOpacity style={ styles.touchable } onPress={() => props.navigation.navigate("DateOfBirth", { dob: user.date_of_birth.seconds ? new Date(user.date_of_birth.seconds * 1000) : user.date_of_birth, updateProfile })}>
              <Text>{ user.company || "Age" }</Text>
              <MaterialIcons name="chevron-right" color="gray" size={ 23 } />
            </TouchableOpacity>
          </View>
          <View style={ styles.buttonWrapper }>
            <TouchableOpacity style={ styles.touchable } onPress={() => props.navigation.navigate("Gender", { gender: user.gender, updateProfile })}>
              <Text>{ user.school || "Gender" }</Text>
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
        <View style={ styles.oneSection}>
          <View style={ styles.headerWrapper }>
            <MaterialIcons name="person-outline" size={ 23 } color="gray" />
            <Text style={ styles.header }>Location</Text>
          </View>
          <View style={ styles.buttonWrapper }>
            <TouchableOpacity style={ styles.touchable } onPress={() => props.navigation.navigate("Map", { coordinates: user.coordinates, updateProfile })}>
              <Text>{ user.gender_text || "Map" }</Text>
              <MaterialIcons name="chevron-right" color="gray" size={ 23 } />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity onPress={ () => signOut() } style={ styles.availableTonightWrapper }>
          <MaterialIcons name="exit-to-app" color="gray" size={ 29 } style={ styles.imageIcon } />
          <Text style={ styles.availableTonightText }>Sign Out</Text>
        </TouchableOpacity>
    </ScrollView>
  </Fragment>
  )
}

const styles = StyleSheet.create({
  availableTonightText: {
    flexWrap: "wrap",
    flex: 1
  },
  availableTonightWrapper: {
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
  body: {
  	backgroundColor: "#fdfdfd",
    flexGrow: 1,
    width: width,
    marginTop: bodyMarginTop,
    // alignItems: "center"
  },
  button: {
  	backgroundColor: "#fff",
    shadowColor: '#001414',
    elevation: 1,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  	// flexDirection: "row",
  	// justifyContent: "center",
  	// alignItems: "center",
  	borderRadius: 70,
    alignSelf: "center"
    // padding: 15,
  	// margin: 15
  },
  buttonMediaWrapper: {
    alignSelf: "flex-end"
  },
  buttonWrapper: {
    flexDirection: "row"
  },
  edit: {
    margin: 15
  },
  header: {
    color: "gray",
    marginLeft: 10
  },
  headerWrapper: {
    flexDirection: "row",
    alignItems: "center"
  },
  icons: {
    height: 130,
    width: "85%",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  image: {
    height: 150,
    width: 150,
    borderRadius: 90
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
  media: {
    margin: 15
  },
  nameAndAge: {
    fontSize: 28
  },
  oneSection: {
    marginHorizontal: mHorizontal,
    marginVertical: 10
  },
  school: {
    fontSize: 12,
    marginVertical: 1
  },
  scrollView: {
    backgroundColor: "#fafafa",
    // backgroundColor: "red",
    flex: 3,
    width: width,
    alignItems: "center",
    paddingBottom: 20
  },
  setExtra: {
    backgroundColor: "white",
    marginTop: 20,
    borderRadius: 30,
    padding: 10,
    width: "80%",
    alignItems: "center",
    borderColor: "gray",
    borderWidth: 1
  },
  setExtraText: {
    color: "green"
  },
  settings: {
    margin: 15
  },
  subhead: {
    marginTop: 5,
    textAlign: "center"
  },
  textCount: {
    position: "absolute",
    bottom: 4,
    right: 10,
    color: "#bbb",
    fontSize: 10
  },
  textInput: {
    flex: 1,
    color: "#444"
  },
  textInputWrapper: {
    flexDirection: "row",
    flex: 1,
    borderWidth: 0.5,
    borderColor: "gray",
    borderRadius: 20,
    height: 60,
    padding: 10,
    marginTop: 10,
    color: "#444"
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
    color: "#444",
    alignItems: "center"
  }
});

export default Profile;
