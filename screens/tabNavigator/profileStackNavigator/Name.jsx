import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const Name = (props) => {
  
  const n = props.route.params.name;

  const [name, setName] = useState(n || "");
  const [disabled, setDisabled] = useState(false);

  const update = () => {
    if (!disabled) {
      props.route.params.updateProfile({ name }, 3)
    }
    setDisabled(true);
  }

  return (
    <View style={ styles.container }>
      <View style={ styles.oneSection}>
        <View style={ styles.headerWrapper }>
          <MaterialIcons name="face" size={ 23 } color="gray" />
          <Text style={ styles.header }>Name</Text>
        </View>
        <View style={ styles.buttonWrapper }>
          <View style={ styles.textInputWrapper }>
            <TextInput
              style={ styles.textInput }
              defaultValue="Your job"
              numberofLines={ 1 }
              value={ name }
              onChangeText={(t) => {
                if (t.length < 340) {
                  setName(t);
                }
              }}
            />
            <TouchableOpacity>
              <MaterialIcons style={ styles.marginRight } onPress={() => setName("") } name="close" size={ 15 } color="gray" />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity onPress={ update } style={ styles.update }>
          <Text style={ styles.updateText }>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  buttonWrapper: {
    flexDirection: "row"
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
    color: "#444"
  },
  updateText: {
    fontSize: 17,
    alignSelf: "center",
    color: "red"
  }
})

export default Name;