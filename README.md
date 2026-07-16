# Frog but(t) strong

Cute butt-first desert rain frog sumo for **iPhone** and **Android**.

Built with Expo + React Three Fiber.

## Play locally

```bash
npm start
```

- Web: open http://127.0.0.1:8081  
- Phone: Expo Go → scan QR  
- Simulator: press `i` (iOS) or `a` (Android)

### Controls
Hold the pad → aim the booty → release to **boop**  
Knock the rival out of the candy-rope dohyo · best of 3

## Ship to App Store & Google Play

### 1. One-time setup
```bash
npm install -g eas-cli
eas login
eas init   # creates a real projectId — paste into app.json extra.eas.projectId
```

### 2. Apple / Google accounts
- **iOS:** Apple Developer Program ($99/yr) + App Store Connect app
- **Android:** Google Play Console ($25 one-time)

### 3. Production builds
```bash
# iOS (needs Apple credentials / Asc API key)
eas build --platform ios --profile production

# Android App Bundle for Play Store
eas build --platform android --profile production

# Internal test APK
eas build --platform android --profile preview
```

### 4. Submit
```bash
eas submit --platform ios --profile production
eas submit --platform android --profile production
```

### Store listing checklist
- [ ] App icon + splash (in `assets/`)
- [ ] 6.7" + 6.5" iPhone screenshots
- [ ] Phone + 7" tablet Android screenshots
- [ ] Privacy policy URL (required even if no accounts)
- [ ] Age rating: usually 4+ / Everyone (cartoon animal comedy)
- [ ] Short description: “Cute rain frogs sumo with their butts.”
- [ ] Replace `ascAppId` in `eas.json` after creating the iOS app

## Project IDs
| Platform | ID |
|----------|-----|
| iOS bundle | `com.frogbuttstrong.game` |
| Android package | `com.frogbuttstrong.game` |
