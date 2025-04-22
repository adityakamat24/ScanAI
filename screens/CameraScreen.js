// screens/CameraScreen.js
import React, { useState, useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Card, Button, Paragraph } from 'react-native-paper';

export default function CameraScreen({ navigation }) {
    const [uri, setUri] = useState(null);
    const [hasPermission, setHasPermission] = useState(null);

    useEffect(() => {
        (async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
            if (status !== 'granted') {
                Alert.alert('Permission required', 'Camera access is needed to take product photos.');
            }
        })();
    }, []);

    const takePhoto = async () => {
        if (!hasPermission) {
            Alert.alert('No permission', 'Please enable camera access in settings.');
            return;
        }
        try {
            const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
            if (!result.cancelled) setUri(result.uri);
        } catch (e) {
            Alert.alert('Camera error', 'Could not open camera. Try on a real device.');
        }
    };

    return (
        <Card style={{ margin: 16, borderRadius: 8, elevation: 4 }}>
            <Card.Content>
                <Paragraph>Snap a photo of your product’s ingredients label.</Paragraph>
            </Card.Content>

            {uri && (
                <Card.Cover
                    source={{ uri }}
                    style={{ marginHorizontal: 16, marginBottom: 16, borderRadius: 8 }}
                />
            )}

            <Card.Actions style={{ justifyContent: 'space-between', paddingHorizontal: 16 }}>
                <Button mode="outlined" onPress={takePhoto}>
                    Take Photo
                </Button>
                {uri && (
                    <Button mode="contained" onPress={() => navigation.navigate('Analysis', { imageUri: uri })}>
                        Analyze
                    </Button>
                )}
            </Card.Actions>

            {Platform.OS === 'android' && hasPermission && !uri && (
                <Card.Actions>
                    <Paragraph style={{ paddingHorizontal: 16 }}>
                        No camera on emulator—use a real device or configure the emulator’s camera.
                    </Paragraph>
                </Card.Actions>
            )}
        </Card>
    );
}
