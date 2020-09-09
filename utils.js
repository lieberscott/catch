import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from "expo-image-manipulator";
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';

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

      // const response = await fetch(result.uri);

      // compress image - commenting out for now because, with aspect ratio control, image is already a controlled size?
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