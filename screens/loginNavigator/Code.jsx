import React, { useState, useEffect } from 'react';
import { Alert, KeyboardAvoidingView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { StackActions } from '@react-navigation/native';
import { StoreContext } from "../../contexts/storeContext.js";


const turquoise = "#4ECDC4";

const Code = (props) => {

  const activateButton = props.code.length === 6;

  const code = props.code;
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    if (disabled) {
      setDisabled(false); // re-enable on rerender
    }
  });

  const handlePress = () => {
    setDisabled(true); // disabled on click to prevent multiple taps
    props.checkCode();
  }

  const handleResend = () => {
    setDisabled(true);
    props.checkPhone(1);
  }

  return (
    <View style={[ styles.container, { width: props.width } ]}>
      <View style={ styles.top }>
        <Text style={ styles.question }>Verify Your Phone</Text>
        <Text style={ styles.usNo }>Enter the 6 digit code we just sent. Your code will expire in 15 minutes.</Text>
        <View style={ styles.height }>
          { props.error2 ? <Text style={ styles.error }>There was a problem with your request. Please try again.</Text> : [] }
          { props.resentMessage ? <Text style={ styles.resendMsg }>Code resent.</Text> : [] }
        </View>
      </View>
      <View style={{ flexDirection: "row"}}>
        <View style={ styles.bar }>
          <Text style={ styles.text }>{ code.length > 0 ? code[0] : "" }</Text>
        </View>
        <View style={ styles.bar }>
          <Text style={ styles.text }>{ code.length > 1 ? code[1] : "" }</Text>
        </View>
        <View style={ styles.bar }>
          <Text style={ styles.text }>{ code.length > 2 ? code[2] : "" }</Text>
        </View>
        <View style={ styles.bar }>
          <Text style={ styles.text }>{ code.length > 3 ? code[3] : "" }</Text>
        </View>
        <View style={ styles.bar }>
          <Text style={ styles.text }>{ code.length > 4 ? code[4] : "" }</Text>
        </View>
        <View style={ styles.bar }>
          <Text style={ styles.text }>{ code.length > 5 ? code[5] : "" }</Text>
        </View>
      </View>
      <TouchableOpacity disabled={ disabled } onPress={ activateButton ? handlePress : undefined } style={ activateButton ? styles.button : styles.button2 }>
        <Text style={ styles.white }>Continue</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={ handleResend } style={ styles.resend }>
        <Text style={ styles.resendText }>Resend my code</Text>
      </TouchableOpacity>
      <TextInput
        ref={ props.textInputRef2 }
        keyboardType="numeric"
        value={ code }
        onChangeText={ (text) => {
          if (text.length <= 6) {
            props.setCode(text);
          }
        }}
        style={ styles.input }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    flex: 1,
    borderBottomWidth: 1,
    marginHorizontal: 3
  },
  button: {
    alignSelf: "center",
    width: "100%",
    alignItems: "center",
    marginTop: 20,
    backgroundColor: turquoise,
    borderRadius: 20,
    paddingVertical: 12
  },
  button2: {
    alignSelf: "center",
    width: "100%",
    alignItems: "center",
    marginTop: 20,
    backgroundColor: "#ddd",
    borderRadius: 20,
    paddingVertical: 12
  },
  container: {
    paddingHorizontal: 80,
    flex: 1
  },
  error: {
    color: "red",
    fontSize: 12,
    alignSelf: "center",
    textAlign: "center",
    flex: 1,
    flexWrap: "wrap"
  },
  height: {
    marginTop: 10,
    flexDirection: "row"
  },
  input: {
    fontSize: 0.5,
    width: 0,
  },
  question: {
    fontSize: 23,
    fontWeight: "700",
    color: turquoise,
    textAlign: "center"
  },
  resend: {
    alignItems: "center",
    marginTop: 10
  },
  resendMsg: {
    color: "green",
    fontSize: 12,
    alignSelf: "center",
  },
  resendText: {
    color: "#666"
  },
  text: {
    textAlign: "center",
    height: 25,
    fontSize: 25,
    marginBottom: 12
  },
  top: {
    marginVertical: 20
  },
  usNo: {
    textAlign: "center",
    fontSize: 10,
    marginTop: 10
  },
  white: {
    color: "white"
  }
})

export default Code;
