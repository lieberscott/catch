import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';


import LandingPage from './LandingPage';
import PhoneVerification from './PhoneVerification';

const Stack = createStackNavigator();

function MyLoginStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="LandingPage" component={ LandingPage } options={{ headerShown: false }} />
      <Stack.Screen name="PhoneVerification" component={ PhoneVerification } options={{ headerShown: false }}/>
    </Stack.Navigator>
  );
}

export default function LoginStackNavigator() {
  return (
    <NavigationContainer>
      <MyLoginStack />
    </NavigationContainer>
  );
}