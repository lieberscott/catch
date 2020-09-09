import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const turquoise = "#4ECDC4";

const Gender = (props) => {
  
  const g = props.route.params.gender;
  console.log("props.route.params : ", props.route.params);

  const [search, setSearch] = useState([]);
  const [genderText, setGenderText] = useState(g);

  const handleSearch = (text) => {
    const arr = genders_arr.filter((item) => {
      return item.toLowerCase().includes(text.toLowerCase());
    });
    const arr2 = arr.slice(0, 10);
    if (text === "") {
      setSearch([]);
    }
    else {
      setSearch(arr2);
    }
  }

  const handlePress = (item) => {
    setGenderText(item);
    setSearch([]);
  }

  const styles = StyleSheet.create({
    bottom: {
      marginHorizontal: 20,
    },
    buttonWrapper: {
      flexDirection: "row",
      alignItems: "center"
    },
    container: {
      flex: 1,
      backgroundColor: "#f8f8f8",
      paddingTop: 20
    },
    flatListContainer: {
      borderBottomWidth: 0.5,
      borderRightWidth: 0.5,
      borderLeftWidth: 0.5
    },
    flatListItem: {
      backgroundColor: "#f8f8f8",
      padding: 10
      // borderWidth: 1
    },
    header: {
      color: "gray",
      marginLeft: 10
    },
    headerWrapper: {
      flexDirection: "row",
      alignItems: "center" 
    },
    marginLeft: {
      marginLeft: -10,
      marginTop: 6
    },
    marginRight: {
      marginRight: 10
    },
    oneSection: {
      marginHorizontal: 20,
      marginVertical: 10
    },
    text: {
      backgroundColor: "#eee",
      color: turquoise,
      fontSize: 19,
      fontWeight: "600",
      width: "100%",
      padding: 20,
      textAlign: "center",
      borderRadius: 30,
      overflow: "hidden"
    },
    textInput: {
      flex: 1,
      color: "#444",
      fontSize: 16
    },
    textInputWrapper: {
      flex: 1,
      borderWidth: 0.5,
      borderColor: "gray",
      borderRadius: 20,
      padding: 10,
      marginTop: 10,
      color: "#444",
      flexDirection: "row"
    },
    update: {
      borderWidth: 0.5,
      borderColor: "red",
      borderRadius: 20,
      padding: 10,
      marginTop: 10,
      position: "absolute",
      width: "100%"
    },
    updateText: {
      fontSize: 17,
      alignSelf: "center",
      color: "red"
    },
    wrapperMale: {
      borderColor: g === false ? turquoise : "transparent",
      borderWidth: 2,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 10,
      borderRadius: 30
    },
    wrapperFemale: {
      borderColor: g === true ? turquoise : "transparent",
      borderWidth: 2,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 10,
      borderRadius: 30
    }
  })

  return (
    <TouchableOpacity activeOpacity={ 1 } onPress={ () => setSearch([]) } style={ styles.container }>
      <View style={ styles.oneSection}>
        <View style={ styles.headerWrapper }>
          <MaterialIcons name="perm-identity" size={ 23 } color="gray" />
          <Text style={ styles.header }>Gender (this will appear on your profile)</Text>
        </View>
        <View style={ styles.middle }>
          <TouchableOpacity activeOpacity={ 1 } onPress={() => props.route.params.updateProfile({ gender: true })} style={ styles.wrapperFemale }>
            <Text style={ styles.text }>female</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={ 1 } onPress={() => props.route.params.updateProfile({ gender: false }, 3) } style={ styles.wrapperMale }>
            <Text style={ styles.text }>male</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default Gender;