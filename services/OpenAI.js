import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';

export async function analyzeImageWithOpenAI(imageUrl, profile = {}) {
    let dataUri = imageUrl;
    try {
        const base64 = await FileSystem.readAsStringAsync(imageUrl, {
            encoding: FileSystem.EncodingType.Base64,
        });
        dataUri = `data:image/jpeg;base64,${base64}`;
    } catch (e) {
        // Failed to read local file; fall back to original URL
    }

    const messages = [
        {
            role: 'user',
            content: [
                { type: 'text', text: `User Profile: ${JSON.stringify(profile)}` },
                {
                    type: 'text',
                    text: 'Extract all ingredients from this image, rate safety A–F, flag child/adult concerns, identify dangerous ingredient pairs (synergy×synergy), and suggest one‑tap “Smarter Swap” alternatives.'
                },
                { type: 'image_url', image_url: { url: dataUri } }
            ]
        }
    ];

    const apiKey = Constants.expoConfig?.extra?.openaiApiKey || process.env.OPENAI_API_KEY;

    try {
        const resp = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages,
                max_tokens: 500,
                temperature: 0.2
            })
        });

        const json = await resp.json();
        if (!resp.ok) {
            throw new Error(json.error?.message || json.error || `Request failed with status ${resp.status}`);
        }

        return {
            text: json.choices[0].message.content,
            usage: json.usage
        };
    } catch (err) {
        return { error: err.message };
    }
}
