import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const imageMarginR = 16;
const imageDimensions = 80;

const RequestRow = ({ request }) => {

  const navigation = useNavigation();
  const activeSport = request.activeSport;

  return (
    <TouchableOpacity key={ request.id } activeOpacity={ 1 } style={ styles.body } onPress={() => navigation.navigate("ProfileFull", { users: [request] })}>
      <Image
        style={ styles.image }
        source={{ uri: request.photo }}
      />
      <View style={ styles.textWrapper }>
        <View style={ styles.textWrapperInner }>
          <Text style={ styles.name }>{ request.name }</Text>
          <Text style={ styles.requestText }>Game Request</Text>
        </View>
      </View>
      <View style={{ justifyContent: "center", alignItems: "center", flexGrow: 1 }}>
        <Image style={ styles.image3 } source={ activeSport === 0 ? require('../../../assets/ball-and-glove-5.png') : activeSport === 1 ? require('../../../assets/football.png') : activeSport === 2 ? require('../../../assets/frisbee.png') : activeSport === 3 ? require('../../../assets/basketball.png') : require('../../../assets/favicon.png') } />
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
  requestText: {
    marginLeft: 10,
    backgroundColor: "blue",
    color: "white",
    padding: 5 
  },
  textWrapper: {
    flexDirection: "column",
    justifyContent: "center"
  },
  textWrapperInner: {
    flexDirection: "row",
    alignItems: "center"
  }
});

export default RequestRow;
