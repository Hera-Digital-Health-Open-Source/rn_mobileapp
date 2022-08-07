export const languageOptions = ['English', 'Arabic', 'Turkish'];
export const genderOptions = ['Male', 'Female'];
export const pregnancyWeekOptions = Array.from(
  { length: 42 },
  (_, i) => (i + 1).toString());

export const prenatalVisitsOptions = [...Array(10).keys()].map(String);
// export const baseURL = "http://127.0s.0.1:8000";
export const baseURL = {REPLACE WITH BASE URL OF YOUR API SERVERS};
// Home screen constants
export const keyAppointments = 'appointments';
export const keyPregnancy = 'pregnancy';
export const keyHealthRecords = 'healthrecords';
export const keyChildren = 'children';
export const keyHealthCenters = 'healthcenters';
export const keyEmergencyCall = 'emergencycall';
export const keyHealthTipsNews = 'healthtipsnews';
export const keySettings = 'settings';
export const keyFacebook = 'facebook';
// Settings screen constants
export const keyEditProfile = 'editprofile';
export const keyContactUs = 'contactus';
export const keyVisitHeraWeb = 'visitheraweb';
export const keyFAQ = 'faq';
export const keyUserAgreement = 'useragreement';
export const keyKVKK = 'kvkk';
export const keyChangeLanguage = 'changelanguage';
export const oneSignalAppId = {REPLACE WITH ONE SIGNAL APP ID};
