import React from 'react';
import { View, Text } from 'react-native';

export default function AppWeb() {
    console.log("AppWeb loaded");
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'purple' }}>
            <Text style={{ fontSize: 30, color: 'white' }}>AppWeb Working</Text>
        </View>
    );
}
