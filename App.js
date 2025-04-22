// App.js
import React from 'react';
import { Provider as PaperProvider, DefaultTheme, Appbar } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import ProfileScreen from './screens/ProfileScreen';
import CameraScreen from './screens/CameraScreen';
import AnalysisScreen from './screens/AnalysisScreen';
import DashboardScreen from './screens/DashboardScreen';

const theme = {
    ...DefaultTheme,
    roundness: 8,
    colors: {
        ...DefaultTheme.colors,
        primary: '#6200ee',
        accent: '#03dac4',
        background: '#f6f6f6',
    },
};

const Stack = createStackNavigator();

export default function App() {
    return (
        <PaperProvider theme={theme}>
            <NavigationContainer>
                <Stack.Navigator
                    initialRouteName="Profile"
                    screenOptions={{
                        // Correctly receive all header props in a single object
                        header: props => {
                            const { navigation, route, options, back } = props;
                            return (
                                <Appbar.Header>
                                    {back ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
                                    <Appbar.Content
                                        title={options.title ?? route.name}
                                    />
                                </Appbar.Header>
                            );
                        }
                    }}
                >
                    <Stack.Screen name="Profile" component={ProfileScreen} />
                    <Stack.Screen name="Scan" component={CameraScreen} />
                    <Stack.Screen name="Analysis" component={AnalysisScreen} />
                    <Stack.Screen name="Dashboard" component={DashboardScreen} />
                </Stack.Navigator>
            </NavigationContainer>
        </PaperProvider>
    );
}
