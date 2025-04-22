// screens/ProfileListScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { List, Button, Title, Divider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

export default function ProfileListScreen({ navigation }) {
    const [profiles, setProfiles] = useState([]);
    const [activeId, setActiveId] = useState(null);

    useEffect(() => {
        (async () => {
            const all = JSON.parse(await AsyncStorage.getItem('profiles') || '[]');
            setProfiles(all);
            setActiveId(await AsyncStorage.getItem('activeProfile'));
        })();
    }, []);

    const selectProfile = async (id) => {
        await AsyncStorage.setItem('activeProfile', id);
        setActiveId(id);
        navigation.navigate('Scan');
    };

    return (
        <View style={styles.container}>
            <Title>Select Profile</Title>
            <Divider style={{ marginVertical: 8 }} />
            {profiles.map(p => (
                <List.Item
                    key={p.id}
                    title={p.name}
                    description={`${p.age} yrs, ${p.weight}kg${p.allergies ? ` • Allergies: ${p.allergies}` : ''}`}
                    left={props => (
                        <List.Icon
                            {...props}
                            icon={p.id === activeId ? "account-check" : "account"}
                        />
                    )}
                    onPress={() => selectProfile(p.id)}
                />
            ))}
            <Button
                icon="plus"
                mode="contained"
                style={styles.button}
                onPress={() => navigation.navigate('NewProfile')}
            >
                Create New Profile
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#fafafa' },
    button: { marginTop: 24 },
});
