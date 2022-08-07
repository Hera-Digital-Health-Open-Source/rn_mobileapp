import React from 'react';
import Heap from '@heap/react-native-heap';
import { createStackNavigator } from 'react-navigation-stack';
import { createSwitchNavigator, createAppContainer } from 'react-navigation';
import NavigationService from './navigationService';
import { SplashScreen } from '../screens/splash-screen';
import { LoginScreen } from '../screens/login-screen';
import { OTPScreen } from '../screens/otp-screen';
import { HomeScreen } from '../screens/home-screen';
import { CompleteProfileScreen } from '../screens/complete-profile-screen';
import { TermsOfUseScreen } from '../screens/terms-of-use-screen';
import { PrivacyPolicyScreen } from '../screens/privacy-policy-screen';
import { YourPregnancyScreen1 } from '../screens/your-pregnancy-screens/your-pregnancy-screen-1';
import { YourPregnancyScreen2 } from '../screens/your-pregnancy-screens/your-pregnancy-screen-2';
import { YourPregnancyScreen3 } from '../screens/your-pregnancy-screens/your-pregnancy-screen-3';
import { ChildrenInfoScreen } from '../screens/children-info-screens/children-info-screen';
import { AddAChildScreen } from '../screens/children-info-screens/add-a-child-screen';
import { ChildInfoScreen } from '../screens/children-info-screens/child-info-screen';
import { SettingsScreen } from '../screens/settings-screen';
import { MyProfileScreen } from '../screens/my-profile-screen';
import { MyPregnancyScreen } from '../screens/my-pregnancy-screen';
import { MyChildrenInfoScreen } from '../screens/my-children-info-screens/my-children-info-screen';
import { MyChildInfoScreen } from '../screens/my-children-info-screens/my-child-info-screen';
import { MyAddAChildScreen } from '../screens/my-children-info-screens/my-add-a-child-screen';
import { MyAppointmentsScreen } from '../screens/my-appointments-screen';
import { NearbyHealthCentersScreen } from '../screens/nearby-health-centers-screen';
import { HealthRecordsScreen } from '../screens/health-records-screens/health-records-screen';
import { FAQScreen } from '../screens/faq-screen';
import { ContactUsScreen } from '../screens/contact-us-screen';
import { HeraWebsiteScreen } from '../screens/hera-website-screen';
import { UserAgreementScreen } from '../screens/user-agreement-screen';
import { KVKKScreen } from '../screens/kvkk-screen';
import { BlogScreen } from '../screens/blog-screen';
import { EditHealthRecordsScreen } from '../screens/health-records-screens/edit-health-records-screen';
import { SaveMedicalReportScreen } from '../screens/health-records-screens/save-medical-report-screen';
import { NotificationsScreen } from '../screens/notifications-screen';

const LoadingNavigator = createStackNavigator(
    {
        loading: { screen: SplashScreen }
    },
    {
        headerMode: 'none',
    },
);

const AuthNavigator = createStackNavigator(
    {
        login: { screen: LoginScreen },
        otp: { screen: OTPScreen },
    },
    {
        headerMode: 'none',
    },
);

const CompleteProfileNavigator = createStackNavigator(
    {
        completeProfile: { screen: CompleteProfileScreen },
        termsOfUse: { screen: TermsOfUseScreen },
        privacyPolicy: { screen: PrivacyPolicyScreen }
    },
    {
        headerMode: 'none',
    },
)

const PregnancyAndChildrenNavigator = createStackNavigator(
    {
        yourPregnancy1: { screen: YourPregnancyScreen1 },
        yourPregnancy2: { screen: YourPregnancyScreen2 },
        yourPregnancy3: { screen: YourPregnancyScreen3 },
        childrenInfo: { screen: ChildrenInfoScreen },
        addAChild: {screen: AddAChildScreen },
        childInfo: {screen: ChildInfoScreen }
    },
    {
        headerMode: 'none',
    },
)

const MainNavigator = createStackNavigator(
    {
        home: { screen: HomeScreen },
        settings: { screen: SettingsScreen },
        myProfile: { screen: MyProfileScreen },
        myPregnancy: { screen: MyPregnancyScreen },
        myChildrenInfo: { screen: MyChildrenInfoScreen },
        myChildInfo: { screen: MyChildInfoScreen },
        myAddAChild: { screen: MyAddAChildScreen },
        myAppointments: { screen: MyAppointmentsScreen },
        nearbyHealthCenters: { screen: NearbyHealthCentersScreen },
        blog: { screen: BlogScreen },
        healthRecords: { screen: HealthRecordsScreen },
        faq: { screen: FAQScreen },
        contactUs: { screen: ContactUsScreen },
        heraWebsite: { screen: HeraWebsiteScreen },
        userAgreement: { screen: UserAgreementScreen },
        kvkk: { screen: KVKKScreen },
        editHealthRecords: { screen: EditHealthRecordsScreen },
        saveMedicalReport: { screen: SaveMedicalReportScreen },
        notifications: { screen: NotificationsScreen }
    },
    {
        headerMode: 'none',
    },
);

const rootStack = createSwitchNavigator(
    {
        loading: LoadingNavigator,
        auth: AuthNavigator,
        main: MainNavigator,
        completeProfile: CompleteProfileNavigator,
        pregnancyAndChildren: PregnancyAndChildrenNavigator 
    },
    {
        headerMode: 'none',
        initialRouteName: 'loading',
        navigationOptions: { gesturesEnabled: false },
    },
);

const AppNavigator = createAppContainer(rootStack);
Heap.withReactNavigationAutotrack(createAppContainer(AppNavigator));
const Navigation = () => (
    <AppNavigator
        enableURLHandling={false}
        ref={(navigatorRef) => {
            NavigationService.setTopLevelNavigator(navigatorRef);
        }}
    />
);
export default Navigation;
