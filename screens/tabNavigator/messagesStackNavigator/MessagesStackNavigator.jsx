import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import Messages from './Messages';
import ProfileFull from '../shared/ProfileFull';
import Conversation from './Conversation';
import UsersList from '../shared/UsersList';

const Stack = createStackNavigator();

export default function MapStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Messages" component={ Messages } />
      {/* <Stack.Screen name="ProfileFull" component={ProfileFull} />
      <Stack.Screen name="Conversation" component={Conversation} />
      <Stack.Screen name="UsersList" component={UsersList} /> */}
    </Stack.Navigator>
  );
}