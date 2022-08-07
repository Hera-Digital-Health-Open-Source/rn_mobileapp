import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import Navigation from './app/navigation/createNavigator';
import configureStore from './store/configureStore';
import OneSignal from 'react-native-onesignal';
import { oneSignalAppId } from './app/store/constants';
import "./i18n.config";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { loadString } from './utils/storage';
import { NativeModules, Platform } from 'react-native';

//OneSignal Init Code
OneSignal.setLogLevel(6, 0);
OneSignal.setAppId(oneSignalAppId);
//END OneSignal Init Code

//Prompt for push on iOS
OneSignal.promptForPushNotificationsWithUserResponse(response => {
  console.log("Prompt response:", response);
});

//Method for handling notifications received while app in foreground
OneSignal.setNotificationWillShowInForegroundHandler(notificationReceivedEvent => {
  console.log("OneSignal: notification will show in foreground:", notificationReceivedEvent);
  let notification = notificationReceivedEvent.getNotification();
  console.log("notification: ", notification);
  const data = notification.additionalData
  console.log("additionalData: ", data);
  // Complete with null means don't show a notification.
  notificationReceivedEvent.complete(notification);
});

//Method for handling notifications opened
OneSignal.setNotificationOpenedHandler(notification => {
  console.log("OneSignal: notification opened:", notification);
});

const store = configureStore();

const App = () => {

  useEffect(() => {

    loadString('language').then((language) => {
      var lng = 'en'
      switch (language) {
        case 'English':
          lng = 'en';
          break;
        case 'Arabic':
          lng = 'ar';
          break;
        case 'Turkish':
          lng = 'tr';
          break;
        default:
          const deviceLanguage =
            Platform.OS === 'ios'
              ? NativeModules.SettingsManager.settings.AppleLocale ||
              NativeModules.SettingsManager.settings.AppleLanguages[0] // iOS 13
              : NativeModules.I18nManager.localeIdentifier;

          if (deviceLanguage.startsWith('en')) {
            lng = 'en';
          } else if (deviceLanguage.startsWith('ar')) {
            lng = 'ar';
          } else if (deviceLanguage.startsWith('tr')) {
            lng = 'tr';
          }
      }

      i18n
        .use(initReactI18next)
        .init({
          lng: lng,
          fallbackLng: "en",
          interpolation: {
            escapeValue: false
          }
        });

    });
  }, []);

  return (
    <Provider store={store}>
      <Navigation />
    </Provider>
  );
};

export default App;