import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
export default function App() {
    const [fontsLoaded] = useFonts({
        "SF-Compact": require("./assets/fonts/SF-Compact-Text-Medium.otf"),
        "SF-Rounded": require("./assets/fonts/SF-Pro-Rounded-Bold.otf"),
        "SF-Text": require("./assets/fonts/SF-Pro-Text-Regular.otf"),
    });
    if (!fontsLoaded) {
        return <Text>Loading...</Text>;
    }
    return (
        <View style= { styles.container } >
        <Text style={ styles.default }> This text has default style < /Text>
            < Text style = { styles.sfcompact } > This text uses SF Compact < /Text>
                < Text style = { styles.sfrounded } > This text uses SF Rounded < /Text>
                    < Text style = { styles.sftext } > This text uses SF Text < /Text>
                        < StatusBar style = "auto" />
                            </View>
  );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
    default: {
        fontSize: 20,
    },
    sfcompact: {
        fontSize: 20,
        fontFamily: "SF-Compact",
    },
    sfrounded: {
        fontSize: 20,
        fontFamily: "SF-Rounded",
    },
    sftext: {
        fontSize: 20,
        fontFamily: "SF-Text",
    },
});