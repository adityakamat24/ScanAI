import React, { useState } from 'react';
import { ScrollView, StyleSheet, Alert } from 'react-native';
import { Card, TextInput, Button, Title, Paragraph } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Simple ID generator for React Native
const generateId = () => `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

export default function CreateProfileScreen({ navigation }) {
    const [form, setForm] = useState({ name: '', age: '', weight: '', allergies: '' });

    const saveProfile = async () => {
        try {
            if (!form.name) {
                return Alert.alert('Validation', 'Please enter a name.');
            }
            const newProfile = { id: generateId(), ...form };
            const stored = await AsyncStorage.getItem('profiles');
            const all = stored ? JSON.parse(stored) : [];
            all.push(newProfile);
            await AsyncStorage.setItem('profiles', JSON.stringify(all));
            await AsyncStorage.setItem('activeProfile', newProfile.id);
            Alert.alert('Success', 'Profile saved.');
            navigation.navigate('Profiles');
        } catch (error) {
            console.error('Save profile error', error);
            Alert.alert('Error', 'Could not save profile. Please try again.');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Card style={styles.card}>
                <Card.Content>
                    <Title>Create Profile</Title>
                    <Paragraph>Fill in user details to personalize your scans.</Paragraph>

                    <TextInput
                        label="Name"
                        mode="outlined"
                        value={form.name}
                        onChangeText={t => setForm(f => ({ ...f, name: t }))}
                        style={styles.input}
                    />
                    <TextInput
                        label="Age"
                        mode="outlined"
                        keyboardType="numeric"
                        value={form.age}
                        onChangeText={t => setForm(f => ({ ...f, age: t }))}
                        style={styles.input}
                    />
                    <TextInput
                        label="Weight (kg)"
                        mode="outlined"
                        keyboardType="numeric"
                        value={form.weight}
                        onChangeText={t => setForm(f => ({ ...f, weight: t }))}
                        style={styles.input}
                    />
                    <TextInput
                        label="Allergies (comma‑sep)"
                        mode="outlined"
                        value={form.allergies}
                        onChangeText={t => setForm(f => ({ ...f, allergies: t }))}
                        style={styles.input}
                    />
                </Card.Content>
                <Card.Actions>
                    <Button mode="contained" onPress={saveProfile}>
                        Save Profile
                    </Button>
                </Card.Actions>
            </Card>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16, backgroundColor: '#fafafa' },
    card: { borderRadius: 10, elevation: 3 },
    input: { marginTop: 16 },
});