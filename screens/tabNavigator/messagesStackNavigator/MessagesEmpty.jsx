import React, { useState, useEffect } from 'react';
import { Animated, FlatList, Image, StatusBar, StyleSheet, Text, View, Dimensions, Button, TouchableOpacity, Alert, ScrollView } from 'react-native';

const MessagesEmpty = (props) => {

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
      <View style={ styles.card } />
      <View style={ styles.textWrapper }>
        <Text style={ styles.title }>Start Requesting</Text>
        <Text style={ styles.text }>If you request a game of catch with an active user, your connections will appear here.</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    height: "50%",
    width: "60%",
    backgroundColor: "pink",
    borderRadius: 20
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    textAlign: "center"
  },
  textWrapper: {
    alignItems: "center",
    marginVertical: 10
  },
  title: {
    fontSize: 20,
    fontWeight: "600"
  }
});

export default MessagesEmpty;
