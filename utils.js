import * as Location from 'expo-location';


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