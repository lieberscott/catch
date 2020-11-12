import React, { useState, useRef, useEffect } from 'react';
import { Image, StyleSheet, Text, View, Dimensions, TouchableOpacity } from 'react-native';
import MapView from 'react-native-maps';

const turquoise = "#4ECDC4";


const { width } = Dimensions.get("window");

const MapPage = (props) => {

  const mapViewRef = useRef();

  const [deltas, setDeltas] = useState([0.05, 0.05]);
  const [loc0, setLoc0] = useState([ props.loc[0], props.loc[1] ]);

  useEffect(() => {
    if (props.loc[0] !== 37.09019985390777 && props.loc[1] !== -95.71290001273155) {
      mapViewRef.current.animateToRegion({ latitude: props.loc[0], longitude: props.loc[1], latitudeDelta: deltas[0], longitudeDelta: deltas[1] }, 500);
    }
  }, [props.loc]);

  const handleRight = () => {
    props.setLoc(loc0);
    props.goRight();
  }

  {/* Add the showsUserLocation prop to MapView to get user location after custom build. See the documentation. See how the prop behaves. You may be able to delete the getLocation() call in IntroMaster */}
  return (
    <View style={ styles.container }>
      <View style={ styles.topWrapper }>
        <Text style={ styles.subhead }>Set your location</Text>
      </View>
      <View style={ styles.middle}>
        <View style={ styles.mapContainer }>
          <MapView
            ref={ mapViewRef }
            style={ styles.mapStyle }
            // showsUserLocation={ true }
            // followsUserLocation={ true }
            initialRegion={{ latitude: loc0.latitude, longitude: loc0.longitude, latitudeDelta: deltas[0], longitudeDelta: deltas[1] }}
            // maxZoomLevel={ 17 }
            // minZoomLevel={ 6 }
            // provider={PROVIDER_GOOGLE}
            // onUserLocationChange={() => changeLocation() }
            onRegionChangeComplete={(data) => {
              setDeltas([data.latitudeDelta, data.longitudeDelta]);
              setLoc0([data.latitude, data.longitude])}}
          />
          <View style={ styles.imageWrapper }>
            <Image
              source={require('../../../assets/pin.png')}
              style={ styles.image }
              resizeMode="contain"
            />
          </View>
        </View>
        <View style={ styles.buttonsWrapper }>
          <TouchableOpacity activeOpacity={ 1 } onPress={ props.goBack } style={ styles.button }>
            <Text style={ styles.text }>Go Back</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={ 1 } onPress={ handleRight } style={ styles.button }>
            <Text style={ styles.text }>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  buttonsWrapper: {
    flexDirection: "row",
    width: "90%",
    alignSelf: "center",
    marginTop: 10
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: turquoise,
    color: "#ddd",
    borderRadius: 30
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    width: width
  },
  imageWrapper: {
    position: "absolute",
    left: "49%",
    bottom: "50%",
    height: 30,
    width: 30 
  },
  image: {
    height: null,
    width: null,
    flex: 1
  },
  mapContainer: {
    height: "85%",
    width: width - 20,
    borderRadius: 20
  },
  mapStyle: {
    flex: 1,
    overflow: "hidden",
    borderRadius: 20
  },
  middle: {
    flex: 5
  },
  subhead: {
    alignSelf: "center",
    fontSize: 18,
    color: "#444",
    marginBottom: 5
  },
  text: {
    color: "white",
    width: "100%",
    padding: 10,
    textAlign: "center",
    overflow: "hidden"
  },
  topWrapper: {
    flex: 1,
    justifyContent: "flex-end"
  }
});

export default MapPage;
