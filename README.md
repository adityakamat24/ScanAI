# FoodGuardApp

FoodGuard is a React Native application built with Expo. It lets you scan product labels and provides a food safety analysis.

## Getting Started

Install dependencies and start the Expo development server:

```bash
npm install
npm start
```

This will open the Expo developer tools in your browser where you can launch the app on an emulator or physical device.

## Key Screens

All major screens are located in the `screens/` directory:

- **CameraScreen** – capture a photo of the product label to start an analysis.
- **AnalysisScreen** – displays the rating, warnings and suggestions after scanning.
- **DashboardScreen** – shows a history of your previous scans.
- **ProfileListScreen** – select the active profile used for analyses.
- **CreateProfileScreen** – add new user profiles.

Use the drawer menu in the app to navigate between the scanner and profile sections.
