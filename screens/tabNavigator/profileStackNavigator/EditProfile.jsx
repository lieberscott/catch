// Dob
// ProfileText
// Gender
// Location
// Photo
// Notifications
// Name
// Sports
// 


import React, { Fragment, useState, useEffect, useRef, useContext } from 'react';
import { Alert, Dimensions, Image, InputAccessoryView, Keyboard, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
// import * as ImageManipulator from "expo-image-manipulator";

import { StoreContext } from '../../../contexts/storeContext';

WebBrowser.maybeCompleteAuthSession();


const { width } = Dimensions.get("window");
const aboutMeAccessoryViewID = "aboutMeAccessoryView";

const mHorizontal = 20; // body margin

const EditProfile = (props) => {

  const store = useContext(StoreContext);

  const user = store.user;
  const a = user.profileText || "";


  const [aboutMe, setAboutMe] = useState(a);
  const [bottomView, setBottomView] = useState(false);
  const [scrollPos, setScrollPos] = useState(0);

  const images_len = 1;
  const scrollViewRef = useRef();
  const userId = user._id;
  const deviceToken = user.device_token;
  const default_arr = [1, 2, 3, 4, 5, 6];



  {/* Handle the bottom view */}
  useEffect(() => {
    if (bottomView) {
      scrollViewRef.current.scrollTo({ y: scrollPos, animated: true });
    }
  });

  const abortController = new AbortController();

  useEffect(() => {

    return () => handleAbortion();
  }, []);

  const handleAbortion = () => {
    abortController.abort();
  }



  {/* Photo Functions */}
  
  const addPhoto = async () => {

    try {
      if (Constants.platform.ios) {
        const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
        if (status !== 'granted') {
          Alert.alert("", "Please grant access to Camera Roll in Settings");
        }
      }
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1
      });
      if (!result.cancelled) {

        // compress image - commenting out for now because, with aspect ratio control, image is already a controlled size?
        // const manipResult = await ImageManipulator.manipulateAsync(
        //   result.uri,
        //   [{ resize: { width: 414 } }]
        //   { compress: 1, format: ImageManipulator.SaveFormat.PNG }
        // );

        // upload to DO
        const index = result.uri.lastIndexOf(".");
        const type = result.uri.substring(index + 1); // png, jpeg, etc.
        const file = {
          uri: result.uri,
          name: "image." + type,
          type: "image/" + type
        }
        
        const body = new FormData();
        body.append('upload', file);

        const myHeaders = new Headers();
        myHeaders.append('Content-Type', 'multipart/form-data');
        myHeaders.append('device_token', deviceToken);
        myHeaders.append('id', userId);

        
        const data = await fetch("https://wise-pond-cricket.glitch.me/add_image", {
          method: 'POST',
          headers: myHeaders,
          body: body
        });

        const json = await data.json();

        if (json.error) {
          Alert.alert("", "Error. Please try again");
        }
        else {
          const len = json.image.length - 1;
          const arr = [];
          arr.push(json.image[len]);
          
          store.setUser(prevState => ({...prevState, images: arr }));
        }
      }
    }

    catch(e) {
      console.log("e : ", e);
      Alert.alert("", "Error. Please try again");
    }
  }

  const deletePopup = (url, photo_id) => {
    Alert.alert("", "Are you sure you want to delete this photo?", [
      { text: "OK", onPress: () => handleDelete(url, photo_id) },
      { text: "Cancel" }
    ])
  }

  const handleDelete = async (url, photo_id) => {
    const lastIndex = url.lastIndexOf(".com/");
    const photo_key = url.substring(lastIndex + 5); // this is the id of the photo (+ 5 so we get to the substring past the .com/)
    try {
      const data = await fetch("https://wise-pond-cricket.glitch.me/delete_image", {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({ photo_key, photo_id, id: userId, device_token: deviceToken })
      });

      const json = await data.json();

      if (json.error) {
        Alert.alert("", "Error. Please try again");
      }

      else {
        store.setUser(prevState => {
          const newState = {...prevState}
          const arr = newState.images;
          const index = arr.findIndex((item, i) => item._id === photo_id);
          arr.splice(index, 1);
          newState.images = arr;
          return newState;
        });
      }
    }

    catch(e) {
      console.log("e : ", e);
      Alert.alert("", "Error. Please try again");
    }
  }

  {/* Shows either user image or a blank image at top */}
  const returnImage = (url, i, bool) => { // bool is whether it's a real image (true) or blank (false)
    return (
      <TouchableOpacity key={ "k" + url + i } style={ styles.imageWrapper } key={ i }>
        <Image source={{ uri: url }} style={ styles.image } />
        <TouchableOpacity onPress={ bool ? () => deletePopup(url, i) : addPhoto } style={ styles.iconWrapper }>
          <MaterialIcons color={ bool ? "red" : "green" } name={ bool ? "highlight-off" : "add-circle-outline" } size={ 23 } style={ styles.alignSelfCenter } />
        </TouchableOpacity>
      </TouchableOpacity>
    )
  }


  {/* Profile Text Functions */}

  const updateProfile = async (update, num) => {
    try {
      const res = await fetch("https://wise-pond-cricket.glitch.me/update_profile", {
        signal: abortController.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({ id: userId, device_token: deviceToken, update })
      });
      const json = await res.json();

      if (json.error) {
        Alert.alert("", "There was a problem with your request. Please try again shortly.");
        cancel(num);
      }
      else {
        // update this component live; key will be profileText, etc.
        const key = Object.getOwnPropertyNames(update)[0];
        store.setUser(prevState => {
          const newState = {...prevState, [key]: update[key] };
          newState[key] = update[key];
          return newState;
        });
        // hacky solution of using num 11 for aboutMe text updates so Keyboard can be dismissed and BottomView set to false, but it works
        cancel(num);
      }
    }
    catch (e) {
      console.log("e : ", e);
      cancel();
    }
  }

  const cancel = (num) => {
    if (num === 1) {
      // handle About Me cancel
      setAboutMe(user.profile_text || "");
    }
    else if (num < 11) {
      props.navigation.pop();
    }
    // do this in either case
    Keyboard.dismiss();
    setBottomView(false);
  }

  return (
    <Fragment>
      <ScrollView
        ref={ scrollViewRef }
        // onScroll={(e) => console.log("y_pos : ", e.nativeEvent.contentOffset.y)}
        scrollEventThrottle={ 16 }
        contentContainerStyle={ styles.container }
        keyboardDismissMode="interactive"
        maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
      >
        <View style={ styles.imagesWrapper }>
          { default_arr.map((_, i) => {
            return returnImage("https://www.neoarmenia.com/wp-content/uploads/generic-user-icon-19.png", i, false);
          })}
        </View>
        <View style={ styles.oneSection}>
          <View style={ styles.headerWrapper }>
            <MaterialIcons name="fingerprint" size={ 23 } color="gray" />
            <Text style={ styles.header }>About Me</Text>
          </View>
          <View style={ styles.textInputWrapper }>
              <TextInput
                style={ styles.textInput }
                defaultValue="hello"
                numberofLines={ 3 }
                multiline={ true }
                onFocus={ () => {
                  setScrollPos(115);
                  setBottomView(true);
                }}
                onBlur={() => setBottomView(false)}
                value={ aboutMe }
                onChangeText={(t) => {
                  if (t.length < 500) {
                    setAboutMe(t);
                  }
                }}
                inputAccessoryViewID={aboutMeAccessoryViewID}
              />
              <Text style={ styles.textCount }>{ 500 - aboutMe.length }</Text>
          </View>
        </View>
        <View style={ styles.oneSection}>
          <View style={ styles.headerWrapper }>
            <MaterialIcons name="person-outline" size={ 23 } color="gray" />
            <Text style={ styles.header }>Personal</Text>
          </View>
          <View style={ styles.buttonWrapper }>
            <TouchableOpacity style={ styles.touchable } onPress={() => props.navigation.navigate("Name", { occupation: user.occupation, updateProfile })}>
              <Text>{ user.occupation || "Name" }</Text>
              <MaterialIcons name="chevron-right" color="gray" size={ 23 } />
            </TouchableOpacity>
          </View>
          <View style={ styles.buttonWrapper }>
            <TouchableOpacity style={ styles.touchable } onPress={() => props.navigation.navigate("DateOfBirth", { company: user.company, updateProfile })}>
              <Text>{ user.company || "Age" }</Text>
              <MaterialIcons name="chevron-right" color="gray" size={ 23 } />
            </TouchableOpacity>
          </View>
          <View style={ styles.buttonWrapper }>
            <TouchableOpacity style={ styles.touchable } onPress={() => props.navigation.navigate("Gender", { company: user.school, updateProfile })}>
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
            <TouchableOpacity style={ styles.touchable } onPress={() => props.navigation.navigate("Sports", { occupation: user.occupation, updateProfile })}>
              <Text>{ user.occupation || "Sports" }</Text>
              <MaterialIcons name="chevron-right" color="gray" size={ 23 } />
            </TouchableOpacity>
          </View>
          <View style={ styles.buttonWrapper }>
            <TouchableOpacity style={ styles.touchable } onPress={() => props.navigation.navigate("Notifications", { company: user.company, updateProfile })}>
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
            <TouchableOpacity style={ styles.touchable } onPress={() => props.navigation.navigate("Map", { gender_text: user.gender_text, updateProfile })}>
              <Text>{ user.gender_text || "Map" }</Text>
              <MaterialIcons name="chevron-right" color="gray" size={ 23 } />
            </TouchableOpacity>
          </View>
        </View>
        { bottomView ? <View style={ styles.bottomView } /> : [] }
      </ScrollView>
      <InputAccessoryView nativeID={ aboutMeAccessoryViewID }>
      <View style={ styles.accessoryView }>
          <TouchableOpacity style={ styles.accessoryButtonLeft } onPress={() => updateProfile({ profile_text: aboutMe }, 11)}>
            <Text style={ styles.alignSelfCenter }>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={ styles.flexOne } onPress={() => cancel(1)}>
            <Text style={ styles.alignSelfCenter }>Cancel</Text>
          </TouchableOpacity>
        </View>
      </InputAccessoryView>
    </Fragment>
  )
}

const styles = StyleSheet.create({
  accessoryButtonLeft: {
    flex: 1,
    borderRightWidth: 0.5
  },
  accessoryView: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#ccc"
  },
  alignSelfCenter: {
    alignSelf: "center"
  },
  bottomView: {
    height: 300
  },
  buttonWrapper: {
    flexDirection: "row"
  },
  container: {
    paddingBottom: 50,
    justifyContent: "flex-end"
  },
  flexOne: {
    flex: 1
  },
  header: {
    color: "gray",
    marginLeft: 10
  },
  headerWrapper: {
    flexDirection: "row",
    alignItems: "center"
  },
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: -5,
    right: -5,
    height: 25,
    width: 25,
    borderRadius: 20,
    backgroundColor: "white" 
  },
  image: {
    height: 180,
    width: width / 3 - 10,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: "#d3d3d3"
  },
  imageWrapper: {
    height: 180,
    width: width / 3 - 10,
    marginVertical: 10,
    borderRadius: 20
  },
  imagesWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around"
  },
  oneSection: {
    marginHorizontal: mHorizontal,
    marginVertical: 10
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
  title: {
    marginTop: 20,
    color: "#838383" 
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
  },
  warning: {
    fontSize: 13,
    color: "red",
    marginTop: 3,
    marginHorizontal: 5
  }
});

export default EditProfile;