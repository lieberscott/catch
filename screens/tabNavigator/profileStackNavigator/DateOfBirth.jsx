import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';

const DateOfBirth = (props) => {
  
  const dob0 = props.route.params.dob;
  console.log("dob0 : ", dob0);


  const ios = Platform.OS === "ios";
  const d = new Date();
  const todayMilliseconds = d.getTime();

  const [date, setDate] = useState(new Date(dob0));
  const [dateGood, setDateGood] = useState(true);
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(ios);

  const onChange = (event, selectedDate) => {
    const selectedDate2 = selectedDate || date;
    const userMilliseconds = selectedDate2.getTime();
    const _18years = 1000 * 60 * 60 * 24 * 365.25 * 18;

    // check if user is over 18
    if (userMilliseconds < todayMilliseconds - _18years) {
      setShow(Platform.OS === 'ios');
      setDateGood(true);
      setDate(selectedDate2);
    }
    else {
      setShow(Platform.OS === 'ios');
      setDateGood(false);
      setDate(selectedDate2);
    }
  };

  const handleNext = () => {
    props.setDob(date);
    props.setDateGood(true);
    setTimeout(() => props.goRight(), 60);
  }

  const showMode = currentMode => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode('date');
  };

  return (
    <View style={ styles.container }>
      <View style={ styles.oneSection}>
        <View style={ styles.headerWrapper }>
          <MaterialIcons name="card-travel" size={ 23 } color="gray" />
          <Text style={ styles.header }>Name</Text>
        </View>
        <View style={ styles.middle }>
        <Text style={ styles.subhead }>Next, when is your birthday?</Text>
        <Text style={ styles.warning }>You must be 18 to participate</Text>
        {show ? (
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
        ) : [] }
        { !ios ? <TouchableOpacity activeOpacity={ 1 } onPress={() => setShow(true) } style={ styles.showSpinnerWrapper }>
          <Text style={ styles.pickDate }>Pick Date</Text>
        </TouchableOpacity> : [] }
        <View style={ styles.buttonsWrapper }>
        <TouchableOpacity activeOpacity={ dateGood ? 0.7 : 1 } onPress={ dateGood ? () => props.route.params.updateProfile({ date_of_birth: date }, 3) : undefined } style={ dateGood ? styles.update : styles.updateDisabled }>
          <Text style={ dateGood ? styles.updateText : styles.updateTextDisabled }>Save</Text>
        </TouchableOpacity>
        </View>
      </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  buttonWrapper: {
    flex: 1,
    borderWidth: 1
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
    marginTop: 10
  },
  updateDisabled: {
    borderWidth: 0.5,
    borderColor: "#ccc",
    borderRadius: 20,
    padding: 10,
    marginTop: 10
  },
  updateText: {
    fontSize: 17,
    alignSelf: "center",
    color: "red"
  },
  updateTextDisabled: {
    fontSize: 17,
    alignSelf: "center",
    color: "#444"
  }
})

export default DateOfBirth;

/*

import React, { useState } from 'react';
import { Image, Platform, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const turquoise = "#4ECDC4";

const DateOfBirth = (props) => {

  const ios = Platform.OS === "ios";
  const d = new Date();
  const todayMilliseconds = d.getTime();

  const [date, setDate] = useState(new Date());
  const [dateGood, setDateGood] = useState(false);
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(ios);

  const onChange = (event, selectedDate) => {
    const selectedDate2 = selectedDate || date;
    const userMilliseconds = selectedDate2.getTime();
    const _18years = 1000 * 60 * 60 * 24 * 365.25 * 18;

    // check if user is over 18
    if (userMilliseconds < todayMilliseconds - _18years) {
      setShow(Platform.OS === 'ios');
      setDateGood(true);
      setDate(selectedDate2);
    }
    else {
      setShow(Platform.OS === 'ios');
      setDateGood(false);
      setDate(selectedDate2);
    }
  };

  const handleNext = () => {
    props.setDob(date);
    props.setDateGood(true);
    setTimeout(() => props.goRight(), 60);
  }

  const showMode = currentMode => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode('date');
  };

  const styles = StyleSheet.create({
    buttonsWrapper: {
      flexDirection: "row",
      width: "90%",
      alignSelf: "center"
    },
    button: {
      flex: 1,
      marginHorizontal: 5,
      backgroundColor: dateGood ? turquoise : "#eee",
      color: dateGood ? "white" : "#ddd",
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
      width: "100%",
      marginTop: 100
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
      marginBottom: 10
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
        <Text style={ styles.subhead }>Enter your birthday?</Text>
        <Text style={ styles.warning }>You must be 18 to participate</Text>
        {show ? (
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
        ) : [] }
        { !ios ? <TouchableOpacity activeOpacity={ 1 } onPress={() => setShow(true) } style={ styles.showSpinnerWrapper }>
          <Text style={ styles.pickDate }>Pick Date</Text>
        </TouchableOpacity> : [] }
          <TouchableOpacity onPress={ () => props.route.params.updateProfile({ name }, 3) } style={ styles.update }>
            <Text style={ styles.updateText }>Save</Text>
          </TouchableOpacity>
      </View>
    </View>
  )
}

export default DateOfBirth;

*/