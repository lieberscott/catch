import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const turquoise = "#4ECDC4";

const Gender = (props) => {
  
  const g_ = props.route.params.gender;

  const [disabled, setDisabled] = useState(false);
  const [g, setG] = useState(g_);

  const update = (num) => {
    if (!disabled) {
      props.route.params.updateProfile({ gender: num === 2 ? false : true }, 3);
      setG(num === 2 ? false : true);
    }
    setDisabled(true);
  }

  const styles = StyleSheet.create({
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
          <Text style={ styles.header }>Gender</Text>
        </View>
        <View style={ styles.middle }>
          <TouchableOpacity activeOpacity={ 1 } onPress={ () => update(1) } style={ styles.wrapperFemale }>
            <Text style={ styles.text }>female</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={ 1 } onPress={() => update(2) } style={ styles.wrapperMale }>
            <Text style={ styles.text }>male</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default Gender;