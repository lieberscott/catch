import React, { useState, useEffect } from 'react';
import { Animated, FlatList, Image, StatusBar, StyleSheet, Text, View, Dimensions, Button, TouchableOpacity, Alert, ScrollView } from 'react-native';

const ActiveUsersEmpty = (props) => {

  const userPhoto = props.userPhoto || 'https://www.neoarmenia.com/wp-content/uploads/generic-user-icon-19.png';
  const [animation, setAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(1500),
        Animated.timing(animation, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false
        })
      ]),
      {
        interations: 100
      }
    ).start()
  }, []);

  const pulseInterpolation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [200, 300]
  });

  const opacityInterpolation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0]
  })

  const animatedPulseStyles = {
    position: "absolute",
    height: pulseInterpolation,
    width: pulseInterpolation,
    opacity: opacityInterpolation,
    backgroundColor: "red",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 200,
    borderWidth: 1,
    borderColor: "red"
  }

  return (
    <View style={ styles.container }>
      <Animated.View style={ animatedPulseStyles } />
        <View style={ styles.imageWrapper }>
          <Image
            source={{ uri: userPhoto }}
            style={ styles.image }
          />
        </View>
        <View style={ styles.title }>
          <Text>Finding users in your area</Text>
        </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  imageWrapper: {
    height: 200,
    width: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "white"
  },
  image: {
    height: null,
    width: null,
    flex: 1,
    borderRadius: 100
  },
  title: {
    position: "absolute",
    top: 20
  }
});

export default ActiveUsersEmpty;
