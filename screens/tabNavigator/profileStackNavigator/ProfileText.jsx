import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ProfileText = (props) => {

  const p = props.route.params.profileText || "";

  const [aboutMe, setAboutMe] = useState(p);

  return (
    <View style={ styles.container }>
      <View style={ styles.oneSection}>
        <View style={ styles.headerWrapper }>
          <MaterialCommunityIcons name="passport-biometric" size={ 23 } color="gray" />
          <Text style={ styles.header }>Your Profile</Text>
        </View>
        <View style={ styles.buttonWrapper }>
          <View style={ styles.textInputWrapper }>
              <TextInput
                style={ styles.textInput }
                defaultValue="Your profile..."
                numberofLines={ 6 }
                multiline={ true }
                value={ aboutMe }
                onChangeText={(t) => {
                  if (t.length < 500) {
                    setAboutMe(t);
                  }
                }}
              />
              <Text style={ styles.textCount }>{ 500 }</Text>
          </View>
        </View>
        <TouchableOpacity onPress={ () => props.route.params.updateProfile({ profileText: aboutMe }, 3) } style={ styles.update }>
          <Text style={ styles.updateText }>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  buttonWrapper: {
    height: 250
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    paddingTop: 20
  },
  header: {
    color: "gray",
    marginLeft: 10
  },
  headerWrapper: {
    flexDirection: "row",
    alignItems: "center" 
  },
  marginRight: {
    marginRight: 10
  },
  oneSection: {
    marginHorizontal: 20,
    marginVertical: 10
  },
  textCount: {
    position: "absolute",
    bottom: 4,
    right: 10,
    color: "#bbb",
    fontSize: 10
  },
  textInput: {
    flex: 1,
    color: "#444"
  },
  textInputWrapper: {
    flexDirection: "row",
    flex: 1,
    borderWidth: 0.5,
    borderColor: "gray",
    borderRadius: 20,
    height: 60,
    padding: 10,
    marginTop: 10,
    color: "#444"
  },
  update: {
    borderWidth: 0.5,
    borderColor: "red",
    borderRadius: 20,
    padding: 10,
    marginTop: 10,
    color: "#444"
  },
  updateText: {
    fontSize: 17,
    alignSelf: "center",
    color: "red"
  }
})

export default ProfileText;