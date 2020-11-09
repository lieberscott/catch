import React, { useState, useRef } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

const { width } = Dimensions.get("window");

const Map = (props) => {
  
  const userLat = props.route.params.userLat;
  const userLng = props.route.params.userLng;

  return (
    <View style={ styles.container }>
      <View style={ styles.mapContainer }>
        <MapView
          style={ styles.mapStyle }
          provider={PROVIDER_GOOGLE}
          camera={{ center: { latitude: userLat, longitude: userLng }, pitch: 1, heading: 0, altitude: 5, zoom: 10 }}
          pitchEnabled={ false }
          minZoomLevel={ 12 }
          maxZoomLevel={ 17 }
          pitchEnabled={ false }
          rotateEnabled={ false }
          scrollEnabled={ false }
        />
        <View style={ styles.imageWrapper }>
          <Image
            source={require('../../../assets/pin.png')}
            style={ styles.image }
            resizeMode="contain"
          />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8"
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
    flex: 1,
    width: width,
    alignSelf: "center"
  },
  mapStyle: {
    flex: 1,
    overflow: "hidden"
  }
})

export default Map;