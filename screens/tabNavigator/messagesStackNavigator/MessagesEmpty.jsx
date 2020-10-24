import React from 'react';
import { StyleSheet, Text, View  } from 'react-native';

const MessagesEmpty = (props) => {


  return (
    <View style={ styles.container }>
      <View style={ styles.card } />
      <View style={ styles.textWrapper }>
        <Text style={ styles.title }>Start Requesting</Text>
        <Text style={ styles.text }>If you request a game with an active user, your connections will appear here.</Text>
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
