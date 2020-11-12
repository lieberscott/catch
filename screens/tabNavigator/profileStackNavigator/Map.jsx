import React, { useState, useRef } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import MapView from 'react-native-maps';

const { width } = Dimensions.get("window");

const Map = (props) => {
  
  const createGame = props.createGame ? true : false; // bool, true if this Map is being used to set new game location, false if it's to change user location (using same component for each)
  const c = props.coordinates ? props.coordinates : props.route.params.coordinates; // props.coordinates is for when it's creating a game (since it's a Modal, not its own Stack page), otherwise it's in the props.route.params object
  const l1 = c.latitude;
  const l2 = c.longitude;

  const [coords, setCoords] = useState([l1, l2]);
  const [deltas, setDeltas] = useState([0.05, 0.05]);
  const [disabled, setDisabled] = useState(false);

  const update = () => {
    if (!disabled) {
      props.route.params.updateProfile({}, 3, coords);
    }
    setDisabled(true);
  }

  const next = () => {
    if (!disabled) {
      props.handleLoc(coords);
    }
    setDisabled(true);
  }


  return (
    <View style={ styles.container }>
      <View style={ styles.headerWrapper }>
        <MaterialIcons name="my-location" size={ 23 } color="gray" />
        <Text style={ styles.header }>{ createGame ? "SET YOUR NEW GAME'S LOCATION" : "Choose your location" }</Text>
      </View>
      <View style={ styles.mapContainer }>
        <MapView
          style={ styles.mapStyle }
          initialRegion={{ latitude: coords[0], longitude: coords[1], latitudeDelta: deltas[0], longitudeDelta: deltas[1] }}
          onRegionChangeComplete={(data) => {
            setDeltas([data.latitudeDelta, data.longitudeDelta]);
            setCoords([data.latitude, data.longitude])
          }}
        />
        <View style={ styles.imageWrapper }>
          <Image
            source={require('../../../assets/pin.png')}
            style={ styles.image }
            resizeMode="contain"
          />
        </View>
      </View>
      <TouchableOpacity onPress={ createGame ? next : update } style={ styles.update }>
        <Text style={ styles.updateText }>{ createGame ? "Next" : "Save" }</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    paddingTop: 20,
    paddingHorizontal: 10
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
    flex: 1
  },
  imageWrapper: {
    position: "absolute",
    left: "49%",
    bottom: "50%",
    height: 30,
    width: 30 
  },
  mapContainer: {
    height: "85%",
    width: width - 20,
    borderRadius: 20,
    alignSelf: "center"
  },
  mapStyle: {
    flex: 1,
    overflow: "hidden",
    borderRadius: 20
  },
  update: {
    borderWidth: 0.5,
    borderColor: "red",
    borderRadius: 20,
    padding: 10,
    marginTop: 10,
    color: "#444"
  },
  updateText: {
    fontSize: 17,
    alignSelf: "center",
    color: "red"
  }
})

export default Map;