import React from 'react';
import { StyleSheet, View, Image, Text, TouchableOpacity } from 'react-native';

const imageMarginR = 16;
const imageDimensions = 80;

const UsersList = (props) => {

 const users = props.route.params.users;
 const requestAllowed = props.route.params.requestAllowed;

  return (
    <View style={ styles.container }>
      { users.map((user, i) => (
        <TouchableOpacity key={ user._id } style={ styles.body } onPress={() => props.navigation.navigate("ProfileFull", { users: [users[i]], requestAllowed })}>
          <Image style={ styles.image } source={{ uri: user.photo }} />
          <View style={ styles.textWrapper }>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={ styles.name }>{ user.name }</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  body: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc"
  },
  container: {
    flex: 1
  },
  image: {
    borderRadius: 50,
    height: imageDimensions,
    width: imageDimensions,
    marginRight: imageMarginR
  },
  textWrapper: {
    flexDirection: "column",
    justifyContent: "center"
  }
})

export default UsersList;
