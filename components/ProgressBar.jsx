import React from 'react';
import { View, Text, Button, Image, StyleSheet, ScrollView, Dimensions, } from 'react-native';
import { Alarm, Sun1, Moon, Add } from "iconsax-react-native";

export default function ProgressBar({ stage, color, emojis }) {

    const totalStages = 3;
    const currentStagePercentage = (emojis.length / totalStages) * 100;

    return (
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginLeft: 20, marginRight: 20, marginTop: 30 }}>

            <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", position: "absolute", zIndex: 100, bottom: 40 }}>
                <Alarm variant={stage == 0 ? "Bold" : null} size={24} color="black" style={{ marginLeft: 2, opacity: stage == 0 ? 1 : 0.5 }} />
                <Sun1 variant={stage == 1 ? "Bold" : null} size={24} color="black" style={{ opacity: stage == 1 ? 1 : 0.5 }} />
                <Moon variant={stage == 2 ? "Bold" : null} size={24} color="black" style={{ marginRight: 2, opacity: stage == 2 ? 1 : 0.5 }} />
            </View>
            <View style={{ backgroundColor: color, borderRadius: 15, height: 30, width: 30 }} />
            <View style={{ backgroundColor: color, borderRadius: 15, height: 30, width: 30 }} />
            <View style={{ backgroundColor: color, borderRadius: 15, height: 30, width: 30 }} />
            <View style={{ position: "absolute", width: "97%", flexDirection: "row", justifyContent: "space-between", marginLeft: 5, marginRight: 5 }}>
                {/* White circles inside green outer circles */}
                <View style={{ backgroundColor: "white", borderRadius: 15, height: 20, width: 20, zIndex: 2, opacity: 1, alignItems: "center", justifyContent: "center" }}>
                    {/* Green circle inside wite inner circles */}
                    <View style={{ position: "absolute", backgroundColor: color, borderRadius: 15, height: 12, width: 12, zIndex: 3, opacity: stage == 0 ? 1 : 0 }} />
                </View>
                <View style={{ backgroundColor: "white", borderRadius: 15, height: 20, width: 20, zIndex: 2, opacity: 1, alignItems: "center", justifyContent: "center", opacity: stage > 0 ? 1 : 0 }}>
                    <View style={{ position: "absolute", backgroundColor: color, borderRadius: 15, height: 12, width: 12, zIndex: 3, opacity: stage == 1 ? 1 : 0 }} />
                </View>
                <View style={{ backgroundColor: "white", borderRadius: 15, height: 20, width: 20, zIndex: 2, opacity: 1, alignItems: "center", justifyContent: "center", opacity: stage > 1 ? 1 : 0 }}>
                    <View style={{ position: "absolute", backgroundColor: color, borderRadius: 15, height: 12, width: 12, zIndex: 3, opacity: stage == 2 ? 1 : 0 }} />
                </View>
            </View>
            <View style={{ position: "absolute", backgroundColor: color, height: 11, width: "90%", zIndex: -1, marginLeft: 20, marginRight: 20 }} />
            {/* white progress bar */}
            <View style={{ position: "absolute", backgroundColor: "white", height: 4, zIndex: 1, marginLeft: 20, marginRight: 20, width: stage === 0 ? "0%" : stage === 1 ? "42%" : "88%" }} />
            <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", position: "absolute", zIndex: 100, top: 50 }}>
                {emojis.length > 0
                    ? <View style={{ alignItems: "center", width: 75, justifyContent: "center" }}>
                        <Text style={styles.emoji}>{emojis[0]}</Text>
                    </View>
                    : <View style={{ borderStyle: "dashed", borderWidth: 2, borderColor: "black", borderRadius: 5, height: 75, width: 75, opacity: 0.3, alignItems: "center", justifyContent: "center" }}>
                        <Add size={40} color="black" />
                    </View>
                }
                {emojis.length > 1
                    ? <View style={{ alignItems: "center", width: 75, justifyContent: "center" }}>
                        <Text style={styles.emoji}>{emojis[1]}</Text>
                    </View>
                    : <View style={{ borderStyle: "dashed", borderWidth: 2, borderColor: "black", borderRadius: 5, height: 75, width: 75, opacity: 0.3, alignItems: "center", justifyContent: "center" }}>
                        <Add size={40} color="black" />
                    </View>
                }
                {emojis.length > 2
                    ? <View style={{ alignItems: "center", width: 75, justifyContent: "center" }}>
                        <Text style={styles.emoji}>{emojis[2]}</Text>
                    </View>
                    : <View style={{ borderStyle: "dashed", borderWidth: 2, borderColor: "black", borderRadius: 5, height: 75, width: 75, opacity: 0.3, alignItems: "center", justifyContent: "center" }}>
                        <Add size={40} color="black" />
                    </View>
                }


            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    emoji: {
        fontSize: 60,
    },
});