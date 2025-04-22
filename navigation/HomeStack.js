import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Appbar } from 'react-native-paper';

import CameraScreen from '../screens/CameraScreen';
import AnalysisScreen from '../screens/AnalysisScreen';
import DashboardScreen from '../screens/DashboardScreen';

const Stack = createStackNavigator();

export default function HomeStack() {
    return (
        <Stack.Navigator
            screenOptions={({ navigation, route }) => ({
                header: () => (
                    <Appbar.Header>
                        <Appbar.Action
                            icon="menu"
                            onPress={() => navigation.getParent().openDrawer()}
                        />
                        <Appbar.Content title={route.name} />
                    </Appbar.Header>
                ),
            })}
        >
            <Stack.Screen name="Camera" component={CameraScreen} />
            <Stack.Screen name="Analysis" component={AnalysisScreen} />
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
        </Stack.Navigator>
    );
}
