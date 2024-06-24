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
import { FIREBASE_AUTH } from './FirebaseConfig';
import SignUpScreen from "./components/SignUpScreen";


import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import AsyncStorage from "@react-native-async-storage/async-storage";
import CameraPage from "./components/Camera";

const dayjs = require('dayjs')

const Stack = createNativeStackNavigator();

// App resets at 3 am or later
const resetHour = 3

export default function App() {
  const auth = FIREBASE_AUTH;

  // AsyncStorage.clear()

  const [onboardingDone, setOnboardingDone] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  function onAuthStateChanged(user) {
    if (user)
      setUser(user);
    else 
      setUser(false)
    console.log("USER" + user)
    getOnboarding();
    // console.log(user)
    // if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const checkIfReset = async () => {

      // Get last logged day
      let loggedDay = await AsyncStorage.getItem("@loggedDay");
      loggedDay = loggedDay ? dayjs(JSON.parse(loggedDay)) : null
  
      // Get current date
      // let now = dayjs().set('date', 25)
      let now = dayjs()
  
      let difference = now.diff(loggedDay, 'hour')  
      
      // If it's been a day + 3 hours or longer, reset & add new day to Async
      if (difference >= 24 + resetHour) {
        await AsyncStorage.removeItem('@todayMacros')
        let newDate = dayjs().set('hour', 0).set('minute', 0).set('second', 0).set('millisecond', 0)
        await AsyncStorage.setItem("@loggedDay", JSON.stringify(newDate))

        console.log("Reset")
      }


      setLoading(false)

      }

    const subscriber = auth.onAuthStateChanged(onAuthStateChanged);
    getOnboarding();
    

    checkIfReset();

    

    return subscriber;

  }, [])

  async function getOnboarding() {
    let onboardingDone = await AsyncStorage.getItem("@onboardingDone");
    if (onboardingDone == "true")
      setOnboardingDone(true);
    else
      setOnboardingDone(false);
  }

  if (onboardingDone !== null && !loading && user !== null)
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


