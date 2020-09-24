import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import Profile from './Profile';
import Name from './Name';
import DateOfBirth from './DateOfBirth';
import Gender from './Gender';
import Notifications from './Notifications';
import Sports from './Sports';
import Map from './Map';
import ProfileText from './ProfileText';
import Active from './Active';

const Stack = createStackNavigator();

export default function ProfileStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Profile" component={Profile} options={{ title: "" }}/>
      <Stack.Screen name="Name" component={Name} options={{ title: "" }}/>
      <Stack.Screen name="DateOfBirth" component={DateOfBirth} options={{ title: "" }}/>
      <Stack.Screen name="Gender" component={Gender} options={{ title: "" }}/>
      <Stack.Screen name="Notifications" component={Notifications} options={{ title: "" }}/>
      <Stack.Screen name="Sports" component={Sports} options={{ title: "" }}/>
      <Stack.Screen name="Map" component={Map} options={{ title: "" }}/>
      <Stack.Screen name="ProfileText" component={ProfileText} options={{ title: "" }}/>
      <Stack.Screen name="Active" component={Active} options={{ title: "" }}/>
    </Stack.Navigator>
  );
}