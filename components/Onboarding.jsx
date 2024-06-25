import React, { useState, useEffect } from 'react';
import { useFonts } from "expo-font";
import { View, Text, Button, Image, StyleSheet, ScrollView, Dimensions, TextInput, Pressable, FlatList, } from 'react-native';
import { auth } from '../FirebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import happylunchguy from "../assets/mascots/yellowGuy.png"
import onboardingguy from "../assets/mascots/onboardingguy.png"
import smallguy from "../assets/mascots/smallGuy.png"

const screenWidth = Dimensions.get("screen").width
const screenHeight = Dimensions.get("screen").height

data = [
    {
        index: 0,
        title: "This is Big Guy.",
        image: smallguy,
        text: "He's been waiting for you to join him on a neat, new, nutrition journey.",
    },
    {
        index: 1,
        title: "Here's what you do.",
        text: "With Nutrivision, you just have to snap a photo of your food whenever you eat something. That's it! No calorie tracking, no barcode scanning, no stress."
    },
    {
        index: 2,
        title: "Here's what we do.",
        text: "In return, we'll give you daily, actionable advice each evening that will help you eat happier and healthier. We will never tell you to restrict, diet, or push."
    },
    {
        index: 3,
        title: "Please note...",
        text: "This is still a very early release, so please feel free to submit any feedback on how to make the app better and more helpful. Now, let's introduce you to Big Guy!"
    },

]

export default function Onboarding({ navigation }) {

    const [fontsLoaded] = useFonts({
        "SF-Compact": require("../assets/fonts/SF-Compact-Text-Medium.otf"),
        "SF-Rounded": require("../assets/fonts/SF-Pro-Rounded-Bold.otf"),
        "SF-Text": require("../assets/fonts/SF-Pro-Text-Regular.otf"),
    });

    return (
        <View style={{ backgroundColor: "#FFFBEE", flex: 1, }}>
            <Image source={onboardingguy} style={{ alignSelf: "center", height: screenHeight * 0.6, position: "absolute", top: screenHeight * -0.1, }} />
            <Text style={styles.infoTitle}>All about Nutrivision</Text>
            <FlatList
                data={data}
                horizontal
                renderItem={({ item }) => <Item text={item.text} title={item.title} image={item.image} navigation={navigation} />}
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                style={{ position: "absolute", zIndex: 100, top: screenHeight * 0.4 }}
            // initialScrollIndex={-1}

            />
            <View style={{ position: "absolute", top: screenHeight * 0.85, justifyContent: "center", alignSelf: "center", gap: 10 }}>
                <Pressable style={styles.infoButton}><Text style={styles.infoButtonText}>Let's Begin!</Text></Pressable>
                <Pressable onPress={() => { navigation.navigate("LoginScreen") }}>
                    <Text style={styles.infoButtonTextSmall}>Already have an account? Log In</Text>
                </Pressable>
            </View>
        </View>
    );
}


function Item({ text, title, image, navigation }) {
    return (
        <View style={{ width: screenWidth, height: screenWidth, alignItems: "center", }}>
            <View style={{ ...styles.infoCard }}>
                <View style={{gap: 20, justifyContent: "center", alignItems: "center"}}>
                    <Text style={styles.title}>{title}</Text>
                    {image && <Image source={smallguy} />}
                    <Text style={{ ...styles.cardText }}>{text}</Text>
                </View>
            </View>
        </View>
    )
}

// <View style={{width: screenWidth, height: screenWidth, alignItems: "center", }}>
//     <Text style={title == "Welcome!" ? styles.infoTitle : {display: "none"}}>{title}</Text>
//     <Text style={styles.infoText}>{text}</Text>
//     {title == "Welcome!" 
//         ? <>
//             <Pressable style={styles.infoButton}>
//                 <Text style={styles.infoButtonText}>Learn the basics by swiping right!</Text>
//             </Pressable>
//             <Pressable onPress={() => {navigation.navigate("LoginScreen")}} style={{position: "absolute", top: screenWidth * 0.9,}}>
//                 <Text style={styles.infoButtonTextSmall}>Or, log in</Text>
//             </Pressable>
//         </>
//         : null
//     }
//     {title == "2/3" 
//         ? <Pressable onPress={() => navigation.navigate("EnterInformation")} style={styles.infoButton}><Text style={styles.infoButtonText}>Ok!</Text></Pressable>
//         : null
//     }
// </View>

const styles = StyleSheet.create({
    background: {
        padding: 50,
    },
    title: {
        fontSize: 30,
        alignSelf: "center",
        fontFamily: "SF-Compact",

    },
    input: {
        fontSize: 20,
        borderColor: "gray",
        borderWidth: 1,
        alignSelf: "center",
        width: 150,
        opacity: 0.5,
        borderRadius: 10,
        paddingLeft: 10,
        margin: 10
    },
    loginBtn: {
        backgroundColor: "green",
        borderWidth: 1,
        borderColor: "green",
        width: 100,
        height: 30,
        borderRadius: 20,
        alignSelf: "center",
        alignItems: "center"
    },
    infoTitle: {
        fontFamily: "SF-Rounded",
        textAlign: "center",
        fontSize: 35,
        position: "absolute",
        top: screenHeight * 0.35,
        textAlign: "center",
        alignSelf: "center"

    },
    infoText: {
        fontFamily: "SF-Pro",
        textAlign: "center",
        fontSize: 22,
        padding: 50,
        position: "absolute",
        top: screenHeight * 0.05
    },
    infoButton: {
        backgroundColor: "#FFCC26",
        borderRadius: 35,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#FFDE70",
        shadowOpacity: 1,
        shadowRadius: 20,
        elevation: 2,
        paddingLeft: 15,
        paddingRight: 15,
        paddingTop: 10,
        paddingBottom: 10,
    },
    infoButtonText: {
        fontFamily: "SF-Rounded",
        textAlign: "center",
        fontSize: 22,
    },
    infoButtonTextSmall: {
        fontFamily: "SF-Pro",
        textAlign: "center",
        fontSize: 20,
        textDecorationLine: "underline",
    },
    infoCard: {
        height: screenHeight * 0.4,
        width: screenHeight * 0.4,
        backgroundColor: "white",
        shadowColor: "#000000",
        shadowOpacity: 0.3,
        shadowRadius: 10,
        top: 20,
        borderRadius: 20,
        padding: 20,
        alignItems: "center",
        justifyContent: "center"
    },
    cardText: {
        fontFamily: "SF-Pro",
        textAlign: "center",
        fontSize: 20,
    },
});




// export default function LoginScreen({ navigation, onLogin }) {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [loading, setLoading] = useState(false);
//     const [action, setAction] = useState("login");
//     const [loggedIn, setLoggedIn] = useState(false);

//     const signIn = async () => {
//         setLoading(true);
//         try {
//             const response = await signInWithEmailAndPassword(auth, email, password);
//             setLoggedIn(true);
//             onLogin();
//             await AsyncStorage.setItem('@loggedIn', "true");
//         } catch (error) {
//             setLoggedIn(false);
//             console.log(error);
//             await AsyncStorage.setItem('@loggedIn', "false");
//         } finally {
//             setLoading(false);
//         }
//     }

//     async function register() {
//         setLoading(true);
//         try {
//             const response = await createUserWithEmailAndPassword(auth, email, password);
//             console.log(response);
//             setLoggedIn(true);
//             onLogin();
//             await AsyncStorage.setItem('@loggedIn', "true");
//         } catch (error) {
//             console.log(error)
//         }
//     }
//     return (
//         <View style={styles.background}>
//             <Text style={styles.title}>{action === "login" ? "Login" : "Register"}</Text>
//             <TextInput value={email} style={styles.input} placeholder='email' onChangeText={(text) => setEmail(text)} autoCapitalize='none' />
//             <TextInput value={password} style={styles.input} placeholder='password' secureTextEntry={true} onChangeText={(text) => setPassword(text)} autoCapitalize='none' />
//             {action === "login"
//                 ? <Button title="Don't have an account? Register here" onPress={() => {setAction("register") }} />
//                 : <Button title="Already have an account? Login here" onPress={() => {setAction("login") }} />
//             }
//             {loading
//                 ? <Text>Loading...</Text>
//                 : <Pressable title='login' style={styles.loginBtn} onPress={() => {
//                     console.log(auth)
//                     console.log(email)
//                     console.log(password)
//                     if (action === "login") {
//                         signIn();
//                     } else {
//                         register();
//                     }
//                 }}>
//                     {action === "login"
//                         ? <Text>Login</Text>
//                         : <Text>Register</Text>
//                     }
//                 </Pressable>
//             }
//             {loggedIn 
//                 ? <Text>Logged In</Text> 
//                 : <Text>Invalid Credentials</Text>
//             }
//         </View>
//     );
// }
