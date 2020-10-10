import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import Messages from './Messages';
console.log("Step 6A: MessagesStackNavigator 1");


const Stack = createStackNavigator();
console.log("Step 6B: MessagesStackNavigator 2");


export default function MessagesStackNavigator() {
  console.log("Step 6C: MessagesStackNavigator 3");

  return (
    <Stack.Navigator>
      <Stack.Screen name="Messages" component={ Messages } />
    </Stack.Navigator>
  );
}