import { React, useState } from 'react';
import { View, Text, Button } from 'react-native';

export default function Debug({ navigation }) {

    const [score, setScore] = useState(null)

    function calculateFoodScore() {
        let optimalCal = 2000
        let optimalFruits = 2
        let optimalVeg = 3
        let optimalGrain = 4
        let optimalProtein = 6.5
        let optimalDairy = 3
        let optimal = [optimalCal, optimalFruits, optimalVeg, optimalGrain, optimalProtein, optimalDairy]

        let cal = 1000
        let fruits = 2.5
        let veg = 3
        let grain = 8
        let protein = 12
        let dairy = 8
        let eaten = [cal, fruits, veg, grain, protein, dairy]


        for (i in optimal) {
            // Extra 10% leeway
            let leeway = 0.1
            let percentage = eaten[i] / optimal[i];
            if (Math.abs(1 - percentage) < leeway) {
                percentage = 1
            } else {
                if (percentage < 1)
                    percentage += leeway
                else if (percentage > 1) {
                    percentage -= leeway
                    percentage = 2 - percentage
                }
            }
            if (percentage < 0)
                percentage = 0

            console.log(percentage)
        }



    }

    // calculateFoodScore()
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Debug</Text>
            <Button title="What??" onPress={calculateFoodScore} />
        </View>
    );
}