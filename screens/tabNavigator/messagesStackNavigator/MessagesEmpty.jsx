import React, { useState } from 'react';
import { RefreshControl, StyleSheet, ScrollView, Text, View  } from 'react-native';

const MessagesEmpty = (props) => {

  const [refreshing, setRefreshing] = useState(false);

  return (
    <ScrollView
      contentContainerStyle={ styles.container }
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={ () => props.onRefresh() } />
      }
    >
      <View style={ styles.card } />
      <View style={ styles.textWrapper }>
        <Text style={ styles.title }>Start Requesting</Text>
        <Text style={ styles.text }>If you request a game with an active user, your connections will appear here.</Text>
      </View>
    </ScrollView>
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
