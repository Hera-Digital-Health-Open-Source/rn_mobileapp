import React, { useEffect, useState } from 'react';
import { I18nManager, Image, Text, View } from 'react-native';
import { imgFamily, imgLogoSmall, styles, color, icons, gifLoading } from '../../theme';
import { SelectField, Picker } from '../../components/select-field';
import { Input } from 'react-native-elements';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { languageOptions } from '../../store/constants';
import CountryPicker from 'react-native-country-picker-modal'
import { baseURL } from '../../store/constants';
import { useTranslation } from "react-i18next";
import RNRestart from "react-native-restart";
import { loadString, saveString } from '../../../utils/storage';
import { NativeModules, Platform } from 'react-native';
import Modal from 'react-native-modal';

export const LoginScreen = ({ navigation }) => {

    const textAlign = I18nManager.isRTL ? 'right' : 'left'
    const { i18n, t } = useTranslation();

    const [language, setLanguage] = useState('');
    const [acceptLanguage, setAcceptLanguage] = useState('');
    const [countryCode, setCountryCode] = useState('+90');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isCountryPickerVisible, setCountryPickerVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    let translatedLanguageOptions = languageOptions.map(function (value) {
        var key = "";
        switch (value) {
            case 'English':
                key = 'language_dropdown_english_text';
                break;
            case 'Arabic':
                key = 'language_dropdown_arabic_text';
                break;
            case 'Turkish':
                key = 'language_dropdown_turkish_text';
                break;
        }
        return i18n.t(key)
    })

    function openModal(modal) {
        modal.setModalVisible(true);
    }

    const getOTP = () => {

        setLoading(true);

        const fullPhoneNumber = countryCode + phoneNumber;

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept-Language': acceptLanguage },
            body: JSON.stringify({ phone_number: fullPhoneNumber })
        };
        fetch(baseURL + '/otp_auth/request_challenge/', requestOptions)
            .then(response => {
                setLoading(false)
                return response.json()
            })
            .then(data => {
                if (data.detail) {
                    setErrorMessage(data.detail);
                } else {
                    setErrorMessage('');
                    setPhoneNumber('');
                    navigation.navigate('otp', { fullPhoneNumber, countryCode, phoneNumber });
                }
            });
    }

    const showError = () => {
        if (errorMessage.length > 0) {
            return <View style={{ flexDirection: 'row', alignItems: 'center' }}><Image source={icons.error} style={{ marginEnd: 8 }} /><Text style={styles.ERROR_STYLE}>{errorMessage}</Text></View>
        }
    }

    useEffect(() => {
        loadString('language').then((language) => {
            switch (language) {
                case 'English':
                    setLanguage('English');
                    setAcceptLanguage('en');
                    break;
                case 'Arabic':
                    setLanguage('العربية');
                    setAcceptLanguage('ar');
                    break;
                case 'Turkish':
                    setLanguage('Türkçe');
                    setAcceptLanguage('tr');
                    break;
                default:
                    const deviceLanguage =
                        Platform.OS === 'ios'
                            ? NativeModules.SettingsManager.settings.AppleLocale ||
                            NativeModules.SettingsManager.settings.AppleLanguages[0] // iOS 13
                            : NativeModules.I18nManager.localeIdentifier;

                    if (deviceLanguage.startsWith('en')) {
                        setLanguage('English');
                        saveString('language', 'English');
                        setAcceptLanguage('en');
                    } else if (deviceLanguage.startsWith('ar')) {
                        setLanguage('العربية');
                        saveString('language', 'Arabic');
                        setAcceptLanguage('ar');
                    } else if (deviceLanguage.startsWith('tr')) {
                        setLanguage('Türkçe');
                        saveString('language', 'Turkish');
                        setAcceptLanguage('tr');
                    } else {
                        setLanguage('English');
                        saveString('language', 'English');
                        setAcceptLanguage('en');
                    }
            }
        }, [])
    });

    return (
        <View style={styles.FULL}>
            <View style={styles.LOGIN_CONTAINER}>
                <Image source={imgFamily} style={{ alignSelf: 'center' }} />
                <Text style={{ marginTop: 20, fontSize: 16, fontWeight: "700", color: color.primary, alignSelf: 'center', fontFamily: 'Roboto-Regular' }}>{t("login_screen_title")}</Text>
                <View style={{ marginTop: 40 }}>
                    <SelectField
                        placeholder={t("login_screen_select_language_dropdown_hint")}
                        onChangeText={setLanguage}
                        onSelect={() => openModal(languagePicker)}
                        value={language}
                        mandatory
                    />
                </View>
                <View style={{ marginTop: 20, flexDirection: 'row' }}>
                    <View style={{ width: 70 }}>
                        <SelectField
                            onChangeText={this.onChangeCountryCode}
                            onSelect={() => setCountryPickerVisible(true)}
                            value={countryCode}
                            mandatory
                        />
                    </View>
                    <View style={{ flex: 1, marginStart: 15 }}>
                        <Input
                            textAlign={textAlign}
                            inputStyle={styles.NOPADMARGIN}
                            containerStyle={styles.NOPADMARGIN}
                            inputContainerStyle={{ borderBottomColor: color.primary }}
                            editable={true}
                            returnKeyType='done'
                            keyboardType='number-pad'
                            placeholder={t('login_screen_phone_number_hint')}
                            onChangeText={setPhoneNumber}
                            value={phoneNumber}
                        />
                    </View>
                </View>
                {showError()}
                <View style={{ marginTop: 20, flexDirection: 'row' }}>
                    <View style={{ flex: 1 }}>
                        <TouchableOpacity
                            onPress={() => getOTP()}
                            style={styles.BUTTON_ALT}>
                            <Text style={styles.BUTTON_TEXT_ALT}>{t('login_screen_signup_button')}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ width: 20 }}>
                    </View>
                    <View style={{ flex: 1 }}>
                        <TouchableOpacity
                            onPress={() => getOTP()}
                            style={styles.BUTTON}>
                            <Text style={styles.BUTTON_TEXT}>{t('login_screen_login_button')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <Image source={imgLogoSmall} style={{ marginTop: 40, alignSelf: 'center' }} />
                <Picker
                    ref={(instance) => (languagePicker = instance)}
                    data={translatedLanguageOptions}
                    label={t("login_screen_select_language_dropdown_hint")}
                    value={language}
                    onValueChange={value => {
                        var selectedLanguage = '';
                        setLanguage(value);
                        switch (value) {
                            case 'English':
                            case 'الأنكليزية':
                            case 'ingilizce':
                                selectedLanguage = 'English';
                                i18n.changeLanguage("en");
                                I18nManager.forceRTL(false);
                                break;
                            case 'Arabic':
                            case 'العربية':
                            case 'Arapça':
                                selectedLanguage = 'Arabic';
                                i18n.changeLanguage("ar");
                                I18nManager.forceRTL(true);
                                break;
                            case 'Turkish':
                            case 'التركية':
                            case 'Türkçe':
                                selectedLanguage = 'Turkish';
                                i18n.changeLanguage("tr");
                                I18nManager.forceRTL(false);
                                break;
                        }
                        saveString('language', selectedLanguage);
                        RNRestart.Restart();
                    }} />
                {isCountryPickerVisible && <CountryPicker
                    withCallingCode={true}
                    preferredCountries={['TR', 'US']}
                    onSelect={(country) => setCountryCode('+' + country.callingCode[0])}
                    onClose={() => setCountryPickerVisible(false)}
                    withFilter={true}
                    visible
                />}
            </View>
            {loading && <Modal isVisible={true} animationIn='fadeIn' animationOut='fadeOut'>
                <View style={{ justifyContent: 'center', flex: 1 }}>
                    <View style={{ alignSelf: 'center' }}>
                        <Image source={gifLoading} style={{ width: 100, height: 100, borderRadius: 20 }} />
                    </View>
                </View>
            </Modal>}
        </View>
    )
}