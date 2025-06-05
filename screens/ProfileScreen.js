// screens/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Card, TextInput, Button, Title, Paragraph } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen({ navigation }) {
    const [profile, setProfile] = useState({
        name: '', age: '', weight: '', allergies: ''
    });

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
        <ScrollView contentContainerStyle={styles.container}>
            <Card style={styles.card}>
                <Card.Content>
                    <Title style={styles.title}>Your Profile</Title>
                    <Paragraph>Create a profile to personalize all analyses.</Paragraph>

                    <TextInput
                        label="Name"
                        mode="outlined"
                        value={profile.name}
                        onChangeText={t => setProfile(p => ({ ...p, name: t }))}
                        style={styles.input}
                    />
                    <TextInput
                        label="Age"
                        mode="outlined"
                        keyboardType="numeric"
                        value={profile.age}
                        onChangeText={t => setProfile(p => ({ ...p, age: t }))}
                        style={styles.input}
                    />
                    <TextInput
                        label="Weight (kg)"
                        mode="outlined"
                        keyboardType="numeric"
                        value={profile.weight}
                        onChangeText={t => setProfile(p => ({ ...p, weight: t }))}
                        style={styles.input}
                    />
                    <TextInput
                        label="Allergies (comma‑sep)"
                        mode="outlined"
                        value={profile.allergies}
                        onChangeText={t => setProfile(p => ({ ...p, allergies: t }))}
                        style={styles.input}
                    />
                </Card.Content>
                <Card.Actions>
                    <Button
                        mode="contained"
                        onPress={save}
                        style={styles.button}
                        contentStyle={{ paddingVertical: 6 }}
                    >
                        Save & Scan
                    </Button>
                </Card.Actions>
            </Card>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#f6f6f6',
    },
    card: {
        borderRadius: 8,
        elevation: 4,
    },
    title: {
        marginBottom: 8,
    },
    input: {
        marginTop: 12,
    },
    button: {
        marginLeft: 'auto',
        marginRight: 16,
        marginBottom: 12,
    },
});
