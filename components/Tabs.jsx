import React, { useEffect, useState, useRef, useCallback } from "react";
import { Text, View, StyleSheet, Pressable } from "react-native"
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home2, Camera as CameraIcon, Gallery, Camera, Check, TickSquare, MagicStar, } from "iconsax-react-native";
import SweetSFSymbol from "sweet-sfsymbols";
import { useFonts } from "expo-font";
import * as AppleAuthentication from 'expo-apple-authentication';

import AsyncStorage from "@react-native-async-storage/async-storage";

import HomeScreen from "./HomeScreen";
import CameraPage from "./Camera";
import GalleryPage from "./Gallery";
import DebugPage from "./Debug"
import Feedback from "./Feedback";
import LoginScreen from "./LoginScreen";
import { useFocusEffect } from "@react-navigation/native";

const dayjs = require('dayjs')

const Tab = createBottomTabNavigator();

const CameraTabButton = ({ children, onPress, selectedCamera }) => {
  return (
    <View style={{ alignItems: "center" }}>
      <Pressable
        style={{
          height: 70,
          width: 120,
          borderRadius: 40,
          backgroundColor: '#FFCC26',
          padding: 10,
          alignItems: "center",
          shadowOpacity: 0.5,
          shadowOffset: 5,
          marginBottom: 50,
          justifyContent: "center",
          alignItems: "center",
          bottom: 40,
          shadowOpacity: 0.8,
          // shadowOffset: {width: 10, height: 10},
          shadowRadius: 8,
          shadowColor: "#FFCC26",
          borderWidth: 1,
          borderColor: "#bbbbbb"
        }}
        onPress={onPress}
      >
        <SweetSFSymbol name="camera.aperture" size={40} />
        {/* <CameraIcon size={32} color="black" variant={selectedCamera ? "Bold" : null} /> */}
      </Pressable>
      <Text style={{ position: "absolute", zIndex: 10, top: 35 }}>Scan</Text>
    </View>
  )
};

const ReadyCameraTabButton = ({ children, onPress, selectedCamera }) => {
  return (
    <>
      <Pressable
        style={{
          height: 70,
          width: 120,
          borderRadius: 40,
          backgroundColor: '#FFCC26',
          padding: 10,
          alignItems: "center",
          shadowOpacity: 0.5,
          shadowOffset: 5,
          marginBottom: 50,
          justifyContent: "center",
          alignItems: "center",
          bottom: 30
        }}
        onPress={onPress}
      >
        <CameraIcon size={40} color="black" variant={selectedCamera ? "Bold" : null} />
      </Pressable>
    </>
  )
};

const AllMealsEatenCameraTabButton = ({ children, onPress, selectedCamera }) => {
  return (
    <>
      <Pressable
        style={{
          height: 60,
          width: 60,
          borderRadius: 20,
          backgroundColor: '#FFFFFF',
          padding: 10,
          alignItems: "center",
          shadowOpacity: 0.5,
          shadowOffset: 5,
          marginBottom: 50,
          justifyContent: "center",
          alignItems: "center",
          bottom: 30
        }}
        onPress={onPress}
      >
        <TickSquare size={32} color="black" variant={selectedCamera ? "Bold" : null} />
      </Pressable>
    </>
  )
};


export default function Tabs({ route, navigation }) {
  const isTabBarVisible = (route) => {
    const routeName = route.state
      ? route.state.routes[route.state.index].name
      : (route.params ? route.params.screen : 'HomeScreen');
    return !['Camera'].includes(routeName);
  };
  function clearData() {
    AsyncStorage.removeItem("@todayMacros")
  }
  function sameDay(day1, day2) {
    console.log(day1)
    console.log(day2)
    if (day1[0] == day2[0] && day1[1] == day2[1] && day1[2] == day2[2]) {
      return true
    }
    return false
  }
  async function checkClear() {
    const now = new Date();
    console.log(now)
    const lastMealTime = await AsyncStorage.getItem("@lastMealTime")
    const d = new Date(lastMealTime)
    console.log(now.getMonth())
    console.log(sameDay([now.getDay(), now.getMonth(), now.getFullYear()], [d.getDay(), d.getMonth(), d.getFullYear()]) + "sup")
    if (!sameDay([now.getDay(), now.getMonth(), now.getFullYear()], [d.getDay(), d.getMonth(), d.getFullYear()])) {
      clearData();
    }
  }
  useEffect(() => {
    // clearData()
    checkClear()

  }, [])
  useFocusEffect(
    useCallback(() => {
      const getAndSetMealsEaten = async () => {
        let macros = await AsyncStorage.getItem('@todayMacros');
        macros = JSON.parse(macros)
        let asyncMeals = macros ? Object.keys(macros?.foods) : []
        console.log(asyncMeals)
        setMealsEaten(asyncMeals)
      }

      setSelected(false);
      getAndSetMealsEaten();
    }, [selected])
  );

  const [selected, setSelected] = useState(false)
  const [mealsEaten, setMealsEaten] = useState(null)

  const [preferredMealTimes, setTimes] = useState({ "breakfast": 8, "lunch": 12, "dinner": 18 })



  const getMeal = async () => {
    let hour = dayjs().hour();
    hour = 5


    // Will continue being dinner until 3 AM
    if (((hour >= preferredMealTimes["dinner"] - 1 || hour <= 3) && !mealsEaten.includes("dinner")) || mealsEaten.includes("lunch")) {
      return "dinner"
    } else if ((hour >= preferredMealTimes["lunch"] - 1 && !mealsEaten.includes("lunch")) || mealsEaten.includes("breakfast")) {
      return "lunch"
    } else if (!mealsEaten.includes("breakfast")) {
      return "breakfast"
    } else {
      return null
    }

  }

  const [fontsLoaded] = useFonts({
    "SF-Compact": require("../assets/fonts/SF-Compact-Text-Medium.otf"),
    "SF-Rounded": require("../assets/fonts/SF-Pro-Rounded-Bold.otf"),
    "SF-Text": require("../assets/fonts/SF-Pro-Text-Regular.otf"),
  });
  if (!fontsLoaded) {
    return <Text>Loading...</Text>;
  }

  return (

    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
        },
        // tabBarShowLabel: false,
        tabBarIcon: ({ tintColor, focused }) => {

          let icon;
          if (route.name === "Home") {
            icon = focused
              ? <SweetSFSymbol name="leaf.fill" size={24} />
              : <SweetSFSymbol name="leaf" size={24} />
            // ? <SweetSFSymbol name="sparkles" size={24} />
            // : <SweetSFSymbol name="sparkles" size={24} style={{opacity: 0.6}}/>
            // ? <MagicStar variant="Bold" size={32} style={{ color: "black" }} />
            // : <MagicStar size={32} style={{ color: "black" }} />
          } else if (route.name === "Camera") {
            return (
              <View style={{
                height: 60,
                width: 60,
                borderRadius: 20,
                backgroundColor: '#FFFFFF',
                paddingTop: 15,
                alignItems: "center",
                shadowOpacity: 0.5,
                shadowOffset: 5,
                marginBottom: 40,
              }}>

                {icon = focused
                  // ? <SweetSFSymbol name="dot.circle.viewfinder" variant="Bold" size={27} style={{ color: "black" }} />
                  // : <SweetSFSymbol name="arrow.uturn.backward" variant="Bold" size={27} style={{ color: "black" }} />
                  ? <CameraIcon variant="Bold" size={32} color="black" />
                  : <CameraIcon size={32} color="black" />
                }
              </View>
            )
          } else if (route.name === "Gallery") {
            icon = focused
              ? <SweetSFSymbol name="circle.grid.2x2.fill" variant="Bold" size={24} style={{ color: "black" }} />
              : <SweetSFSymbol name="circle.grid.2x2" variant="Bold" size={24} style={{ color: "black" }} />
            // ? <Gallery variant="Bold" size={32} color="black" />
            // : <Gallery size={32} color="black" />
          }

          return icon;
        },
        tabBarActiveTintColor: 'black',
        tabBarInactiveTintColor: 'black',
      })}>

      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="CameraButton"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <CameraIcon size={32} color="black" />
          ),
          tabBarButton: (props) => {
            if (mealsEaten?.length !== 3)
              return (
                <CameraTabButton
                  {...props}
                  onPress={async () => {
                    setSelected(true)
                    let meal = await getMeal();
                    console.log(meal)
                    if (meal)
                      navigation.navigate('Camera', { mealKey: meal, alertBadPhoto: false })
                    else
                      console.log("ERROR")
                  }}
                  selectedCamera={selected}
                />
              )
            else
              return (
                <AllMealsEatenCameraTabButton
                  {...props}
                  onPress={null}
                />
              )
          }
        }}
      />
      <Tab.Screen name="Gallery" component={GalleryPage} />
      {/* <Tab.Screen name="loginScreen" component={LoginScreen} /> */}

      {/* <Tab.Screen name="Feedback" component={Feedback} />  */}
      {/* <Tab.Screen name="DailyMacros" component={DailyMacros} /> */}
      {/* <Tab.Screen name="DEBUG" component={DebugPage} /> */}

    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 10
  },
  sfcompact: {
    fontSize: 20,
    fontFamily: "SF-Compact",
  },
  sfrounded: {
    fontSize: 30,
    fontFamily: "SF-Rounded",
  },
  sftext: {
    fontSize: 15,
    fontFamily: "SF-Text",
  },
});