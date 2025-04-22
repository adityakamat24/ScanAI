import React, { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { List, Button, Title, Divider, Paragraph } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function ProfileListScreen({ navigation }) {
    const [profiles, setProfiles] = useState([]);
    const [activeId, setActiveId] = useState(null);

    useFocusEffect(
        React.useCallback(() => {
            (async () => {
                const stored = await AsyncStorage.getItem('profiles');
                const all = stored ? JSON.parse(stored) : [];
                setProfiles(all);
                const active = await AsyncStorage.getItem('activeProfile');
                setActiveId(active);
            })();
        }, [])
    );

    const selectProfile = async id => {
        await AsyncStorage.setItem('activeProfile', id);
        setActiveId(id);
        navigation.navigate('Scan');
    };

    return (
        <SafeAreaView style={styles.container}>
            <Title>Select Profile</Title>
            <Divider style={{ marginVertical: 8 }} />
            {profiles.length === 0 && (
                <Paragraph style={{ marginVertical: 16 }}>
                    No profiles yet. Create one below.
                </Paragraph>
            )}
            {profiles.map(p => (
                <List.Item
                    key={p.id}
                    title={p.name}
                    description={`${p.age} yrs, ${p.weight}kg${p.allergies ? ` • Allergies: ${p.allergies}` : ''
                        }`}
                    left={props => (
                        <List.Icon
                            {...props}
                            icon={p.id === activeId ? 'account-check' : 'account'}
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, paddingTop: 80, backgroundColor: '#fafafa' },
    button: { marginTop: 24 },
});