import 'react-native-gesture-handler';
import React from 'react';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import HomeStack from './navigation/HomeStack';
import ProfileList from './screens/ProfileListScreen';
import CreateProfile from './screens/CreateProfileScreen';

const theme = {
    ...DefaultTheme,
    roundness: 12,
    colors: {
        primary: '#1f1f1f',
        accent: '#ff6f61',
        background: '#f2f2f2',
        surface: '#ffffff',
        onPrimary: '#ffffff',
        onBackground: '#333333',
        onSurface: '#333333',
        onAccent: '#ffffff',
    },
    fonts: { ...DefaultTheme.fonts, medium: { fontWeight: '600' } },
};

const Drawer = createDrawerNavigator();

export default function App() {
    return (
        <PaperProvider theme={theme}>
            <NavigationContainer>
                <Drawer.Navigator
                    initialRouteName="Profiles"
                    screenOptions={({ route }) => ({
                        headerShown: false,
                        drawerActiveTintColor: theme.colors.primary,
                        drawerInactiveTintColor: '#888',
                        drawerStyle: { backgroundColor: theme.colors.background },
                        drawerIcon: ({ color, size }) => {
                            let iconName = 'circle';
                            if (route.name === 'Scan') iconName = 'camera';
                            if (route.name === 'Profiles') iconName = 'account';
                            if (route.name === 'NewProfile') iconName = 'account-plus';
                            return <MaterialCommunityIcons name={iconName} color={color} size={size} />;
                        },
                    })}
                >
                    <Drawer.Screen name="Scan" component={HomeStack} />
                    <Drawer.Screen name="Profiles" component={ProfileList} />
                    <Drawer.Screen name="NewProfile" component={CreateProfile} options={{ title: 'Create Profile' }} />
                </Drawer.Navigator>
            </NavigationContainer>
        </PaperProvider>
    );
}
