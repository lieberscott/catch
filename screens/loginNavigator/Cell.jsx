import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const turquoise = "#4ECDC4";

const Cell = (props) => {
  const activateButton = props.phone.length === 10;

  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    if (disabled) {
      setDisabled(false); // re-enable on rerender
    }
  });

  const handlePress = () => {
    setDisabled(true); // disabled on click to prevent multiple taps
    props.checkPhone(1)
  }

  return (
    <View style={[ styles.container, { width: props.width } ]}>
      <View style={ styles.top }>
        <Text style={ styles.question }>What's your number?</Text>
        <Text style={ styles.usNo }>As of now we only accept U.S. mobile numbers</Text>
      </View>
      <View style={ styles.inputWrapper }>
        <View style={ styles.plusOne }>
          <Text style={ styles.plusOneText }>+1</Text>
        </View>
        <TextInput
          autoFocus={ true }
          keyboardType="numeric"
          placeholder="1234567890"
          value={ props.phone }
          onChangeText={ (text) => props.setPhone(text) }
          style={ styles.input }
        />
      </View>
      { props.error ? <Text style={ styles.error }>There was a problem with your request. Please try again.</Text> : [] }
      <TouchableOpacity activeOpacity={ activateButton ? 0.6 : 1 } disabled={ disabled } onPress={ activateButton ? handlePress : undefined } style={ activateButton ? styles.button : styles.buttonDisabled }>
        <Text style={ styles.white }>Continue</Text>
      </TouchableOpacity>
      <Text style={ styles.small }>We will send a code to the number provided. Messaging and data rates may apply.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    alignSelf: "center",
    width: "100%",
    alignItems: "center",
    marginTop: 20,
    backgroundColor: turquoise,
    borderRadius: 20,
    paddingVertical: 12
  },
  buttonDisabled: {
    alignSelf: "center",
    width: "100%",
    alignItems: "center",
    marginTop: 20,
    backgroundColor: "lightgray",
    borderRadius: 20,
    paddingVertical: 12
  },
  container: {
    paddingHorizontal: 80
    // flex: 1
  },
  error: {
    color: "red",
    fontSize: 12
  },
  input: {
    height: 40,
    fontSize: 25,
    display:"flex",
    width:"100%",
    padding:0,
    borderWidth:0,
    justifyContent: "center",
    paddingHorizontal: 3
  },
  inputWrapper: {
    flexDirection: "row",
    height: 40,
    borderRadius: 20,
    borderColor: turquoise,
    borderWidth: 0.5,
    alignSelf: "center"
  },
  plusOne: {
    borderRightWidth: 0.5,
    paddingHorizontal: 30,
    justifyContent: "center"
  },
  plusOneText: {
    fontSize: 25
  },
  question: {
    fontSize: 23,
    fontWeight: "700",
    color: turquoise,
    textAlign: "center"
  },
  small: {
    fontSize: 12,
    marginTop: 10,
    alignSelf: "center",
    textAlign: "center"
  },
  top: {
    marginVertical: 20
  },
  usNo: {
    alignSelf: "center",
    textAlign: "center",
    fontSize: 10,
    marginTop: 3
  },
  white: {
    color: "white"
  }
})

export default Cell;
