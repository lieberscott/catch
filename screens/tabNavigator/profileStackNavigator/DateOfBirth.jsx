import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';

const DateOfBirth = (props) => {
  
  const dob0 = props.route.params.dob;

  const ios = Platform.OS === "ios";
  const mode = 'date';

  const [date, setDate] = useState(dob0 ? new Date(dob0) : new Date());
  const [didSelect, setDidSelect] = useState(false);
  const [show, setShow] = useState(ios);
  const [disabled, setDisabled] = useState(false);

  const onChange = (event, selectedDate) => {
    const selectedDate2 = selectedDate || date;

    setShow(Platform.OS === 'ios');
    setDidSelect(true);
    setDate(selectedDate2);
  };

  const update = () => {
    if (!disabled) {
      props.route.params.updateProfile({ dateOfBirth: date }, 3);
    }
    setDisabled(true);
  }

  const cancel = () => {
    props.navigation.pop();
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
        <TouchableOpacity disabled={ disabled && didSelect } activeOpacity={  0.7 } onPress={ didSelect ? update : cancel } style={didSelect ? styles.update : styles.cancel }>
          <Text style={ didSelect ? styles.updateText : styles.cancelText }>{ didSelect ? "Save" : "Cancel" }</Text>
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
  cancel: {
    borderWidth: 0.5,
    borderColor: "gold",
    borderRadius: 20,
    padding: 10,
    marginTop: 10
  },
  cancelText: {
    fontSize: 17,
    alignSelf: "center",
    color: "gold"
  },
  update: {
    borderWidth: 0.5,
    borderColor: "red",
    borderRadius: 20,
    padding: 10,
    marginTop: 10
  },
  updateText: {
    fontSize: 17,
    alignSelf: "center",
    color: "red"
  },
  warning: {
    textAlign: "center"
  }
})

export default DateOfBirth;
