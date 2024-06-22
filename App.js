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
import LoginScreen from "./components/LoginScreen";
import Tabs from './components/Tabs';
import EnterInformation from "./components/EnterInformation";
import Onboarding from "./components/Onboarding";
// import { onAuthStateChanged } from "firebase/auth";
import { FIREBASE_AUTH } from './FirebaseConfig';
import SignUpScreen from "./components/SignUpScreen";


import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import AsyncStorage from "@react-native-async-storage/async-storage";
import CameraPage from "./components/Camera";

const Stack = createNativeStackNavigator();

export default function App() {
  const auth = FIREBASE_AUTH;

  // AsyncStorage.clear()

  const [loggedIn, setLoggedIn] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(null);
  const [user, setUser] = useState(null);

  function onAuthStateChanged(user) {
    setUser(user);
    getOnboarding();
    console.log(user)
    // if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth.onAuthStateChanged(onAuthStateChanged);
    getOnboarding();
    return subscriber;

  }, [])

  async function getOnboarding() {
    let onboardingDone = await AsyncStorage.getItem("@onboardingDone");
    if (onboardingDone == "true")
      setOnboardingDone(true);
    else
      setOnboardingDone(false);
  }


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false, }}>
          {user
            ? <>
              <Stack.Screen
                name="Start"
                component={Tabs}
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
            </>
            : <>
              {
                !onboardingDone &&
                  <>
                    <Stack.Screen
                      name="Onboarding"
                      component={Onboarding}
                    />
                    <Stack.Screen
                      name="EnterInformation"
                      component={EnterInformation}
                    />
                  </>
              }
              <Stack.Screen
                name="LoginScreen"
                component={LoginScreen}
              />
              <Stack.Screen
                name="SignUpScreen"
                component={SignUpScreen}
              />
            </>


          }
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}


