// if drag touch starts in bottom half of card, angle should tilt upward instead of downward
import React, { useState, useRef, useEffect } from 'react';
import { Alert, Animated, Button, Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';

// import useInterval from '../customHooks/useInterval';

// import ProfileScrollViewPage from './ProfileScrollViewPage';
// import ProgressBar from '../shared/ProgressBar';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const { width, height } = Dimensions.get("window");
const bodyMarginTop = 20;
const fullWidth = width * 4; // ScrollView width: width * number of pages

const Profile = (props) => {

  // const { user } = props;
  const user = {
    _id: "abc123",
    device_token: "deviceToken",
    images: [],
    name: "Scott",
    date_of_birth: new Date(),
    city: "Chicago",
    school: "Syracuse",
    occupation: "Unemployed",
    employer: "None"
  }
  const userId = user._id;
  const deviceToken = user.device_token;
  const userPhoto = user.images.length ? user.images[0].url : "https://www.neoarmenia.com/wp-content/uploads/generic-user-icon-19.png";
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
  const scrollViewRef = useRef();

  const [settingsButton, setSettingsButton] = useState(new Animated.Value(1));

  // Need to setInterval to null (disable interval) if not on page1, or else it'll interfere with panResponder
  // useInterval(() => {
  //   let p = (page + 1) % 4;
  //   console.log("page : ", page);
  //   console.log("p : ", p);
  //   let xOff = (p * width);
  //   console.log("xOff : ", xOff);
  //   scrollViewRef.current.scrollTo({ x: xOff, animated: true });
  //   setPage(p);
  // }, props.page1 ? 3500 : null);

  const settingsPress = () => {
    Animated.timing(settingsButton, {
      toValue: 1.3,
      duration: 250,
      useNativeDriver: true
    }).start(() => {
      Animated.timing(settingsButton, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true
      }).start();
    });
  }

  const settingsRelease = () => {
    console.log("settings release")
    // Animated.timing(settingsButton, {
    //   toValue: 1,
    //   duration: 250,
    //   useNativeDriver: true
    // }).start(() => navigation.navigate("Settings", { user, userId, deviceToken, width }));
  }

  const availableTonightPopup = () => {
    Alert.alert("Make yourself Available Tonight?", "You will be featured on the Available Tonight page for others to send you offers to take you out tonight.", [
      { text: "Yes", onPress: () => availableTonight()},
      { text: "Cancel" }
    ]);
  }

  const availableTonight = () => {

    // get hours offset and days for new Date object to put into Mongo so it expires at the right time
    const hours_local = new Date().getHours(); // 10, 11, 12, 13, etc.
    const hours_utc = new Date().getUTCHours();
    const hours = hours_utc - hours_local;
    const day = new Date().getDate() + 1;
    const year = new Date().getFullYear();
    const month = new Date().getMonth();
    fetch("https://wise-pond-cricket.glitch.me/set_available_tonight", {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: "POST",
      body: JSON.stringify({ id: userId, device_token: deviceToken, orientation, loc, year, month, day, hours })
    })
    .then((res) => res.json())
    .then((json) => {
      if (json.error === 2) {
        Alert.alert("", "You do not have any Available Tonight tokens left. Purcahse some in the store to continue.");
      }
      else if (json.error) {
        Alert.alert("", "There was an error. Please try again.");
      }
      else {
        Alert.alert("", "You will be featured on the Available Tonight page until midnight tonight. Now sit back and wait for the offers to roll in.");
      }
    })
    .catch((err) => {
      console.log("err : ", err);
      
    })
  }

  const signout = () => {
    firebase.auth().signOut();
  }


  return (
    <View style={ styles.body }>
      <TouchableOpacity onPress={ signout } style={ styles.availableTonightWrapper }>
        <MaterialIcons name="add-circle-outline" color="gray" size={ 29 } style={ styles.imageIcon } />
        <Text style={ styles.availableTonightText }>Sign Out</Text>
      </TouchableOpacity>
      <View style={ styles.top }>
        <View style={ styles.imageWrapper }>
          <Image source={{ uri: userPhoto }} style={ styles.image } />
          <AnimatedTouchableOpacity style={ styles.imageIconWrapper } onPress={ () => console.log("edit") }>
            <MaterialIcons name="edit" color="gray" size={ 33 } style={ styles.imageIcon } />
          </AnimatedTouchableOpacity>
        </View>
        <Text style={ styles.nameAndAge }>{ userName }, { userAge }</Text>
        { occupation ? employer ? <Text style={ styles.school }>{ occupation } at { employer }</Text> : [] : [] }
        { school ? <Text style={ styles.school }>{ school }</Text> : [] }
        <View style={ styles.locationWrapper }>
          <MaterialIcons name="location-on" color="red" onPress={ () => console.log("settings") } size={ 25 } style={ styles.imageIcon } />
          <Text style={ styles.location }>{ user.location }</Text>
        </View>
        <View style={ styles.icons }>
          <View style={ styles.buttonWrapper }>
            <AnimatedTouchableOpacity activeOpacity={ 1 } onPressIn={ settingsPress } onPressOut={ settingsRelease } style={[ styles.button, { transform: [{ scale: settingsButton }]} ] }>
              <MaterialIcons name="settings" color="gray" size={ 33 } style={ styles.settings } />
            </AnimatedTouchableOpacity>
            <Text style={ styles.subhead }>Settings</Text>
          </View>
          <View style={ styles.buttonMediaWrapper }>
            <View style={ styles.button }>
              <MaterialIcons name="add-a-photo" color="red" onPress={ () => console.log("photo") } size={ 33 } style={ styles.media } />
            </View>
            <Text style={ styles.subhead }>Add Media</Text>
          </View>
          <View style={ styles.buttonWrapper }>
            <View style={ styles.button }>
              <MaterialIcons name="edit" color="gray" onPress={ () => console.log("edit") } size={ 33 } style={ styles.edit } />
            </View>
            <Text style={ styles.subhead }>Edit</Text>
          </View>
        </View>
      </View>
      <View style={ styles.scrollView }>
        <ScrollView
          ref={ scrollViewRef }
          pagingEnabled
          disableIntervalMomentum={ true }
          horizontal
          scrollEventThrottle={16}
          scrollEnabled={ true }
          showsHorizontalScrollIndicator={ false }
          pinchGestureEnabled={ false }
          overflow="scroll"
          onScroll={ (evt, gestureState) => {
            const p = Math.floor(evt.nativeEvent.contentOffset.x / width);
            setPage(p);
          }}
        >
          <View />

        </ScrollView>
        <TouchableOpacity style={ styles.setExtra } onPress={ () => console.log("get set extra")}>
          <Text style={ styles.setExtraText }>Get Set Extra</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  availableTonightText: {
    flexWrap: "wrap",
    flex: 1
  },
  availableTonightWrapper: {
    width: "95%",
    backgroundColor: "pink",
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    marginTop: 2
  },
  body: {
  	backgroundColor: "#fdfdfd",
    flexGrow: 1,
    width: width,
    marginTop: bodyMarginTop,
    alignItems: "center"
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
    alignSelf: "flex-start"
  },
  edit: {
    margin: 15
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
  top: {
    alignItems: "center",
    justifyContent: "center",
    flex: 7,
    width: "100%"
  }
});

export default Profile;
