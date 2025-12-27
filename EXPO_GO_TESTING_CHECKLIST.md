# 📱 EXPO GO TESTING CHECKLIST - iOS LAUNCH
# Test these critical features in Expo Go before launch

## ✅ CORE APP FLOW TESTING
- [ ] User registration/login with Clerk
- [ ] Profile creation and preferences setup
- [ ] Schedule generation workflow (all 6 steps)
- [ ] Schedule viewing and navigation
- [ ] Task/block completion marking
- [ ] Settings and preferences changes
- [ ] Account management features

## ✅ BACKEND INTEGRATION TESTING
- [ ] User authentication syncs to backend
- [ ] Schedules save to production database
- [ ] Schedule retrieval from backend works
- [ ] Preferences sync between frontend/backend
- [ ] Error handling for network issues
- [ ] Offline behavior (graceful degradation)

## ✅ USER EXPERIENCE TESTING
- [ ] App performance on different screen sizes
- [ ] Dark/light theme switching
- [ ] Navigation feels smooth
- [ ] Loading states work properly
- [ ] Form validation works correctly
- [ ] Error messages are user-friendly

## ✅ CRITICAL EDGE CASES
- [ ] No internet connection behavior
- [ ] Server errors (backend down)
- [ ] Invalid user data handling
- [ ] Long schedule generation times
- [ ] Large number of tasks/blocks
- [ ] Date edge cases (year transitions, etc.)

## 🎯 EXPO GO TESTING COMMAND
```bash
# In frontend directory:
npx expo start

# Then scan QR code with Expo Go app on iPhone
# Test all features above thoroughly
```

## ⚠️ WHAT YOU CAN'T TEST (but likely don't need for launch)
- Apple Sign-In (you have email/Google auth)
- Push notifications (you confirmed they work)
- App icon/splash screen exact behavior
- Performance on older devices (can test later)
- Deep linking to external apps

## 🎯 LAUNCH READINESS CRITERIA
If these work in Expo Go, your app is ready:
✅ Users can register and login
✅ Users can create and view schedules  
✅ Backend integration works seamlessly
✅ No critical bugs or crashes
✅ UI/UX feels polished
