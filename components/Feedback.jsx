import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Button, SafeAreaView, Pressable, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font'
import WeeklyGraph from './WeeklyGraph';
import Svg, { Path, Circle } from 'react-native-svg';
import { ArrowRight } from 'iconsax-react-native';
import Animated, { FadeInDown, FadeOutDown, FadeOutUp } from 'react-native-reanimated';
import { FIREBASE_AUTH } from '../FirebaseConfig';
import { FIREBASE_DATABASE } from '../FirebaseConfig';
import { ref, update, get } from 'firebase/database';

const screenHeight = Dimensions.get('window').height;

const dayjs = require('dayjs')

export default function Feedback({ navigation }) {
    const auth = FIREBASE_AUTH;
    const database = FIREBASE_DATABASE;

    const [fontsLoaded] = useFonts({
        "SF-Compact": require("../assets/fonts/SF-Compact-Text-Medium.otf"),
        "SF-Rounded": require("../assets/fonts/SF-Pro-Rounded-Bold.otf"),
        "SF-Text": require("../assets/fonts/SF-Pro-Text-Regular.otf"),
        "SpaceGrotesk-Regular": require("../assets/fonts/SpaceGrotesk-Regular.ttf"),
        "SpaceGrotesk-Bold": require("../assets/fonts/SpaceGrotesk-Bold.ttf"),
    });

    const [scores, setScores] = useState([]);
    const [avgGI, setGI] = useState(0);
    const [numMeals, setNumMeals] = useState(null);
    const [page, setPage] = useState(0);


    // For animatimations
    const duration = 350
    const delay = 500

    // For calculations
    const leeway = 0.5;


    useEffect(() => {
        handleData();
        // Get Stored Scores
    }, [])

    useEffect(() => {
        if (numMeals && numMeals !== 3)
            setTimeout(() => navigation.navigate("Home"), 3000);
    }, [numMeals])

    const [todayScreenSubtitle, setTodayScreenSubtitle] = useState(null);
    const [todayScreenText, setTodayScreenText] = useState(null);

    const [tmrwAdvice1, setTmrwAdvice1] = useState(null);
    const [tmrwAdvice1Highlight, settmrwAdvice1Highlight] = useState(null);

    const [tmrwAdvice2, setTmrwAdvice2] = useState(null);
    const [tmrwAdvice2Highlight, settmrwAdvice2Highlight] = useState(null);

    const [tmrwAdvice3, setTmrwAdvice3] = useState(null);
    const [tmrwAdvice3Highlight, settmrwAdvice3Highlight] = useState(null);

    const [finalNote, setFinalNote] = useState(null);

    const continueAdviceStarters = ["Continue eating lots of", "Keep on having lots of"]
    const changeMoreAdviceStarters = ["Try to eat more", "Think about prioritizing your", "Considering consuming more", "Focus on boosting your"]
    const changeLessAdviceStarters = ["Try to eat less", "Try to lessen your", "Consider consuming less", "Think about lowering your"]
    const indexToMacro = ["food", "fruit", "vegetables", "grains", "protein", "dairy"]

    const finalNotes = ["Don't die.", "Your body deserves nourishment. :)", "Cars don't run on soda, but also they don't run on water either. Eat gasoline.", "Don't stress yourself out! You're doing great.", "Your most important sale in life is to sell yourself to yourself."]

    // From mozilla
    function getRandomInt(min, max) {
        const minCeiled = Math.ceil(min);
        const maxFloored = Math.floor(max);
        return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
    }

    // Set messages in daily recap
    function setMessages(position, allErrors) {
        // Final Note
        let randInt = getRandomInt(0, finalNotes.length);
        setFinalNote(finalNotes[randInt])


        // Today Screen: good or bad job
        if (position >= 1 && position <= 4) {
            setTodayScreenSubtitle("Wonderful job!");
            setTodayScreenText("You're continuing your commitment to long-term health and happiness, so pat yourself on the back!");
        } else {
            setTodayScreenSubtitle("Tough day.");
            setTodayScreenText("Looks like you're out of your zone today. But don't fret -- tomorrow is your chance to regain your ground.")
        }

        // Tomorrow Screen: 3 pieces of advice
        console.log("ALL ERRORS: " + allErrors);

        // Guaranteed "change" advice
        let largestErrorIndex = allErrors.reduce((maxIndex, elem, i, allErrors) => Math.abs(elem) > Math.abs(allErrors[maxIndex]) ? i : maxIndex, 0);
        // console.log("LARGEST: " + largestErrorIndex)
        if (Math.abs(allErrors[largestErrorIndex]) > leeway) {
            if (allErrors[largestErrorIndex] < 0) {
                // Ate too little of the macro
                let randInt = getRandomInt(0, changeMoreAdviceStarters.length)
                setTmrwAdvice1(changeMoreAdviceStarters[randInt]);
                changeMoreAdviceStarters.splice(randInt, randInt);

                settmrwAdvice1Highlight(indexToMacro[largestErrorIndex]);
            } else {
                // Ate too much
                let randInt = getRandomInt(0, changeLessAdviceStarters.length)
                setTmrwAdvice1(changeLessAdviceStarters[randInt]);
                settmrwAdvice1Highlight(indexToMacro[largestErrorIndex]);
                changeLessAdviceStarters.splice(randInt, randInt);
            }

            // Remove from arrays (such that advice can't be repeated)
            allErrors.splice(largestErrorIndex, largestErrorIndex)
            indexToMacro.splice(largestErrorIndex, largestErrorIndex)

            // console.log(changeLessAdviceStarters[randInt])
            // console.log(indexToMacro[largestErrorIndex])
            // console.log(largestErrorIndex)
        } else {
            // If absolutely everything is within the macro range
            setTmrwAdvice1("You're doing wonderfully.");
            settmrwAdvice1Highlight("Keep up the great work");
            return
        }

        // Either "change" or "continue" message
        largestErrorIndex = allErrors.reduce((maxIndex, elem, i, allErrors) => Math.abs(elem) > Math.abs(allErrors[maxIndex]) ? i : maxIndex, 0);
        if (Math.abs(allErrors[largestErrorIndex]) > leeway) {
            if (allErrors[largestErrorIndex] < 0) {
                let randInt = getRandomInt(0, changeMoreAdviceStarters.length)
                setTmrwAdvice2(changeMoreAdviceStarters[randInt]);
                settmrwAdvice2Highlight(indexToMacro[largestErrorIndex]);
            } else {
                // Ate too much
                let randInt = getRandomInt(0, changeLessAdviceStarters.length)
                setTmrwAdvice2(changeLessAdviceStarters[randInt]);
                settmrwAdvice2Highlight(indexToMacro[largestErrorIndex]);
            }
        } else {
            let randInt = getRandomInt(0, continueAdviceStarters.length);
            setTmrwAdvice2(continueAdviceStarters[randInt]);
            settmrwAdvice2Highlight(indexToMacro[largestErrorIndex]);
            continueAdviceStarters.splice(randInt, randInt);
        }

        // Guaranteed "continue" message
        let smallestErrorIndex = allErrors.reduce((maxIndex, elem, i, allErrors) => Math.abs(elem) < Math.abs(allErrors[maxIndex]) ? i : maxIndex, 0);
        // console.log(smallestErrorIndex)
        if (Math.abs(allErrors[smallestErrorIndex]) <= leeway) {
            let randInt = getRandomInt(0, continueAdviceStarters.length)
            setTmrwAdvice3(continueAdviceStarters[randInt])
            settmrwAdvice3Highlight(indexToMacro[smallestErrorIndex])
        }



    };

    async function handleData() {
        // Get all previous scores
        // await AsyncStorage.setItem('@allScores', JSON.stringify([1, 2.2, 4.3, 1.2, 3.5, 3.1]))

        // Get all data from today
        const savedDataStr = await AsyncStorage.getItem('@todayMacros');
        const savedData = JSON.parse(savedDataStr);

        setNumMeals(savedData.numMeals)

        if (savedData.numMeals >= 3) {

            // let allScores = await AsyncStorage.getItem('@allScores');
            let snapshot = await get(ref(database, auth.currentUser.uid))
            let allScores = [];
            if (snapshot.exists()) {
                allScores = snapshot.val()?.scores || [];
            } else {
                console.log("No data available");
            }
            // console.log(ref(database))
            console.log(allScores)
            console.log("sup")
            let parsedScores = allScores
            // let tempScore = [];

            // Add today's score to all scores, set displayed scores to last 7 days
            let [position, allErrors] = calculateFoodScore(savedData);
            console.log("Position: " + position);

            // Set messages in daily recap
            setMessages(position, allErrors);

            let newDate = dayjs().set('hour', 0).set('minute', 0).set('second', 0).set('millisecond', 0);


            parsedScores.push({score: position, date: JSON.stringify(newDate)});
            setScores(parsedScores);

            // Update AsyncStorage
            await AsyncStorage.setItem('@allScores', JSON.stringify(parsedScores));
            update(ref(database, auth.currentUser.uid), {scores: parsedScores})

            console.log(savedData.GIs)
            var temp = 0;
            for (let i = 0; i < savedData.GIs.length; i++) {
                temp += savedData.GIs[i]
            }
            setGI(temp / savedData.GIs.length);
        }
    }



    function calculateFoodScore(data) {
        let optimalCal = 2000.0;
        let optimalFruits = 2.0;
        let optimalVeg = 3.0;
        let optimalGrain = 4.0;
        let optimalProtein = 6.5;
        let optimalDairy = 3.0;
        let optimal = [optimalCal, optimalFruits, optimalVeg, optimalGrain, optimalProtein, optimalDairy];
        // console.log(optimal)
        let eaten = [data.kcal, data.fruit, data.vegetables, data.grains, data.protein, data.dairy];
        // console.log(eaten)
        let totalError = 0;

        let allErrors = [];

        let totalLeeway = leeway * optimal.length

        optimal.forEach((optimalValue, index) => {
            let error = (eaten[index] - optimalValue) / optimalValue

            // Append total error to list of all errors
            allErrors.push(error);
            // console.log("Error for " + index + ": " + error)
            totalError += Math.abs(error);
        })

        var position = 2.5 // midpoint

        console.log("Total Error: " + totalError)


        // Calculate position of point on WeeklyGraph
        if (totalError <= totalLeeway) {
            if (data.kcal >= optimalCal) // Error above center
                position += ((totalError / totalLeeway) * 1.5)
            else // Error below center
                position -= ((totalError / totalLeeway) * 1.5)
        } else {
            if (data.kcal >= optimalCal)
                position += 1.5 + (Math.atan(totalError / totalLeeway) / 2) / (Math.PI / 2)
            else
                position -= 1.5 + Math.atan(totalError / totalLeeway) / (Math.PI / 2)
        }

        return [position, allErrors]
    }






    if (numMeals != 3) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: "#130630", }}>
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <Text style={styles.title}>Enjoy your meal!</Text>
                </View>
            </SafeAreaView>
        )
    }

    if (page == 0)
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: "#130630", }}>
                <View style={styles.container}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>Daily Recap</Text>
                        <View style={{ justifyContent: 'center', alignItems: "center", }}>
                            <Svg height={10} width={75}>
                                <Path
                                    d="M1.01929 4.3045C3.45133 0.413228 5.88338 0.413228 8.31543 4.3045C10.7475 8.19578 13.1795 8.19578 15.6116 4.3045C18.0436 0.413228 20.4757 0.413228 22.9077 4.3045C25.3398 8.19578 27.7718 8.19578 30.2039 4.3045C32.6359 0.413228 35.068 0.413228 37.5 4.3045C39.932 8.19578 42.3641 8.19578 44.7961 4.3045C47.2282 0.413228 49.6602 0.413228 52.0923 4.3045C54.5243 8.19578 56.9564 8.19578 59.3884 4.3045C61.8205 0.413228 64.2525 0.413228 66.6846 4.3045C69.1166 8.19578 71.5487 8.19578 73.9807 4.3045"
                                    stroke="#FFCC26"
                                    strokeWidth="2"
                                    fill="none"
                                    style={{ justifyContent: "center" }}
                                />
                            </Svg>
                        </View>
                    </View>
                    <Animated.Text key={"page0subtitle"} entering={FadeInDown.duration(duration).delay(delay * 0.6)} exiting={FadeOutDown.duration(duration)} style={styles.bigSubtitle}>Today...</Animated.Text>
                    <Animated.View key={"page0"} entering={FadeInDown.duration(duration).delay(delay * 0.6)} exiting={FadeOutDown.duration(duration)} style={styles.graph}>
                        <WeeklyGraph datapoints={scores} yellow={true} />
                    </Animated.View>

                    <Animated.View style={styles.graphFeedbackContainer} key={"page0.5"} entering={FadeInDown.duration(duration).delay(delay * 1.5)} exiting={FadeOutDown.duration(duration)}>
                        <Text style={styles.blurbTextHighlighted}>{todayScreenSubtitle}</Text>
                        <Text style={styles.blurbText}>{todayScreenText}</Text>
                    </Animated.View>

                    <Pressable onPress={() => setPage(page + 1)} style={styles.nextBtn}>
                        <ArrowRight size="32" color="#A29CAF" />
                    </Pressable>
                </View>
            </SafeAreaView>
        );

    // if (page == 1)
    //     return (
    //         <SafeAreaView style={{ flex: 1, backgroundColor: "#130630", }}>
    //             <View style={styles.container}>
    //                 <View style={styles.titleContainer}>
    //                     <Text style={styles.title}>Daily Recap</Text>
    //                     <View style={{ justifyContent: 'center', alignItems: "center", }}>
    //                         <Svg height={10} width={75}>
    //                             <Path
    //                                 d="M1.01929 4.3045C3.45133 0.413228 5.88338 0.413228 8.31543 4.3045C10.7475 8.19578 13.1795 8.19578 15.6116 4.3045C18.0436 0.413228 20.4757 0.413228 22.9077 4.3045C25.3398 8.19578 27.7718 8.19578 30.2039 4.3045C32.6359 0.413228 35.068 0.413228 37.5 4.3045C39.932 8.19578 42.3641 8.19578 44.7961 4.3045C47.2282 0.413228 49.6602 0.413228 52.0923 4.3045C54.5243 8.19578 56.9564 8.19578 59.3884 4.3045C61.8205 0.413228 64.2525 0.413228 66.6846 4.3045C69.1166 8.19578 71.5487 8.19578 73.9807 4.3045"
    //                                 stroke="#FFCC26"
    //                                 strokeWidth="2"
    //                                 fill="none"
    //                                 style={{ justifyContent: "center" }}
    //                             />
    //                         </Svg>
    //                     </View>
    //                 </View>
    //                 <Animated.View key={"page1"} entering={FadeInDown.duration(duration).delay(delay)} exiting={FadeOutDown.duration(duration)} style={styles.feedbackContainer}>
    //                     <Text style={styles.blurbText}>
    //                         <Text style={styles.blurbTextHighlighted}>Today, </Text>
    //                         you focused on a
    //                         <Text style={styles.blurbTextHighlighted}> balanced lunch, </Text>
    //                         maintained
    //                         <Text style={styles.blurbTextHighlighted}> high energy levels </Text>
    //                         throughout the day, and ate all
    //                         <Text style={styles.blurbTextHighlighted}> three meals </Text>
    //                         -- keep it up!
    //                     </Text>
    //                 </Animated.View>
    //                 <Pressable onPress={() => setPage(page + 1)} style={styles.nextBtn}>
    //                     <ArrowRight size="32" color="#A29CAF" />
    //                 </Pressable>
    //             </View>
    //         </SafeAreaView>
    //     );

    if (page == 1)
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: "#130630", }}>
                <View style={styles.container}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>Daily Recap</Text>
                        <View style={{ justifyContent: 'center', alignItems: "center", }}>
                            <Svg height={10} width={75}>
                                <Path
                                    d="M1.01929 4.3045C3.45133 0.413228 5.88338 0.413228 8.31543 4.3045C10.7475 8.19578 13.1795 8.19578 15.6116 4.3045C18.0436 0.413228 20.4757 0.413228 22.9077 4.3045C25.3398 8.19578 27.7718 8.19578 30.2039 4.3045C32.6359 0.413228 35.068 0.413228 37.5 4.3045C39.932 8.19578 42.3641 8.19578 44.7961 4.3045C47.2282 0.413228 49.6602 0.413228 52.0923 4.3045C54.5243 8.19578 56.9564 8.19578 59.3884 4.3045C61.8205 0.413228 64.2525 0.413228 66.6846 4.3045C69.1166 8.19578 71.5487 8.19578 73.9807 4.3045"
                                    stroke="#FFCC26"
                                    strokeWidth="2"
                                    fill="none"
                                    style={{ justifyContent: "center" }}
                                />
                            </Svg>
                        </View>
                    </View>
                    <Animated.Text key={"page2subtitle"} entering={FadeInDown.duration(duration).delay(delay)} exiting={FadeOutDown.duration(duration)} style={styles.bigSubtitle}>Tomorrow...</Animated.Text>
                    <Animated.View key={"page2"} entering={FadeInDown.duration(duration).delay(delay * 1.5)} exiting={FadeOutDown.duration(duration)} style={styles.feedbackContainer}>
                        {/* <Text style={styles.blurbText}>Try to eat some<Text style={styles.blurbTextHighlighted}> berries!</Text></Text>
                        <Text style={styles.blurbText}>Continue eating lots of<Text style={styles.blurbTextHighlighted}> protein!</Text></Text>
                        <Text style={styles.blurbText}>Consider drinking a glass of<Text style={styles.blurbTextHighlighted}> milk!</Text></Text> */}

                        <Text style={styles.blurbText}>{tmrwAdvice1}<Text style={styles.blurbTextHighlighted}> {tmrwAdvice1Highlight}.</Text></Text>
                        {tmrwAdvice2 ? <Text style={styles.blurbText}>{tmrwAdvice2}<Text style={styles.blurbTextHighlighted}> {tmrwAdvice2Highlight}.</Text></Text> : null}
                        {tmrwAdvice3 ? <Text style={styles.blurbText}>{tmrwAdvice3}<Text style={styles.blurbTextHighlighted}> {tmrwAdvice3Highlight}!</Text></Text> : null}

                    </Animated.View>
                    <Pressable onPress={() => setPage(page + 1)} style={styles.nextBtn}>
                        <ArrowRight size="32" color="#A29CAF" />
                    </Pressable>
                </View>
            </SafeAreaView>
        );

    if (page == 2)
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: "#130630", }}>
                <View style={styles.container}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>Daily Recap</Text>
                        <View style={{ justifyContent: 'center', alignItems: "center", }}>
                            <Svg height={10} width={75}>
                                <Path
                                    d="M1.01929 4.3045C3.45133 0.413228 5.88338 0.413228 8.31543 4.3045C10.7475 8.19578 13.1795 8.19578 15.6116 4.3045C18.0436 0.413228 20.4757 0.413228 22.9077 4.3045C25.3398 8.19578 27.7718 8.19578 30.2039 4.3045C32.6359 0.413228 35.068 0.413228 37.5 4.3045C39.932 8.19578 42.3641 8.19578 44.7961 4.3045C47.2282 0.413228 49.6602 0.413228 52.0923 4.3045C54.5243 8.19578 56.9564 8.19578 59.3884 4.3045C61.8205 0.413228 64.2525 0.413228 66.6846 4.3045C69.1166 8.19578 71.5487 8.19578 73.9807 4.3045"
                                    stroke="#FFCC26"
                                    strokeWidth="2"
                                    fill="none"
                                    style={{ justifyContent: "center" }}
                                />
                            </Svg>
                        </View>
                    </View>
                    <Animated.Text key={"page3subtitle"} entering={FadeInDown.duration(duration).delay(delay)} exiting={FadeOutDown.duration(duration)} style={styles.bigSubtitle}>And remember...</Animated.Text>
                    <Animated.View key={"page3"} entering={FadeInDown.duration(duration).delay(delay * 1.5)} exiting={FadeOutDown.duration(duration)} style={styles.feedbackContainer}>
                        <Text style={styles.blurbText}>
                            {finalNote}
                        </Text>
                        <Svg
                            width={50}
                            height={23}
                            viewBox="0 0 50 23"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <Path
                                d="M29.244 20.634c-3.778 1.54-6.535-.728-8.119-3.341-.489-.807-.05-1.816.835-2.144l8.4-3.108c.915-.338 1.935.183 2.126 1.139.573 2.879.49 5.932-3.242 7.454z"
                                fill="#FFCC26"
                            />
                            <Circle cx={3.19076} cy={19.6289} r={3.06454} fill="#FFCC26" />
                            <Circle cx={46.9355} cy={3.7745} r={3.06454} fill="#FFCC26" />
                        </Svg>
                    </Animated.View>
                    <Pressable onPress={() => navigation.navigate('Home')} style={styles.homeBtn}>
                        <Text style={styles.blurbText}>G'night!</Text>
                    </Pressable>

                </View>
            </SafeAreaView>
        );

}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center"
    },
    titleEmoji: {
        fontSize: 80,
        fontWeight: 'bold',
        fontFamily: "SF-Rounded",
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: "SpaceGrotesk-Regular",
        color: "#FFCC26",
    },
    bigSubtitle: {
        fontFamily: "SpaceGrotesk-Bold",
        fontSize: 30,
        color: "#FFCC26",
        position: 'absolute',
        top: screenHeight * 0.2
    },
    titleContainer: {
        gap: 10,
        justifyContent: "center",
        alignItems: "center",
        position: 'absolute',
        top: screenHeight * 0.05,
    },
    blurbText: {
        fontSize: 18,
        fontFamily: "SpaceGrotesk-Regular",
        color: "#A29CAF",
        textAlign: "center",
    },
    blurbTextHighlighted: {
        fontSize: 18,
        fontFamily: "SpaceGrotesk-Regular",
        color: "#FFCC26",
        textAlign: "center",
    },
    graph: {
        height: 200,
        position: "absolute",
        top: screenHeight * 0.25
    },
    graphFeedbackContainer: {
        width: "80%",
        position: 'absolute',
        top: screenHeight * 0.55,
        justifyContent: "center",
        alignItems: "center",
        gap: 20
    },
    feedbackContainer: {
        width: "80%",
        position: 'absolute',
        top: screenHeight * 0.3,
        zIndex: 9999,
        justifyContent: "center",
        alignItems: "center",
        gap: 30
    },
    finalNoteContainer: {
        width: "60%",
        position: 'absolute',
        top: screenHeight * 0.4,
    },
    nextBtn: {
        height: 50,
        width: 50,
        borderRadius: 25,
        borderColor: "rgba(255, 255, 255, 0.15)",
        borderWidth: 1,
        justifyContent: "center",
        alignItems: "center",
        position: 'absolute',
        top: screenHeight * 0.8
    },
    homeBtn: {
        paddingLeft: 30,
        paddingRight: 30,
        paddingTop: 15,
        paddingBottom: 15,
        borderRadius: 25,
        borderColor: "rgba(255, 255, 255, 0.15)",
        borderWidth: 1,
        justifyContent: "center",
        alignItems: "center",
        position: 'absolute',
        top: screenHeight * 0.8
    }
});