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
import Reauthorization from './Reauthorization';

console.log("Step 6A: ProfileStackNavigator 1");

const Stack = createStackNavigator();

console.log("Step 6B: ProfileStackNavigator 2");

export default function ProfileStackNavigator() {
  console.log("Step 6C ProfileStackNavigator 3");
  return (
    <Stack.Navigator headerMode="screen">
      <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false }} />
      <Stack.Screen name="Name" component={Name} options={{ title: "" }} />
      <Stack.Screen name="DateOfBirth" component={DateOfBirth} options={{ title: "" }} />
      <Stack.Screen name="Gender" component={Gender} options={{ title: "" }} />
      <Stack.Screen name="Notifications" component={Notifications} options={{ title: "" }} />
      <Stack.Screen name="Sports" component={Sports} options={{ title: "" }} />
      <Stack.Screen name="Map" component={Map} options={{ title: "" }} />
      <Stack.Screen name="ProfileText" component={ProfileText} options={{ title: "" }} />
      <Stack.Screen name="Reauthorization" component={Reauthorization} options={{ title: "" }} />
    </Stack.Navigator>
  );
}