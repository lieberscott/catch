import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import Messages from './Messages';

const Stack = createStackNavigator();

export default function MessagesStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Messages" component={ Messages } />
    </Stack.Navigator>
  );
}