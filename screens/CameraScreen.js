// screens/CameraScreen.js
import React, { useEffect, useState } from 'react';
import { View, Alert, Platform, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Card, Button, Paragraph } from 'react-native-paper';

export default function CameraScreen({ navigation }) {
    const [hasPermission, setHasPermission] = useState(null);

    // 1️⃣ Ask for camera permission on mount
    useEffect(() => {
        (async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
            if (status !== 'granted') {
                Alert.alert(
                    'Permission required',
                    'Camera access is needed to take product photos.'
                );
            }
        })();
    }, []);

    // 2️⃣ Launch camera and auto‑navigate when a photo is taken
    const takePhoto = async () => {
        if (hasPermission !== true) {
            Alert.alert('No permission', 'Please enable camera access in settings.');
            return;
        }
        try {
            const result = await ImagePicker.launchCameraAsync({
                quality: 0.8,
                base64: false,
            });
            if (!result.cancelled) {
                // go straight to AnalysisScreen
                navigation.replace('Analysis', { imageUri: result.uri });
            }
        } catch (e) {
            Alert.alert(
                'Camera error',
                'Could not open camera. Try on a real device or check your emulator settings.'
            );
        }
    };

    return (
        <View style={styles.container}>
            <Card style={styles.card}>
                <Card.Content>
                    <Paragraph>Snap a photo of your product’s ingredients label.</Paragraph>
                </Card.Content>
                <Card.Actions>
                    <Button mode="contained" onPress={takePhoto} style={styles.button}>
                        Take Photo
                    </Button>
                </Card.Actions>
            </Card>

            {Platform.OS === 'android' && hasPermission && (
                <Paragraph style={styles.emulatorHint}>
                    No camera on this emulator? Try on a real device or enable the virtual camera.
                </Paragraph>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        justifyContent: 'center',
        backgroundColor: '#f6f6f6',
    },
    card: {
        borderRadius: 8,
        elevation: 4,
    },
    button: {
        flex: 1,
    },
    emulatorHint: {
        textAlign: 'center',
        marginTop: 12,
        color: '#666',
    },
});
