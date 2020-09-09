import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import Map from './Map';
// import ProfileFull from './ProfileFull';
// import UsersList from '../messagesStackNavigator/UsersList';

const Stack = createStackNavigator();

export default function MapStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Map" component={ Map } />
      {/* <Stack.Screen name="UsersList" component={UsersList} />
      <Stack.Screen name="ProfileFull" component={ProfileFull} /> */}
    </Stack.Navigator>
  );
}