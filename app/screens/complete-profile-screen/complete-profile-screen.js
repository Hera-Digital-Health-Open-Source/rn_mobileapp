import React, { useEffect, useState } from 'react';
import { Text, View, Image, ScrollView, I18nManager, SafeAreaView } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { styles, color, icons, gifLoading } from '../../theme';
import { ToolBar } from '../../components/toolbar';
import { Input } from 'react-native-elements';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { SelectField, Picker } from '../../components/select-field';
import { baseURL, genderOptions } from '../../store/constants';
import DateTimePicker from '@react-native-community/datetimepicker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { dateToString } from '../../utils/helpers';
import { loadString, saveString } from '../../../utils/storage';
import { useTranslation } from "react-i18next";
import Modal from 'react-native-modal';

export const CompleteProfileScreen = ({ navigation }) => {

    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() - 18);

    const textAlign = I18nManager.isRTL ? 'right' : 'left'
    const { t } = useTranslation();

    let translatedGenderOptions = genderOptions.map(function (value) {
        var key = "";
        switch (value) {
            case 'Male':
                key = 'gender_dropdown_male_text';
                break;
            case 'Female':
                key = 'gender_dropdown_female_text';
                break;
        }
        return t(key);
    })

    const [name, setName] = useState('');
    const [gender, setGender] = useState(t('gender_dropdown_female_text'));
    const [dob, setDob] = useState(maxDate);
    const [dobString, setDobString] = useState('');
    const [agreedDateString, setAgreedDateString] = useState('');
    const [isDatePickerVisible, setDatePickerVisible] = useState(false);
    const [nameErrorMessage, setNameErrorMessage] = useState('');
    const [dobErrorMessage, setDOBErrorMessage] = useState('');
    const [termsErrorMessage, setTermsErrorMessage] = useState('');
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [language, setLanguage] = useState('');

    useEffect(() => {
        async function getToken() {
            await loadString('token').then((token) => {
                setToken(token);
            })
        }
        async function loadLanguage() {
            const language = await loadString('language');
            setLanguage(language);
        }
        getToken();
        loadLanguage();
    }, []);

    const createUserProfile = () => {

        if (name.length == 0) {
            setNameErrorMessage(t('complete_profile_screen_error_message_name_required'));
        } else {
            setNameErrorMessage('');
        }

        if (dobString.length == 0) {
            setDOBErrorMessage(t('complete_profile_screen_error_message_dob_required'));
        } else {
            setDOBErrorMessage('');
        }

        if (agreedDateString.length == 0) {
            setTermsErrorMessage(t('complete_profile_screen_error_message_privacy_required'));
        } else {
            setTermsErrorMessage('');
        }

        if (name.length == 0 || dobString.length == 0 || agreedDateString.length == 0) return

        setLoading(true);

        var genderRequest = "";
        if (gender == "Male" || gender.charAt(0) == 'ذ' || gender == "Erkek") {
            genderRequest = "MALE";
        } else {
            genderRequest = "FEMALE";
        }

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token },
            body: JSON.stringify({ name, gender: genderRequest, date_of_birth: dobString, agree_to_terms_at: agreedDateString })
        };
        fetch(baseURL + '/user_profiles/', requestOptions)
            .then(response => {
                setLoading(false);
                if (!response.ok) {
                    throw new Error();
                }
                else return response.json();
            })
            .then(data => {
                setLoading(false);
                updateOnboardingProgresses();
                saveString('onboardingprogress', '1');
                navigation.navigate('yourPregnancy1', { token });
            })
            .catch(e => {
                setLoading(false);
            });
    }

    const updateOnboardingProgresses = () => {

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token },
            body: JSON.stringify({ has_filled_profile: true })
        };

        fetch(baseURL + '/onboarding_progresses/', requestOptions)
            .then(response => {
                if (!response.ok) {
                    throw new Error();
                }
                else return response.json();
            })
            .then(data => {
            })
            .catch(e => {
            });
    }

    function openModal(modal) {
        modal.setModalVisible(true);
    }

    const segmentDatePicker = () => {
        if (Platform.OS == 'android') {
            return (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={dob}
                    mode={'date'}
                    is24Hour={true}
                    display="default"
                    maximumDate={maxDate}
                    onChange={(event, date) => onChangeDob(date)}
                />
            );
        } else if (Platform.OS == 'ios') {
            return (
                <DateTimePickerModal
                    isVisible={true}
                    date={dob}
                    value={dob}
                    mode={'date'}
                    maximumDate={maxDate}
                    onConfirm={onChangeDob}
                    onCancel={() => setDatePickerVisible(false)}
                />
            );
        }
    }

    const onChangeDob = (date) => {
        setDatePickerVisible(false)
        if (date) {
            setDob(date);
            setDobString(dateToString(date));
        }
    }

    const showNameError = () => {
        if (nameErrorMessage.length > 0) {
            return <View style={{ flexDirection: 'row', alignItems: 'center' }}><Image source={icons.error} style={{ marginEnd: 8 }} /><Text style={styles.ERROR_STYLE}>{nameErrorMessage}</Text></View>
        }
    }

    const showDOBError = () => {
        if (dobErrorMessage.length > 0) {
            return <View style={{ flexDirection: 'row', alignItems: 'center' }}><Image source={icons.error} style={{ marginEnd: 8 }} /><Text style={styles.ERROR_STYLE}>{dobErrorMessage}</Text></View>
        }
    }

    const showTermsError = () => {
        if (termsErrorMessage.length > 0) {
            return <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}><Image source={icons.error} style={{ marginEnd: 8 }} /><Text style={styles.ERROR_STYLE}>{termsErrorMessage}</Text></View>
        }
    }

    return (
        <View style={styles.FULL}>
            <SafeAreaView style={styles.SAFE_AREA_VIEW}>
                <ToolBar title={t('complete_profile_screen_toolbar_title')}
                    hide={true} />
            </SafeAreaView>
            <ScrollView style={{ backgroundColor: color.background }}>
                <View style={styles.CONTAINER}>
                    <Input
                        textAlign={textAlign}
                        inputStyle={styles.NOPADMARGIN}
                        containerStyle={styles.NOPADMARGIN}
                        inputContainerStyle={{ borderBottomColor: color.primary }}
                        editable={true}
                        placeholder={t('complete_profile_screen_name_hint')}
                        onChangeText={setName}
                        value={name}
                    />
                    {showNameError()}
                    <View style={{ marginTop: 20 }}>
                        <SelectField
                            onChangeText={setGender}
                            value={gender}
                            onSelect={() => openModal(genderPicker)}
                            mandatory
                        />
                    </View>
                    <View style={{ marginTop: 20 }}>
                        <SelectField
                            onChangeText={setDob}
                            placeholder={t('complete_profile_screen_date_of_birth_hint')}
                            value={dobString ? dobString.split("-").reverse().join("-") : ""}
                            onSelect={() => setDatePickerVisible(true)}
                            mandatory
                        />
                    </View>
                    {showDOBError()}
                    <View style={{ flexDirection: 'row', marginTop: 60 }}>
                        <CheckBox
                            style={{ width: 20, height: 20 }}
                            tintColor={color.primary}
                            onFillColor={color.primary}
                            onTintColor={color.primary}
                            onCheckColor={color.white}
                            animationDuration={0.1}
                            boxType='square'
                            value={false}
                            onValueChange={(newValue) => {
                                if (newValue == true) {
                                    setAgreedDateString((new Date()).toISOString());
                                } else {
                                    setAgreedDateString("");
                                }
                            }}
                        />
                        {language == "English" &&
                            <View style={{ flexWrap: 'wrap', flexDirection: 'row', marginStart: 10 }}>
                                <Text style={[styles.TEXT, { color: "#7E7E7E" }]}>I have read and accept the </Text>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('termsOfUse')}>
                                    <Text style={[styles.TEXT, { color: color.primary, fontWeight: '700' }]}>Terms of Use</Text>
                                </TouchableOpacity>
                                <Text style={[styles.TEXT, { color: "#7E7E7E" }]}> &amp; </Text>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('privacyPolicy')}>
                                    <Text style={[styles.TEXT, { color: color.primary, fontWeight: '700' }]}>Privacy Policy</Text>
                                </TouchableOpacity>
                            </View>
                        }
                        {language == "Arabic" &&
                            <View style={{ flexWrap: 'wrap', flexDirection: 'row', marginStart: 10 }}>
                                <Text style={[styles.TEXT, { color: "#7E7E7E" }]}>لقد قرأت وقبلت </Text>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('termsOfUse')}>
                                    <Text style={[styles.TEXT, { color: color.primary, fontWeight: '700' }]}>شروط الاستخدام</Text>
                                </TouchableOpacity>
                                <Text style={[styles.TEXT, { color: "#7E7E7E" }]}> و </Text>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('privacyPolicy')}>
                                    <Text style={[styles.TEXT, { color: color.primary, fontWeight: '700' }]}>سياسة الخصوصية</Text>
                                </TouchableOpacity>
                            </View>
                        }
                        {language == "Turkish" &&
                            <View style={{ flexWrap: 'wrap', flexDirection: 'row', marginStart: 10 }}>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('termsOfUse')}>
                                    <Text style={[styles.TEXT, { color: color.primary, fontWeight: '700' }]}>Kullanım Koşullarını</Text>
                                </TouchableOpacity>
                                <Text style={[styles.TEXT, { color: "#7E7E7E" }]}> ve </Text>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('privacyPolicy')}>
                                    <Text style={[styles.TEXT, { color: color.primary, fontWeight: '700' }]}>Gizlilik Politikasını </Text>
                                </TouchableOpacity>
                                <Text style={[styles.TEXT, { color: "#7E7E7E" }]}>okudum ve kabul ediyorum</Text>
                            </View>
                        }
                    </View>
                    {showTermsError()}
                    <TouchableOpacity
                        onPress={() => createUserProfile()}
                        style={[styles.BUTTON, { marginTop: 40, marginBottom: 40 }]}>
                        <Text style={styles.BUTTON_TEXT}>{t('complete_profile_screen_continue_button')}</Text>
                    </TouchableOpacity>
                    <Picker
                        ref={(instance) => (genderPicker = instance)}
                        data={translatedGenderOptions}
                        label={'Select Gender'}
                        value={gender}
                        onValueChange={setGender}
                    />
                    {isDatePickerVisible && segmentDatePicker()}
                </View>
            </ScrollView>
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