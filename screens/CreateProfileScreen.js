import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Card, TextInput, Button, Title, Paragraph, useTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const generateId = () => `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

export default function CreateProfileScreen({ navigation }) {
    const { colors } = useTheme();
    const [form, setForm] = useState({ name: '', age: '', weight: '', allergies: '' });

    const saveProfile = async () => {
        if (!form.name.trim()) {
            return Alert.alert('Validation', 'Please enter a name.');
        }
        try {
            const newProfile = { id: generateId(), ...form };
            const stored = await AsyncStorage.getItem('profiles');
            const all = stored ? JSON.parse(stored) : [];
            all.push(newProfile);
            await AsyncStorage.setItem('profiles', JSON.stringify(all));
            await AsyncStorage.setItem('activeProfile', newProfile.id);
            navigation.navigate('Profiles');
        } catch {
            Alert.alert('Error', 'Could not save profile.');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Card style={[styles.card, { backgroundColor: colors.surface }]} elevation={4}>
                <Card.Content>
                    <Title style={{ color: colors.primary, marginBottom: 8 }}>Create Profile</Title>
                    <Paragraph style={{ color: colors.onBackground, marginBottom: 16 }}>Enter details to personalize scans.</Paragraph>
                    <TextInput
                        label="Name"
                        mode="flat"
                        value={form.name}
                        onChangeText={t => setForm(f => ({ ...f, name: t }))}
                        style={[styles.input, { backgroundColor: colors.surface }]}
                        activeUnderlineColor={colors.accent}
                    />
                    <TextInput
                        label="Age"
                        mode="flat"
                        keyboardType="numeric"
                        value={form.age}
                        onChangeText={t => setForm(f => ({ ...f, age: t }))}
                        style={[styles.input, { backgroundColor: colors.surface }]}
                        activeUnderlineColor={colors.accent}
                    />
                    <TextInput
                        label="Weight (kg)"
                        mode="flat"
                        keyboardType="numeric"
                        value={form.weight}
                        onChangeText={t => setForm(f => ({ ...f, weight: t }))}
                        style={[styles.input, { backgroundColor: colors.surface }]}
                        activeUnderlineColor={colors.accent}
                    />
                    <TextInput
                        label="Allergies"
                        mode="flat"
                        placeholder="e.g., peanuts, gluten"
                        value={form.allergies}
                        onChangeText={t => setForm(f => ({ ...f, allergies: t }))}
                        style={[styles.input, { backgroundColor: colors.surface }]}
                        activeUnderlineColor={colors.accent}
                    />
                </Card.Content>
                <Card.Actions style={styles.actions}>
                    <Button
                        mode="contained"
                        onPress={saveProfile}
                        contentStyle={{ paddingVertical: 10 }}
                        style={{ backgroundColor: colors.accent }}
                        labelStyle={{ color: colors.onAccent, fontWeight: '600' }}
                    >
                        Save Profile
                    </Button>
                </Card.Actions>
            </Card>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    card: { borderRadius: 16, marginHorizontal: 16, marginVertical: 20 },
    input: { marginBottom: 12, fontSize: 16 },
    actions: { justifyContent: 'flex-end', padding: 16 }
});
