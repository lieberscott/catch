import React, { useState, useRef, useContext, useEffect } from 'react';
import { Alert, Dimensions, Image, Keyboard, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import * as firebase from 'firebase';
import { uploadImage, updateUser } from '../../../firebase.js';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from "expo-image-manipulator";
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';

import { StoreContext } from '../../../contexts/storeContext';
import { getLocation } from '../../../utils.js';

import Name from './Name';
import DateOfBirth from './DateOfBirth';
import Gender from './Gender';
import MapPage from './MapPage';
import Sports from './Sports';
import Photo from './Photo';


const { width } = Dimensions.get("window");

const IntroMaster = ({ navigation }) => {

  const store = useContext(StoreContext);

  const user = store.user;
  const userId = user._id;

  const [name, setName] = useState("");
  const [dob, setDob] = useState(new Date());
  const [gender, setGender] = useState(-1);
  const [loc, setLoc] = useState([37.0902, -95.7129]);
  const [baseball, setBaseball] = useState(true);
  const [baseballLevel, setBaseballLevel] = useState(1);
  const [football, setFootball] = useState(true);
  const [footballLevel, setFootballLevel] = useState(1);
  const [frisbee, setFrisbee] = useState(true);
  const [frisbeeLevel, setFrisbeeLevel] = useState(1);
  const [photo, setPhoto] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  
  const [page, setPage] = useState(0);
  const [firstPartDone, setFirstPartDone] = useState(false);

  {/* Set Errors */}
  const [nameError, setNameError] = useState(false);
  const [dateGood, setDateGood] = useState(false)

  const scrollViewRef = useRef();


  useEffect(() => {
    if (firstPartDone) {
      let w = page * width;
      scrollViewRef.current.scrollTo({ x: w, animated: true });
    }
  }, [page]);

  const goRight = async () => {
    if (page === 0 && name.length >= 1) { // can always scroll to page 0
      Keyboard.dismiss();
      setNameError(false);
      setPage(1);
    }
    else if (page === 0 && name.length < 1) {
      setNameError(true);
    }
    else if (page === 1 && dateGood) {
      setPage(2);
    }
    else if (page === 2) {
      setPage(3);
      try {
        const l = await getLocation();
        console.log("l : ", l);
        if (l) {
          setLoc([l.coords.latitude, l.coords.longitude]);
        }
      }
      catch (e) {
        console.log("getLocation error : ", e);
      }
    }
    else if (page === 3) {
      setPage(4)
    }
    else if (page === 4 && photo) {
      setPage(prevState => prevState + 1);
    }
    else if (page === 5) {
      setPage(prevState => prevState + 1);
    }
  }

  const goBack = () => {
    if (page !== 0) {
      setPage(prevState => prevState - 1);
    }
  }

  const handleDone = async () => {

    const baseballText = baseballLevel === 0 ? "Absolute beginner" : baseballLevel === 1 ? "Played Little League" : "Pretty good HS Player";
    const footballText = footballLevel === 0 ? "Absolute beginner" : footballLevel === 1 ? "Can throw a spiral" : "Pretty good HS Player";
    const frisbeeText = frisbeeLevel === 0 ? "Absolute beginner" : frisbeeLevel === 1 ? "Good backhand thrower" : "Play in a league";


    // everything but loc, which needs to be specially formatted with geocollection (loc is passed separately and handled in firebase.js function)
    const update = {
      name,
      date_of_birth: dob,
      gender,
      photo: photoUrl,
      sports: {
        Baseball: {
          interested: baseball,
          skill_level: baseballText
        },
        Football: {
          interested: football,
          skill_level: footballText
        },
        Frisbee: {
          interested: frisbee,
          skill_level: frisbeeText
        }
      },
      onboardingDone: true
    }

    try {
      const res = await updateUser(update, userId, loc);
      console.log("res in IntroMaster : ", res);

      if (res) {
        let newState = { ...store.user };
        const keys = Object.getOwnPropertyNames(update);
        console.log("keys : ", keys);
        for (let i = 0; i < keys.length; i++) {
          // newState["name"] = "Scott" (update["name"])
          newState[keys[i]] = update[keys[i]];
        }
        newState.coordinates = { latitude: loc[0], longitude: loc[1] };
        store.setUser(newState);
        // navigation.navigate("SignedIn");
      }
      else {
        Alert.alert("", "There was an error with your request.");
        firebase.auth.logOut();
      }
    }
    catch (e) {
      Alert.alert("", "There was an error with your request.");
      console.log("error : ", e);
    }
  }
  
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
        const manipResult = await ImageManipulator.manipulateAsync(
          result.uri,
          [{ resize: { width: 300 } }],
          { compress: 0.1, format: ImageManipulator.SaveFormat.PNG }
        );
        const response = await fetch(manipResult.uri);
        
        const blob = await response.blob();
        const name = userId + Date.now().toString();

        const downloadUrl = await uploadImage(blob, name);
        setPhotoUrl(downloadUrl);
        setPhoto(true);
      }
    }

    catch(e) {
      console.log("e : ", e);
      Alert.alert("", "Error. Please try again");
    }
  }

  return (
    <SafeAreaView style={ styles.flexOne }>
        { !firstPartDone
        ? <Onboarding
            onDone={ () => setFirstPartDone(true) }
            showSkip={ false }
            showNext={ true }
            bottomBarHighlight={ false }
            allowFontScaling={ false }
            pages={[
              {
                backgroundColor: '#fff',
                image: <View style={ styles.imageWrapper }><Image resizeMode="contain" source={require('../../../assets/ball-and-glove.png')} style={ styles.image } /><Image style={ styles.image2 } resizeMode="contain" source={require('../../../assets/catch-logo.png')} /></View>,
                title: 'Welcome to Catch',
                subtitle: 'The best place for socially distanced, fun, outdoor activity',
                // imageContainerStyle: styles.imageWrapper
              },
              {
                backgroundColor: '#fff',
                image: <View style={ styles.imageWrapper }><Image resizeMode="contain" source={require('../../../assets/man-throwing-football.png')} style={ styles.image } /></View>,
                title: "What's your game?",
                subtitle: 'At Catch, we connect people who want to engage in the simple pleasure of a game of catch. We offer three different types of catch: Football, Baseball, or Frisbee. Personalize your profile to let others know what you want to play most, and what your skill level is.',
              },
              {
                backgroundColor: '#fff',
                image: <View style={ styles.imageWrapper }><Image resizeMode="contain" source={require('../../../assets/woman-throwing-frisbee.png')} style={ styles.image } /></View>,
                title: "Thanks for joining us. We're glad you're here.",
                subtitle: "",
              }
            ]}
          />
        : <View style={ styles.flexOne }>
            <View style={ styles.setupTitle }>
              <Text style={ styles.titleText }>Let's set up your profile</Text>
            </View>
            <ScrollView
              horizontal
              pagingEnabled
              ref={ scrollViewRef }
              showsHorizontalScrollIndicator={ false }
              // keyboardShouldPersistTaps="always"
              scrollEnabled={ false }
            >
            <Name
              name={ name }
              setName={ setName }
              width={ width }
              goRight={ goRight }
            />
            <DateOfBirth
              dob={ dob }
              setDob={ setDob }
              width={ width }
              setDateGood={ setDateGood } // don't get confused. dateGood and setDateGood are states in BOTH the Master component and DateOfBirth Component
              goRight={ goRight }
              goBack={ goBack }
            />

            <Gender
              width={ width }
              gender={ gender }
              setGender={ setGender }
              goRight={ goRight }
              goBack={ goBack }
            />

            <MapPage
              setLoc={ setLoc }
              loc={ loc }
              goBack={ goBack }
              goRight={ goRight }
            />
            
            <Photo
              width={ width }
              goBack={ goBack }
              goRight={ goRight }
              addPhoto={ addPhoto }
              photo={ photo } // true or false
              photoUrl={ photoUrl }
            />

            <Sports
              width={ width }
              goBack={ goBack }
              handleDone={ handleDone }
              baseball={ baseball }
              setBaseball={ setBaseball }
              baseballLevel={ baseballLevel }
              setBaseballLevel={ setBaseballLevel }
              football={ football }
              setFootball={ setFootball }
              footballLevel={ footballLevel }
              setFootballLevel={ setFootballLevel }
              frisbee={ frisbee }
              setFrisbee={ setFrisbee }
              frisbeeLevel={ frisbeeLevel }
              setFrisbeeLevel={ setFrisbeeLevel }
            />

            {/* Upload Profile Image Component */}

          </ScrollView>
        </View> }
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  flexOne: {
    flex: 1
  },
  image: {
    height: null,
    width: null,
    flex: 1
  },
  image2: {
    alignSelf: "center",
    flex: 1
  },
  imageWrapper: {
    height: 400,
    width: 300,
    alignSelf: "center"
  },
  setupTitle: {
    height: 100,
    justifyContent: "flex-end",
    alignItems: "center"
  },
  titleText: {
    fontSize: 25,
    color: "#444"
  }
});

export default IntroMaster;