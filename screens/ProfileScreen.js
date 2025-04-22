// screens/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen({ navigation }) {
    const [profile, setProfile] = useState({ name: '', age: '', weight: '', allergies: '' });

    useEffect(() => {
        AsyncStorage.getItem('userProfile').then(json => {
            if (json) setProfile(JSON.parse(json));
        });
    }, []);

    const save = async () => {
        await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
        navigation.replace('Scan');
    };

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <Text>Name</Text>
            <TextInput
                style={{ borderBottomWidth: 1, marginBottom: 12 }}
                value={profile.name}
                onChangeText={t => setProfile(p => ({ ...p, name: t }))}
            />
            <Text>Age</Text>
            <TextInput
                style={{ borderBottomWidth: 1, marginBottom: 12 }}
                keyboardType="numeric"
                value={profile.age}
                onChangeText={t => setProfile(p => ({ ...p, age: t }))}
            />
            <Text>Weight (kg)</Text>
            <TextInput
                style={{ borderBottomWidth: 1, marginBottom: 12 }}
                keyboardType="numeric"
                value={profile.weight}
                onChangeText={t => setProfile(p => ({ ...p, weight: t }))}
            />
            <Text>Allergies (comma‑sep)</Text>
            <TextInput
                style={{ borderBottomWidth: 1, marginBottom: 24 }}
                value={profile.allergies}
                onChangeText={t => setProfile(p => ({ ...p, allergies: t }))}
            />
            <Button title="Save & Scan" onPress={save} />
        </View>
    );
}
