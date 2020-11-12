import React, { useState, useEffect } from 'react';
import { Animated, Image, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

const ActiveUsersEmpty = (props) => {

  const [animation, setAnimation] = useState(new Animated.Value(0));
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    infiniteLoop();
  }, []);


  const infiniteLoop = () => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: false
    }).start(() => {
      setTimeout(() => {
        animation.setValue(0);
        infiniteLoop()
      }, 2500)
    })
  }

  const pulseInterpolation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 300]
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
    <ScrollView
      contentContainerStyle={ styles.container }
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={ () => props.onRefresh() } />
      }
    >
        <View style={ styles.imageWrapper }>
          <Animated.View style={ animatedPulseStyles } />
          <Image
            resizeMode="contain"
            source={require('../../../assets/basketball.png')}
            style={ styles.image }
          />
        </View>
        <View style={ styles.title }>
          <Text style={ styles.text }>There are no active users in your area. Try again later or pull down to refresh, or start your own game by going to your Profile page.</Text>
        </View>
    </ScrollView>
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
    flex: 1,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center"
  },
  image: {
    height: 125,
    width: 125,
    flex: 1,
    borderRadius: 100
  },
  text: {
    textAlign: "center"
  },
  title: {
    flex: 1,
    justifyContent: "flex-end"
  }
});

export default ActiveUsersEmpty;
