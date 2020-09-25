import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import Map from './Map';

const Stack = createStackNavigator();

export default function MapStackNavigator() {
  return (
    <Stack.Navigator headerMode="screen" >
      <Stack.Screen
        name="Map"
        component={ Map }
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}