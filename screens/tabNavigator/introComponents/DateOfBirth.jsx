import React, { useState } from 'react';
import { Image, Platform, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const turquoise = "#4ECDC4";

const DateOfBirth = (props) => {

  const ios = Platform.OS === "ios";
  const d = new Date();
  const todayMilliseconds = d.getTime();

  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(ios);

  const onChange = (event, selectedDate) => {
    console.log("onchange");
    const selectedDate2 = selectedDate || date;
    const userMilliseconds = selectedDate2.getTime();
    const _18years = 1000 * 60 * 60 * 24 * 365.25 * 18;

    // check if user is over 18
    if (userMilliseconds < todayMilliseconds - _18years) {
      setShow(Platform.OS === 'ios');
      setDate(selectedDate2);
    }
    else {
      setShow(Platform.OS === 'ios');
      setDate(selectedDate2);
    }
  };

  const handleNext = () => {
    props.setDob(date);
    setTimeout(() => props.goRight(), 60);
  }

  const skip = () => {
    setTimeout(() => props.goRight(), 60);
  }

  const styles = StyleSheet.create({
    buttonsWrapper: {
      flexDirection: "row",
      width: "90%",
      alignSelf: "center"
    },
    button: {
      flex: 1,
      marginHorizontal: 5,
      backgroundColor: turquoise,
      color: "white",
      borderRadius: 30
    },
    button2: {
      flex: 1,
      marginHorizontal: 5,
      backgroundColor: turquoise,
      color: "white",
      borderRadius: 30
    },
    container: {
      flex: 1,
      justifyContent: "center"
    },
    image: {
      height: null,
      width: null,
      flex: 1
    },
    imageWrapper: {
      height: 200,
      width: 200,
      alignSelf: "center"
    },
    middle: {
      flex: 1,
      marginTop: 20,
      width: "100%"
    },
    pickDate: {
      backgroundColor: turquoise,
      color: "white",
      fontSize: 19,
      fontWeight: "600",
      width: "100%",
      padding: 20,
      textAlign: "center",
      borderRadius: 30,
      overflow: "hidden"
    },
    showSpinnerWrapper: {
      marginBottom: 10,
      width: "90%",
      alignSelf: "center"
    },
    skip: {
      flex: 1,
      marginHorizontal: 5,
      backgroundColor: "white",
      borderRadius: 30,
      borderWidth: 1,
      borderColor: "red"
    },
    skipText: {
      width: "100%",
      padding: 10,
      textAlign: "center",
      overflow: "hidden",
      color: "red"
    },
    subhead: {
      alignSelf: "center",
      fontSize: 18,
      color: "#444"
    },
    text: {
      width: "100%",
      padding: 10,
      textAlign: "center",
      overflow: "hidden",
      color: "white"
    },
    topWrapper: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center"
    },
    warning: {
      color: "red",
      fontSize: 10,
      textAlign: "center",
      marginTop: 5
    }
  });

  return (
    <View style={[ styles.container, { width: props.width }] }>
      <View style={ styles.middle }>
        <Text style={ styles.subhead }>Next, when is your birthday?</Text>
        <Text style={ styles.warning }>You must be 18 to participate</Text>
        {/* {show ? ( */}
          <DateTimePicker
            display="spinner"
            testID="dateTimePicker"
            value={date}
            mode={mode}
            onChange={onChange}
            maximumDate={new Date()}
            minimumDate={new Date(1900, 0, 1)}
            textColor="#444"
          />
        {/* ) : [] } */}
        { !ios ? <TouchableOpacity activeOpacity={ 1 } onPress={() => setShow(true) } style={ styles.showSpinnerWrapper }>
          <Text style={ styles.pickDate }>Pick Date</Text>
        </TouchableOpacity> : [] }
        <View style={ styles.buttonsWrapper }>
          <TouchableOpacity activeOpacity={ 1 } onPress={ props.goBack } style={ styles.button2 }>
            <Text style={ styles.text }>Go Back</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={ 1 } onPress={ handleNext } style={ styles.button }>
            <Text style={ styles.text }>Continue</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={ 1 } onPress={ skip } style={ styles.skip }>
            <Text style={ styles.skipText }>Skip</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default DateOfBirth;
