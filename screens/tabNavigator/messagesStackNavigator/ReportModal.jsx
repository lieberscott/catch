import React, { useEffect, useState } from 'react';
import { Alert, Animated, Modal, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const modalHeight = 300;

const ReportModal = (props) => {

  const height = props.height;
  const show = props.purchaseReadReceiptsModal;
  const len = props.len;

  const [animation, setAnimation] = useState(new Animated.ValueXY({ x: 0, y: -250 }));

  useEffect(() => {
    if (props.reportModal === true) {
      Animated.spring(animation.y, {
        toValue: (height - modalHeight) / 2,
        duration: 140,
        useNativeDriver: false
      }).start();
    }
  }, [props.reportModal]);

  {/* Interpolation */}

  const backgroundOpacityInterpolation = animation.y.interpolate({
    inputRange: [-250, 500],
    outputRange: ["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.5)"]
  });


  {/* Animated Styles */}

  const animatedViewStyle = {
    transform: [...animation.getTranslateTransform()]
  }

  const animatedOpacityStyle = {
    backgroundColor: backgroundOpacityInterpolation
  }

  {/* Close Modal */}
  const handleClose = () => {
    Animated.timing(animation.y, {
      toValue: -250,
      duration: 140,
      useNativeDriver: false
    }).start(() => props.setReportModal(false));
  }

  const handleReport = () => {
    Alert.alert("", "Are you sure you want to report these users?", [
      { text: "Report", onPress: () => {
        Animated.timing(animation.y, {
          toValue: -250,
          duration: 140,
          useNativeDriver: false
        }).start();
        props.handleReport2();
      }},
      { text: "Cancel" }
    ]);
  }

  const handleUnmatch = () => {
    Alert.alert("", "Are you sure you want to leave?", [
      { text: "Leave", onPress: () => {
        Animated.timing(animation.y, {
          toValue: -250,
          duration: 140,
          useNativeDriver: false
        }).start()
        props.handleUnmatch2();
      }},
      { text: "Cancel" }
    ]);
  }

  const showOnMap = () => {
    Animated.timing(animation.y, {
      toValue: -250,
      duration: 140,
      useNativeDriver: false
    }).start(() => {
      props.showOnMap();
    })
  }

  return (
    <Modal visible={ show } transparent={ true } presentationSytle="fullScreen">
      <AnimatedTouchableOpacity activeOpacity={ 1 } onPress={ handleClose } style={[ styles.outerModal, animatedOpacityStyle ]} />
      <Animated.View style={[ styles.innerModal, animatedViewStyle ]}>
        <View style={ styles.line }>
          <Text style={ styles.title }>Safety Toolkit</Text>
        </View>
        <TouchableOpacity style={ styles.line } onPress={ showOnMap }>
          <MaterialCommunityIcons name="map" size={ 24 } color="green" />
          <Text style={ styles.text }>  View On Map</Text>
        </TouchableOpacity>
        <TouchableOpacity style={ styles.line } onPress={ handleReport }>
          <MaterialCommunityIcons name="flag" size={ 24 } color="red" />
          <Text style={ styles.text }>  Report this Conversation</Text>
        </TouchableOpacity>
        <TouchableOpacity style={ styles.line } onPress={ handleUnmatch }>
          <MaterialCommunityIcons name="block-helper" size={ 18 } color="orange" />
          <Text style={ styles.text }>  Leave this Conversation</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={ handleClose } style={ styles.lineBottom }>
          <MaterialCommunityIcons name="close-circle-outline" size={ 24 } color="purple"  style={ styles.cancelIcon }/>
          <Text style={ styles.text }>  Cancel</Text>
        </TouchableOpacity>
        <FontAwesome name="close" onPress={ handleClose } size={24} color="#aaa" style={ styles.close } />
      </Animated.View>
    </Modal>
  )
}

export default ReportModal;

const styles = StyleSheet.create({
  cancelIcon: {
    marginLeft: -3
  },
  close: {
    position: "absolute",
    right: 20,
    top: 20
  },
  innerModal: {
    height: modalHeight,
    width: "100%",
    alignSelf: "center",
    backgroundColor: "white",
    position: "absolute",
    borderRadius: 20,
    padding: 20
  },
  line: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#d3d3d3",
    padding: 10
  },
  lineBottom: {
    flexDirection: "row",
    padding: 10
  },
  outerModal: {
    flex: 1
  },
  text: {
    fontSize: 18,
    color: "gray"
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "black",
    marginVertical: 20
  }
});