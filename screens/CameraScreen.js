// screens/CameraScreen.js
import React, { useState, useEffect } from 'react';
import { View, Button, Image, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function CameraScreen({ navigation }) {
    const [uri, setUri] = useState(null);
    const [hasPermission, setHasPermission] = useState(null);

    // Request camera permission once when the screen loads
    useEffect(() => {
        (async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
            if (status !== 'granted') {
                Alert.alert(
                    'Permission required',
                    'Camera access is needed to take product photos.',
                );
            }
        })();
    }, []);

    // Handler to take a photo
    const takePhoto = async () => {
        if (!hasPermission) {
            Alert.alert('No permission', 'Please enable camera access in settings.');
            return;
        }

        try {
            const result = await ImagePicker.launchCameraAsync({
                quality: 0.8,
                base64: false,
            });
            if (!result.cancelled) {
                setUri(result.uri);
            }
        } catch (e) {
            console.error('Error launching camera:', e);
            Alert.alert('Camera error', 'Could not open camera. Try on a real device.');
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Button title="Take Photo of Label" onPress={takePhoto} />
            {uri && (
                <>
                    <Image
                        source={{ uri }}
                        style={{ width: 200, height: 200, margin: 20, borderRadius: 8 }}
                    />
                    <Button
                        title="Analyze Ingredients"
                        onPress={() => navigation.navigate('Analysis', { imageUri: uri })}
                    />
                </>
            )}
            {/* If you’re on an Android emulator without a camera, let them know */}
            {Platform.OS === 'android' && hasPermission && !uri && (
                <Button
                    title="Emulator camera not available"
                    onPress={() =>
                        Alert.alert(
                            'No camera on emulator',
                            'Try scanning on a real device or configure your emulator’s camera.'
                        )
                    }
                />
            )}
        </View>
    );
}
