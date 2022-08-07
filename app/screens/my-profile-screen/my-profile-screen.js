import React, { useEffect, useState } from 'react';
import { Text, View, Image, Modal, StyleSheet, I18nManager, SafeAreaView, ScrollView, RefreshControl } from 'react-native';
import { styles, color, icons, gifLoading } from '../../theme';
import { ToolBar } from '../../components/toolbar';
import { Input } from 'react-native-elements';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { SelectField, Picker } from '../../components/select-field';
import { baseURL, genderOptions } from '../../store/constants';
import DateTimePicker from '@react-native-community/datetimepicker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { dateToString } from '../../utils/helpers';
import { saveString, loadString, save, load } from '../../../utils/storage';
import CountryPicker from 'react-native-country-picker-modal'
import { useTranslation } from "react-i18next";
import Modal2 from 'react-native-modal';

export const MyProfileScreen = ({ navigation }) => {

    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() - 18);

    const textAlign = I18nManager.isRTL ? 'right' : 'left';
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
    const [gender, setGender] = useState('');
    const [dob, setDob] = useState(maxDate);
    const [dobString, setDobString] = useState('');
    const [isDatePickerVisible, setDatePickerVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [token, setToken] = useState('');
    const [userid, setUserid] = useState();
    const [latch, setLatch] = useState(2);
    const [countryCode, setCountryCode] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [fullPhoneNumber, setFullPhoneNumber] = useState('');
    const [isCountryPickerVisible, setCountryPickerVisible] = useState(false);
    const [isChangePhoneNumberModalVisible, setChangePhoneNumberModalVisible] = useState(false);
    const [code, setCode] = useState('');
    const [timerCount, setTimer] = useState(60);
    const [reset, setReset] = useState(0);
    const [changePhoneNumberErrorMessage, setChangePhoneNumberErrorMessage] = useState('');
    const [id, setId] = useState('');
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {

        loadString('token').then((authToken) => {
            setToken(authToken);
        });
        loadString('userid').then((userid) => {
            setUserid(userid);
        });

        loadString('fullphonenumber').then((fullphonenumber) => {
            setFullPhoneNumber(fullphonenumber);
        });

    }, []);

    useEffect(() => {
        setLatch(latch - 1);
    }, [userid]);

    useEffect(() => {
        setLatch(latch - 1);
    }, [token]);

    useEffect(() => {
        if (latch == 0) {
            load("my_profile_response").then((data) => {
                if (data != null) {
                    setName(data.name);
                    if (data.gender == 'MALE') {
                        setGender(t('gender_dropdown_male_text'));
                    } else {
                        setGender(t('gender_dropdown_female_text'));
                    }
                    setDobString(data.date_of_birth);
                } else {
                    getProfile();
                }
            });

            load("my_phone_number_response").then((data) => {
                if (data != null) {
                    setCountryCode("+" + data.phone_country_code);
                    setPhoneNumber(data.phone_national_number);
                } else {
                    getPhoneNumber();
                }
            })
        }
    }, [latch]);

    useEffect(() => {
        let interval = setInterval(() => {
            setTimer(lastTimerCount => {
                lastTimerCount <= 1 && clearInterval(interval)
                return lastTimerCount - 1
            })
        }, 1000)
        return () => clearInterval(interval)
    }, [reset]);

    const getProfile = (refresh) => {
        if (refresh) setRefreshing(true); else setLoading(true);
        const requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token },
        };
        fetch(baseURL + '/user_profiles/' + userid + '/', requestOptions)
            .then(response => {
                if (refresh) setRefreshing(false); else setLoading(false);
                return response.json();
            })
            .then(data => {
                save("my_profile_response", data);
                setName(data.name);
                if (data.gender == 'MALE') {
                    setGender(t('gender_dropdown_male_text'));
                } else {
                    setGender(t('gender_dropdown_female_text'));
                }
                setDobString(data.date_of_birth);
            });
    }


    const getPhoneNumber = () => {
        const requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token },
        };
        fetch(baseURL + '/users/me/', requestOptions)
            .then(response => {
                return response.json();
            })
            .then(data => {
                save("my_phone_number_response", data);
                setCountryCode("+" + data.phone_country_code);
                setPhoneNumber(data.phone_national_number);
            });
    }

    const updateProfile = () => {

        const newFullPhoneNumber = countryCode + phoneNumber;
        if (newFullPhoneNumber != fullPhoneNumber) {
            setChangePhoneNumberModalVisible(true);
            setTimer(60);
            setReset(reset + 1);
            getOTP()
            return;
        }

        setLoading(true);

        var genderRequest = "";
        if (gender == "Male" || gender.charAt(0) == 'ذ' || gender == "Erkek") {
            genderRequest = "MALE";
        } else {
            genderRequest = "FEMALE";
        }

        const requestOptions = {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token },
            body: JSON.stringify({ name, gender: genderRequest, date_of_birth: dobString })
        };
        fetch(baseURL + '/user_profiles/' + userid + '/', requestOptions)
            .then(response => {
                setLoading(false);
                if (!response.ok) {
                    throw new Error();
                }
                return response.json();
            })
            .then(data => {
                save("my_profile_response", data);
                navigation.goBack(null);
            }).catch((e) => {
                setErrorMessage(e);
            });
    }

    const getOTP = () => {
        setLoading(true);
        const newFullPhoneNumber = countryCode + phoneNumber;

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token },
            body: JSON.stringify({ new_phone_number: newFullPhoneNumber })
        };
        fetch(baseURL + '/phone_number_change_requests/', requestOptions)
            .then(response => {
                setLoading(false);
                return response.json();
            })
            .then(data => {
                setId(data.id);
                if (data.detail) {
                    setChangePhoneNumberErrorMessage(data.detail);
                } else {
                    setChangePhoneNumberErrorMessage('');
                }
            }).catch((e) => {
            });
    }

    const resendOTP = () => {
        setLoading(true);
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token }
        };
        fetch(baseURL + '/phone_number_change_requests/' + id + '/resend_otp/', requestOptions)
            .then(response => {
                setLoading(false);
                if (!response.ok) {
                    throw new Error();
                }
                return response.json()
            })
            .then(data => {
            })
            .catch(e => {

            });;
    }

    const attemptChallenge = () => {
        setLoading(true);
        const newFullPhoneNumber = countryCode + phoneNumber;
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token },
            body: JSON.stringify({ guess_secret: code })
        };
        fetch(baseURL + '/phone_number_change_requests/' + id + '/attempt_solve/', requestOptions)
            .then(response => {
                setLoading(false);
                if (!response.ok) {
                    if (response.status == 429) {
                        setChangePhoneNumberErrorMessage(t('too_many_requests_error_message_text'));
                    } else {
                        setChangePhoneNumberErrorMessage(t('otp_screen_incorrect_code_text'));
                    }
                }
                else {
                    saveString('fullphonenumber', newFullPhoneNumber);
                    saveString('countrycode', countryCode);
                    saveString('phonenumber', phoneNumber);
                    setFullPhoneNumber(newFullPhoneNumber);
                    setChangePhoneNumberModalVisible(false);
                }
                return response.json();
            })
            .then(data => {
                save("my_phone_number_response", data);
            })
            .catch(e => {

            });
    }

    useEffect(() => {
        async function getToken() {
            await loadString('token').then((token) => {
                setToken(token);
            })
        }
        getToken();
    }, []);

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
            setDob(date)
            setDobString(dateToString(date))
        }
    }

    const showError = () => {
        if (errorMessage.length > 0) {
            return <View style={{ flexDirection: 'row', alignItems: 'center' }}><Image source={icons.error} style={{ marginEnd: 8 }} /><Text style={styles.ERROR_STYLE}>{errorMessage}</Text></View>
        }
    }

    const showChangePhoneNumberError = () => {
        if (changePhoneNumberErrorMessage.length > 0) {
            return <View style={{ flexDirection: 'row', alignItems: 'center' }}><Image source={icons.error} style={{ marginEnd: 8 }} /><Text style={styles.ERROR_STYLE}>{changePhoneNumberErrorMessage}</Text></View>
        }
    }

    function camelize(str) {
        return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
            return index === 0 ? word.toUpperCase() : word.toLowerCase();
        }).replace(/\s+/g, '');
    }

    return (
        <View style={styles.FULL}>
            <SafeAreaView style={styles.SAFE_AREA_VIEW}>
                <ToolBar title={t('my_profile_screen_toolbar_title')}
                    navigation={navigation}
                    hide={false} />
            </SafeAreaView>
            <ScrollView refreshControl={<RefreshControl
                refreshing={refreshing}
                onRefresh={() => { getProfile(true); getPhoneNumber(); }} />}>
                <View style={styles.CONTAINER}>
                    <Input
                        textAlign={textAlign}
                        inputStyle={styles.NOPADMARGIN}
                        containerStyle={styles.NOPADMARGIN}
                        inputContainerStyle={{ borderBottomColor: color.primary }}
                        editable={true}
                        returnKeyType='done'
                        placeholder={t('my_profile_screen_name_hint')}
                        onChangeText={setName}
                        value={name}
                    />
                    <View style={{ marginTop: 20 }}>
                        <SelectField
                            onChangeText={setGender}
                            value={gender}
                            onSelect={() => openModal(genderPicker)}
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
                                placeholder={t('my_profile_screen_phone_number_hint')}
                                onChangeText={setPhoneNumber}
                                value={phoneNumber}
                            />
                        </View>
                    </View>
                    <View style={{ marginTop: 20 }}>
                        <SelectField
                            onChangeText={setDob}
                            placeholder={t('my_profile_screen_date_of_birth_hint')}
                            value={dobString ? dobString.split("-").reverse().join("-") : ""}
                            onSelect={() => setDatePickerVisible(true)}
                            mandatory
                        />
                    </View>
                    {showError()}
                    <TouchableOpacity
                        onPress={() => updateProfile()}
                        style={[styles.BUTTON, { marginTop: 40 }]}>
                        <Text style={styles.BUTTON_TEXT}>{t('my_profile_screen_update_button')}</Text>
                    </TouchableOpacity>
                    <Picker
                        ref={(instance) => (genderPicker = instance)}
                        data={translatedGenderOptions}
                        label={'Select Gender'}
                        value={gender}
                        onValueChange={setGender}
                    />
                    {isDatePickerVisible && segmentDatePicker()}
                    {isCountryPickerVisible && <CountryPicker
                        withCallingCode={true}
                        preferredCountries={['TR', 'US']}
                        withFilter={true}
                        onSelect={(country) => setCountryCode('+' + country.callingCode[0])}
                        onClose={() => setCountryPickerVisible(false)}
                        visible
                    />}
                    {isChangePhoneNumberModalVisible &&
                        <Modal animationType="fade"
                            transparent={true}
                            onRequestClose={() => {
                                setChangePhoneNumberModalVisible(false);
                            }}>
                            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: 'rgba(0,0,0,0.5)' }}>
                                <TouchableOpacity
                                    style={{ flex: 1, justifyContent: "center", alignItems: "center", }}
                                    onPressOut={() => { setChangePhoneNumberModalVisible(false) }}>
                                    <View style={modalStyles.modalView}>
                                        <Text style={[styles.TEXT, { fontWeight: '700', fontSize: 18, color: color.primary, alignSelf: 'flex-start' }]}>
                                            {t('phone_number_verification_title')}
                                        </Text>
                                        <Text style={[styles.TEXT, { fontSize: 16, marginTop: 16 }]}>
                                            {t('phone_number_verification_description')}
                                        </Text>
                                        <View>
                                            <Input
                                                textAlign={textAlign}
                                                style={{ marginTop: 20 }}
                                                inputStyle={styles.NOPADMARGIN}
                                                containerStyle={styles.NOPADMARGIN}
                                                inputContainerStyle={{ borderBottomColor: color.primary }}
                                                editable={true}
                                                keyboardType='number-pad'
                                                returnKeyType='done'
                                                secureTextEntry={true}
                                                onChangeText={setCode}
                                                placeholder={t('phone_number_verification_enter_otp_hint')}
                                                secureTextEntr
                                                value={code}
                                            />
                                        </View>
                                        {showChangePhoneNumberError()}
                                        <TouchableOpacity
                                            onPress={() => attemptChallenge()}
                                            style={[styles.BUTTON, { marginTop: 20 }]}>
                                            <Text style={styles.BUTTON_TEXT}>{t('phone_number_verification_save_button')}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            disabled={timerCount != 0}
                                            onPress={() => {
                                                resendOTP();
                                                setTimer(60);
                                                setReset(reset + 1);
                                                setChangePhoneNumberErrorMessage('');
                                            }}
                                            style={timerCount != 0 ? [styles.BUTTON_DISABLED, { marginTop: 20 }] : [styles.BUTTON_ALT, { marginTop: 20 }]}>
                                            {timerCount != 0 ?
                                                <Text style={styles.BUTTON_TEXT_DISABLED}>{t('phone_number_verification_resend_otp_button')} ({timerCount}s)</Text> :
                                                <Text style={styles.BUTTON_TEXT_ALT}>{t('phone_number_verification_resend_otp_button')}</Text>
                                            }
                                        </TouchableOpacity>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </Modal>}
                </View>
            </ScrollView>
            {
                loading && <Modal2 isVisible={true} animationIn='fadeIn' animationOut='fadeOut'>
                    <View style={{ justifyContent: 'center', flex: 1 }}>
                        <View style={{ alignSelf: 'center' }}>
                            <Image source={gifLoading} style={{ width: 100, height: 100, borderRadius: 20 }} />
                        </View>
                    </View>
                </Modal2>
            }
        </View >
    )
}

const modalStyles = StyleSheet.create({
    modalView: {
        margin: 10,
        backgroundColor: "white",
        borderRadius: 0,
        padding: 24,
        alignItems: "flex-start",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        alignItems: 'stretch'
    },
})