import React, { useEffect, useState, useRef, useCallback } from "react";
import { Text, View, StyleSheet, Pressable } from "react-native"
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home2, Camera as CameraIcon, Gallery, Camera, } from "iconsax-react-native";
// import SweetSFSymbol from "sweet-sfsymbols";
import { useFonts } from "expo-font";

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
        <CameraIcon size={32} color="black" variant={selectedCamera ? "Bold" : null} />
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
  useFocusEffect(
    useCallback(() => {
      setSelected(false)
    }, [selected])
  );

  const [selected, setSelected] = useState(false)

  const [preferredMealTimes, setTimes] = useState({ "breakfast": 8, "lunch": 12, "dinner": 18 })

  const getMeal = () => {
    let hour = dayjs().hour();
    if (hour >= preferredMealTimes["dinner"] - 1) {
      return "dinner"
    } else if (hour >= preferredMealTimes["lunch"] - 1) {
      return "lunch"
    } else {
      return "breakfast"
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
          borderTopWidth: 0,
        },
        tabBarShowLabel: false,
        tabBarIcon: ({ tintColor, focused }) => {

          let icon;
          if (route.name === "Home") {
            icon = focused
              // ? <SweetSFSymbol name="leaf.fill" variant="Bold" size={24} style={{ color: "black" }} />
              // : <SweetSFSymbol name="leaf" variant="Bold" size={24} style={{ color: "black" }} />
              ? <Home2 variant="Bold" size={32} style={{ color: "black" }} />
              : <Home2 size={32} style={{ color: "black" }} />
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
              // ? <SweetSFSymbol name="circle.grid.2x2.fill" variant="Bold" size={27} style={{ color: "black" }} />
              // : <SweetSFSymbol name="circle.grid.2x2" variant="Bold" size={27} style={{ color: "black" }} />
              ? <Gallery variant="Bold" size={32} color="black" />
              : <Gallery size={32} color="black" />
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
          tabBarButton: (props) => (
            <CameraTabButton
              {...props}
              onPress={() => {
                setSelected(true)
                let meal = getMeal()
                navigation.navigate('Camera', { mealKey: meal, alertBadPhoto: false })
              }}
              selectedCamera={selected}
            />
          )
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