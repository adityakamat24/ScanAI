// App.js
import 'react-native-gesture-handler';
import React from 'react';
import { Provider as PaperProvider, DefaultTheme, Appbar } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';

import HomeStack from './navigation/HomeStack';
import ProfileList from './screens/ProfileListScreen';
import CreateProfile from './screens/CreateProfileScreen';

const theme = {
    ...DefaultTheme,
    roundness: 10,
    colors: {
        ...DefaultTheme.colors,
        primary: '#333333',
        accent: '#00c9a7',
        background: '#fafafa',
    },
};

const Drawer = createDrawerNavigator();

export default function App() {
    return (
        <PaperProvider theme={theme}>
            <NavigationContainer>
                <Drawer.Navigator
                    initialRouteName="Profiles"
                    screenOptions={{
                        header: ({ navigation, route, options }) => (
                            <Appbar.Header>
                                <Appbar.Action icon="menu" onPress={navigation.openDrawer} />
                                <Appbar.Content title={options.title ?? route.name} />
                            </Appbar.Header>
                        )
                    }}
                >
                    <Drawer.Screen name="Scan" component={HomeStack} options={{ headerShown: false }} />
                    <Drawer.Screen name="Profiles" component={ProfileList} />
                    <Drawer.Screen name="NewProfile" component={CreateProfile} options={{ title: 'Create Profile' }} />
                </Drawer.Navigator>
            </NavigationContainer>
        </PaperProvider>
    );
}
