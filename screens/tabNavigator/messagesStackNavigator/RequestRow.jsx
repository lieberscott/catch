import React, { useState, useEffect } from 'react';
import { Button, Image, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const bodyMarginH = 10; // from Messages.jsx
const imageMarginR = 16;
const imageDimensions = 80;

const RequestRow = ({ request }) => {

  const sportsKeys = Object.getOwnPropertyNames(request.sports);

  const [width, setWidth] = useState(0);
  const navigation = useNavigation();

  return (
      <TouchableOpacity activeOpacity={ 1 } style={ styles.body } onPress={() => navigation.navigate("ProfileFull", { users: [request] })}>
        <Image
          style={ styles.image }
          source={{ uri: request.photo }}
        />
        <View style={ styles.textWrapper }>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={ styles.name }>{ request.name }</Text>
            <Text style={{ marginLeft: 10, backgroundColor: "blue", color: "white", padding: 5 }}>Catch Request</Text>
          </View>
          { sportsKeys.map((item, i) => (
            <Text key={ sportsKeys[i] } ellipsizeMode="tail" numberOfLines={ 1 } style={ styles.message }>{ sportsKeys[i] }: { request.sports[sportsKeys[i]].skill_level }</Text>
          ))}
        </View>
      </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  body: {
    flexDirection: "row",
    paddingVertical: 8,
    backgroundColor: "white"
  },
  image: {
    borderRadius: 50,
    height: imageDimensions,
    width: imageDimensions,
    marginRight: imageMarginR
  },
  message: {
    textAlign: "left",
    color: "#666",
    fontSize: 15
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    justifyContent: "center",
    marginBottom: 6
  },
  newMessage: {
    position: "absolute",
    top: 5,
    zIndex: 2,
    borderRadius: 20,
    height: 15,
    width: 15,
    borderColor: "white",
    borderWidth: 2,
    backgroundColor: "red"
  },
  textWrapper: {
    flexDirection: "column",
    justifyContent: "center"
  }
});

export default RequestRow;
