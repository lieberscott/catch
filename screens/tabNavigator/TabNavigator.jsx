import React, { useRef, useEffect } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as Notifications from 'expo-notifications';

import Profile from './profileStackNavigator/ProfileStackNavigator';
import Map from './mapStackNavigator/Map';
import Messages from './messagesStackNavigator/Messages';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const Tab = createBottomTabNavigator();

export default function TabNavigator() {

  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(handleNotification);

    // This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
    
    return () => {
      console.log("notifications listeners unmounting");
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    }
  }, []);

  const handleNotification = notification => {
    console.log("handleNotification notification : ", notification);
  };

  const handleNotificationResponse = response => {
    console.log("handleNotificationResponse response : ", response);
  }
  
  return (
    <Tab.Navigator initialRouteName="MapStackNavigator" tabBarOptions={{ activeTintColor: '#e91e63' }}>
      <Tab.Screen
        name="Profile"
        component={ Profile }
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          )
        }}
      />
      <Tab.Screen
        name="MapStackNavigator"
        component={ Map }
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="map-marker-multiple" color={color} size={size} />
          )
        }}
      />
      <Tab.Screen
        name="Messages"
        component={ Messages }
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="message-reply-text" color={color} size={size} />
          )
        }}
      />
    </Tab.Navigator>
  );
}