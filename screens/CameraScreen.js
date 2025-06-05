import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Alert, StyleSheet, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Card, Button, Paragraph, useTheme } from 'react-native-paper';

export default function CameraScreen({ navigation }) {
    const { colors } = useTheme();
    const [hasPermission, setHasPermission] = useState(null);

    useEffect(() => {
        (async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
            if (status !== 'granted') Alert.alert('Permission required', 'Camera access is needed.');
        })();
    }, []);

    const takePhoto = async () => {
        if (!hasPermission) return Alert.alert('No permission', 'Allow camera in settings.');
        try {
            const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
            if (!result.canceled) navigation.replace('Analysis', { imageUri: result.uri });
        } catch {
            Alert.alert('Error', 'Cannot open camera.');
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.content}>
                <Card style={[styles.card, { backgroundColor: colors.surface }]} elevation={4}>
                    <Card.Content>
                        <Paragraph style={{ textAlign: 'center', color: colors.onBackground }}>
                            Snap a clear photo of the product label.
                        </Paragraph>
                    </Card.Content>
                    <Card.Actions style={styles.actions}>
                        <Button
                            mode="contained"
                            onPress={takePhoto}
                            style={{ backgroundColor: colors.accent }}
                        >
                            Take Photo
                        </Button>
                    </Card.Actions>
                </Card>
                {Platform.OS === 'android' && hasPermission && (
                    <Paragraph style={styles.hint}>No camera on emulator? Use a real device.</Paragraph>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, justifyContent: 'center', padding: 16 },
    card: { borderRadius: 12 },
    actions: { justifyContent: 'center', padding: 16 },
    hint: { textAlign: 'center', marginTop: 16, color: '#888' },
});