import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from "expo-image-manipulator";
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';

export const getDistance = (user0Loc, user1Loc) => {

  const user0Lat = user0Loc.latitude;
  const user0Lng = user0Loc.longitude;
  const user1Lat = user1Loc.latitude;
  const user1Lng = user1Loc.longitude;
  
  const R = 6378137; // Earth’s mean radius in meter
  const dLat = (user1Lat - user0Lat) * Math.PI / 180;
  const dLong = (user1Lng - user0Lng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(user0Lat * Math.PI / 180) * Math.cos(user1Lat * Math.PI / 180) *
    Math.sin(dLong / 2) * Math.sin(dLong / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const me = R * c; // meters
  return me * 0.00062137; // miles
}

export const addPhoto = async (userId) => {

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

      // compress image
      const manipResult = await ImageManipulator.manipulateAsync(
        result.uri,
        [{ resize: { width: 300 } }],
        { compress: 0.1, format: ImageManipulator.SaveFormat.PNG }
      );
      const response = await fetch(manipResult.uri);
      
      const blob = await response.blob();
      const name = userId + Date.now().toString();

      return [blob, name];
    }
  }

  catch(e) {
    console.log("e : ", e);
    return false;
  }
}


export const getLocation = async () => {
  try {
    let { status } = await Location.requestPermissionsAsync();
    if (status !== 'granted') {
      return false;
    }
    
    let location = await Location.getCurrentPositionAsync({});
    return location;
  }

  catch (e) {
    console.log("error : ", e);
    return false;
  }
}


export const registerForPushNotifications = async () => {
  let token;
  if (Constants.isDevice) {
    const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      Alert.alert('Failed to get push token for push notification!');
      return false;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
  }
  else {
    Alert.alert('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
  return token;
}

export const sendPushNotification = (pushToken, title, body, data) => {
  const message = {
    to: pushToken,
    sound: 'default',
    title,
    body,
    data: { data: 'goes here' }
  };
  
  fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}