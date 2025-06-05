# FoodGuardApp

FoodGuard is a React Native application built with Expo. It lets you scan product labels and provides a food safety analysis.

## Getting Started

Install dependencies:

```bash
npm install
```

Next, provide your OpenAI API key. You can either export it as an environment variable or add it under the `expo.extra` section of `app.json`:

```json
"extra": {
  "openaiApiKey": "YOUR_KEY"
}
```

Once the key is set, start the Expo development server:

```bash
npm start
```

This opens the Expo developer tools in your browser where you can launch the app on an emulator or physical device.

## Key Screens

All major screens are located in the `screens/` directory:

- **CameraScreen** – capture a photo of the product label to start an analysis.
- **AnalysisScreen** – displays the rating, warnings and suggestions after scanning.
- **DashboardScreen** – shows a history of your previous scans.
- **ProfileListScreen** – select the active profile used for analyses.
- **CreateProfileScreen** – add new user profiles.

Use the drawer menu in the app to navigate between the scanner and profile sections.
