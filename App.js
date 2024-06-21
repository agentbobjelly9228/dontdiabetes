import { useFonts } from "expo-font";
import { React, useState, useCallback, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { StyleSheet, Text, View, Image } from 'react-native';
// Removed the import { Link } from 'expo-router' since it's not used here
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './components/HomeScreen';
import ShowPhoto from "./components/ShowPhoto";
import Feedback from "./components/Feedback";
import MacroPage from "./components/macroPage";
import LoginScreen from "./components/login";
import Tabs from './components/Tabs';
import EnterInformation from "./components/EnterInformation";
import Onboarding from "./components/Onboarding";

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import AsyncStorage from "@react-native-async-storage/async-storage";
import CameraPage from "./components/Camera";

const Stack = createNativeStackNavigator(); // Moved inside the component file, but outside the component function
const Tab = createBottomTabNavigator();


export default function App() {
  // AsyncStorage.clear()
  [loggedIn, setLoggedIn] = useState(false);
  async function getLoggedIn() {
    let savedData = await AsyncStorage.getItem('@loggedIn');
    console.log(savedData)
    setLoggedIn(savedData)
  }
  useEffect(() => {
    // logOut();
    getLoggedIn();
  }, [loggedIn]);
  // getLoggedIn();
  async function logOut() {
    await AsyncStorage.setItem("@loggedIn", "false");
    getLoggedIn();
  }


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <NavigationContainer>
        <Stack.Navigator initialRouteName={true ? "Onboarding" : "Home"} screenOptions={{ headerShown: false, gestureEnabled: false, }}>
          <Stack.Screen
            name="Start"
            component={Tabs}
            initialParams={{ logOut }}
          />
          <Stack.Screen
            name="ShowPhoto"
            component={ShowPhoto}
            options={{ gestureDirection: "horizontal" }}
          />
          <Stack.Screen
            name="Camera"
            component={CameraPage}
            options={{ gestureDirection: "vertical" }}

          />
          <Stack.Screen
            name="Feedback"
            component={Feedback}
          />
          <Stack.Screen
            name="macroPage"
            component={MacroPage}
          />
          <Stack.Screen
            name="loginScreen"
            component={LoginScreen}
          />
          <Stack.Screen
            name="EnterInformation"
            component={EnterInformation}
          />
          <Stack.Screen
            name="Onboarding"
            component={Onboarding}
          />
        </Stack.Navigator>
        
      </NavigationContainer>

    </GestureHandlerRootView>
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
