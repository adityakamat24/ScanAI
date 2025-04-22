import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Appbar, useTheme } from 'react-native-paper';
import CameraScreen from '../screens/CameraScreen';
import AnalysisScreen from '../screens/AnalysisScreen';
import DashboardScreen from '../screens/DashboardScreen';

const Stack = createStackNavigator();

export default function HomeStack() {
    const { colors } = useTheme();
    return (
        <Stack.Navigator
            screenOptions={({ navigation, route }) => ({
                header: () => (
                    <Appbar.Header style={{ backgroundColor: colors.primary, elevation: 4 }}>
                        <Appbar.Action icon="menu" color={colors.onPrimary} onPress={() => navigation.openDrawer()} />
                        <Appbar.Content
                            title={route.name}
                            titleStyle={{ color: colors.onPrimary, fontSize: 18 }}
                        />
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
