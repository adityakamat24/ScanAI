import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { Card, Title, Paragraph, Button, useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function ProfileListScreen({ navigation }) {
    const { colors } = useTheme();
    const [profiles, setProfiles] = useState([]);
    const [activeId, setActiveId] = useState(null);

    useFocusEffect(
        React.useCallback(() => {
            (async () => {
                const stored = await AsyncStorage.getItem('profiles');
                const all = stored ? JSON.parse(stored) : [];
                setProfiles(all);
                setActiveId(await AsyncStorage.getItem('activeProfile'));
            })();
        }, [])
    );

    const selectProfile = async id => {
        await AsyncStorage.setItem('activeProfile', id);
        setActiveId(id);
        navigation.navigate('Scan');
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {profiles.map(p => (
                <Card
                    key={p.id}
                    style={[styles.card, { borderColor: p.id === activeId ? colors.accent : colors.onSurface }]}
                    elevation={3}
                >
                    <Card.Content>
                        <Title style={{ color: colors.primary }}>{p.name}</Title>
                        <Paragraph style={{ color: colors.onBackground }}>{`${p.age} yrs • ${p.weight}kg`}</Paragraph>
                        {p.allergies ? <Paragraph style={{ color: colors.onBackground }}>Allergies: {p.allergies}</Paragraph> : null}
                    </Card.Content>
                    <Card.Actions>
                        <Button
                            mode={p.id === activeId ? 'outlined' : 'contained'}
                            onPress={() => selectProfile(p.id)}
                            style={p.id === activeId ? styles.outlinedBtn : { backgroundColor: colors.primary }}
                            labelStyle={{ color: p.id === activeId ? colors.primary : colors.onPrimary }}
                        >
                            {p.id === activeId ? 'Active' : 'Use'}
                        </Button>
                    </Card.Actions>
                </Card>
            ))}
            <View style={styles.footer}>
                <Button
                    icon="plus"
                    mode="contained"
                    onPress={() => navigation.navigate('NewProfile')}
                    contentStyle={{ paddingVertical: 8 }}
                    style={{ backgroundColor: colors.accent }}
                    labelStyle={{ color: colors.onAccent, fontSize: 16 }}
                >
                    New Profile
                </Button>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    card: { marginHorizontal: 16, marginVertical: 12, borderRadius: 12, borderWidth: 1 },
    footer: { padding: 16, alignItems: 'center' },
    outlinedBtn: { borderWidth: 1, borderColor: '#aaa' }
});
