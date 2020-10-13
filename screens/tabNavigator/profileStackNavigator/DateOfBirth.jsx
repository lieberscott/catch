import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';

const DateOfBirth = (props) => {
  
  const dob0 = props.route.params.dob;

  const ios = Platform.OS === "ios";
  const d = new Date();
  const todayMilliseconds = d.getTime();

  const [date, setDate] = useState(new Date(dob0));
  const [dateGood, setDateGood] = useState(true);
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(ios);
  const [disabled, setDisabled] = useState(false);

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

  const update = () => {
    if (!disabled) {
      props.route.params.updateProfile({ dateOfBirth: date }, 3);
    }
    setDisabled(true);
  }

  return (
    <View style={ styles.container }>
      <View style={ styles.oneSection}>
        <View style={ styles.headerWrapper }>
          <MaterialIcons name="date-range" size={ 23 } color="gray" />
          <Text style={ styles.header }>Date Of Birth</Text>
        </View>
        <View style={ styles.middle }>
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
        <TouchableOpacity activeOpacity={ dateGood ? 0.7 : 1 } onPress={ dateGood ? update : undefined } style={ dateGood ? styles.update : styles.updateDisabled }>
          <Text style={ dateGood ? styles.updateText : styles.updateTextDisabled }>Save</Text>
        </TouchableOpacity>
      </View>
      </View>
    </View>
  )
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
  },
  warning: {
    textAlign: "center"
  }
})

export default DateOfBirth;
