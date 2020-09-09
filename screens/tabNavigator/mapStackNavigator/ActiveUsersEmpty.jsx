import React, { useState, useEffect } from 'react';
import { Animated, FlatList, Image, StatusBar, StyleSheet, Text, View, Dimensions, Button, TouchableOpacity, Alert, ScrollView } from 'react-native';

const ActiveUsersEmpty = (props) => {

  return (
    <View style={ styles.container }>
      <Text>Hello</Text>
      <Text>Hello</Text>
      <Text>Hello</Text>
      <Text>Hello</Text>
      <Text>Hello</Text>
      <Text>Hello</Text>
      <Text>Hello</Text>
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
    // borderWidth: 1,
    // borderColor: "white",
    alignItems: "center",
    justifyContent: "center",
    // backgroundColor: "white"
  },
  image: {
    height: 125,
    width: 125,
    flex: 1,
    borderRadius: 100
  },
  title: {
    position: "absolute",
    top: 20
  }
});

export default ActiveUsersEmpty;
