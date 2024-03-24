import React from "react";
import { Text, View, StyleSheet, } from "react-native"
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home2, Camera as CameraIcon, Gallery } from "iconsax-react-native";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from "expo-font";

import HomeScreen from "./HomeScreen";
import CameraPage from "./Camera";
import GalleryPage from "./Gallery";
import DebugPage from "./Debug"
import DailyMacros from "./DailyMacros";

const Tab = createBottomTabNavigator();

export default function Tabs() {

  const isTabBarVisible = (route) => {
    const routeName = route.state
      ? route.state.routes[route.state.index].name
      : (route.params ? route.params.screen : 'HomeScreen');
    return !['Camera'].includes(routeName);
  };

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
        tabBarIcon: ({ tintColor, focused }) => {
          let icon;
          if (route.name === "Home") {
            icon = focused
              ? <Home2 variant="Bold" size={24} style={styles.sfcompact} />
              : <Home2 size={24} style={{ color: "black" }} />
          } else if (route.name === "Camera") {
            icon = focused
              ? <View style={{
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
                <CameraIcon variant="Bold" size={27} color="black" />
              </View>
              : <View style={{
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
                <CameraIcon size={27} color="black" />
              </View>
          } else if (route.name === "Gallery") {
            icon = focused
              ? <Gallery variant="Bold" size={24} color="black" />
              : <Gallery size={24} color="black" />
          }

          return icon;
        },
        tabBarActiveTintColor: 'black',
        tabBarInactiveTintColor: 'black',
      })}>

      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="Camera"
        component={CameraPage}
      />
      <Tab.Screen name="Gallery" component={GalleryPage} />

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