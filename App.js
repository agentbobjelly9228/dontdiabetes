import { useFonts } from "expo-font";
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image } from 'react-native';
// Removed the import { Link } from 'expo-router' since it's not used here
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Camera from './components/Camera';
import HomeScreen from './components/HomeScreen';
import ShowPhoto from "./components/ShowPhoto";
import Feedback from "./components/Feedback";
import MacroPage from "./components/macroPage";
import Tabs from './components/Tabs';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Stack = createNativeStackNavigator(); // Moved inside the component file, but outside the component function
const Tab = createBottomTabNavigator();


export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false, gestureEnabled: false, }}>
        <Stack.Screen
          name="Start"
          component={Tabs}
        />
        <Stack.Screen
          name="ShowPhoto"
          component={ShowPhoto}
        />
        <Stack.Screen
          name="Feedback"
          component={Feedback}
        // options={{ animation: 'none' }}
        />
        <Stack.Screen
          name="macroPage"
          component={MacroPage}
        // options={{ animation: 'none' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  default: {
    fontSize: 20,
  },
  sfcompact: {
    fontSize: 20,
    fontFamily: "SF-Compact",
  },
  sfrounded: {
    fontSize: 70,
    fontFamily: "SF-Rounded",
  },
  sftext: {
    fontSize: 20,
    fontFamily: "SF-Text",
  },
});
