import React, { useState, useEffect } from 'react';
import { Text, View, Image, I18nManager, SafeAreaView } from 'react-native';
import { styles, color, icons, gifLoading } from '../../theme';
import { ToolBar } from '../../components/toolbar';
import { Input } from 'react-native-elements';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { baseURL } from '../../store/constants';
import { saveString, loadString } from '../../../utils/storage';
import OneSignal from 'react-native-onesignal';
import { useTranslation } from "react-i18next";
import Modal from 'react-native-modal';

export const OTPScreen = ({ navigation }) => {

    const textAlign = I18nManager.isRTL ? 'right' : 'left'
    const { t } = useTranslation();

    const [code, setCode] = useState('');
    const [timerCount, setTimer] = useState(60);
    const [reset, setReset] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const { fullPhoneNumber, countryCode, phoneNumber } = navigation.state.params;

    const attemptChallenge = () => {
        setLoading(true);
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone_number: fullPhoneNumber, secret: code })
        };
        fetch(baseURL + '/otp_auth/attempt_challenge/', requestOptions)
            .then(response => {
                setLoading(false);
                if (!response.ok) {
                    if (response.status == 429) {
                        setErrorMessage("Please try again later.");
                    } else {
                        setErrorMessage(t('otp_screen_incorrect_code_text'));
                    }
                }
                else return response.json();
            })
            .then(data => {
                let externalUserId = fullPhoneNumber; // You will supply the external user id to the OneSignal SDK

                // Setting External User Id with Callback Available in SDK Version 3.9.3+
                OneSignal.setExternalUserId(externalUserId, (results) => {
                    // The results will contain push and email success statuses
                    console.log('Results of setting external user id');
                    console.log(results);

                    // Push can be expected in almost every situation with a success status, but
                    // as a pre-caution its good to verify it exists
                    if (results.push && results.push.success) {
                        console.log('Results of setting external user id push status:');
                        console.log(results.push.success);
                    }

                    // Verify the email is set or check that the results have an email success status
                    if (results.email && results.email.success) {
                        console.log('Results of setting external user id email status:');
                        console.log(results.email.success);
                    }

                    // Verify the number is set or check that the results have an sms success status
                    if (results.sms && results.sms.success) {
                        console.log('Results of setting external user id sms status:');
                        console.log(results.sms.success);
                    }
                });

                saveString('userid', data.user_id.toString());
                saveString('fullphonenumber', fullPhoneNumber);
                saveString('countrycode', countryCode);
                saveString('phonenumber', phoneNumber);
                saveString('token', data.token).then(() => {
                    if (data.user_profile) {
                        getOnboardingProgresses(data.token);
                    } else {
                        navigation.navigate('completeProfile', { token: data.token });
                    }
                });
            })
            .catch(e => {

            });
    }

    const getOnboardingProgresses = (authToken) => {
        loadString('userid').then((userid) => {
            const requestOptions = {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + authToken },
            };
            fetch(baseURL + '/onboarding_progresses/' + userid + "/", requestOptions)
                .then(response => {
                    return response.json();
                })
                .then(data => {
                    if (data.has_filled_children_info == true) {
                        saveString('onboardingprogress', '3');
                        navigation.navigate('home', { token: authToken });
                    } else if (data.has_filled_pregnancy_status == true) {
                        saveString('onboardingprogress', '2');
                        navigation.navigate('childrenInfo', { token: authToken });
                    } else if (data.has_filled_profile == true) {
                        saveString('onboardingprogress', '1');
                        navigation.navigate('yourPregnancy1', { token: authToken });
                    } else {
                        navigation.navigate('completeProfile', { token: authToken });
                    }
                }).catch(e => {
                    navigation.navigate('completeProfile', { token: authToken });
                });
        })
    }

    const showError = () => {
        if (errorMessage.length > 0) {
            return <View style={{ flexDirection: 'row', alignItems: 'center' }}><Image source={icons.error} style={{ marginEnd: 8 }} /><Text style={styles.ERROR_STYLE}>{errorMessage}</Text></View>
        }
    }

    useEffect(() => {
        let interval = setInterval(() => {
            setTimer(lastTimerCount => {
                lastTimerCount <= 1 && clearInterval(interval)
                return lastTimerCount - 1
            })
        }, 1000)
        return () => clearInterval(interval)
    }, [reset]);

    return (
        <View style={styles.FULL}>
            <SafeAreaView style={styles.SAFE_AREA_VIEW}>
                <ToolBar title={t('otp_screen_toolbar_title')}
                    navigation={navigation} />
            </SafeAreaView>
            <View style={styles.CONTAINER}>
                <Text style={styles.TEXT}>{t('otp_screen_enter_code_description')}</Text>
                <Input
                    textAlign={textAlign}
                    style={{ marginTop: 20 }}
                    inputStyle={styles.NOPADMARGIN}
                    containerStyle={styles.NOPADMARGIN}
                    inputContainerStyle={{ borderBottomColor: color.primary }}
                    secureTextEntry={true}
                    keyboardType='number-pad'
                    returnKeyType='done'
                    editable={true}
                    onChangeText={setCode}
                    placeholder={t('otp_screen_code_hint')}
                    secureTextEntr
                    value={code}
                />
                {showError()}
                <TouchableOpacity
                    onPress={() => attemptChallenge()}
                    style={[styles.BUTTON, { marginTop: 20 }]}>
                    <Text style={styles.BUTTON_TEXT}>{t('otp_screen_continue_button')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    disabled={timerCount != 0}
                    onPress={() => {
                        attemptChallenge();
                        setTimer(60);
                        setReset(reset + 1);
                        setErrorMessage('');
                    }}
                    style={timerCount != 0 ? [styles.BUTTON_DISABLED, { marginTop: 20 }] : [styles.BUTTON_ALT, { marginTop: 20 }]}>
                    {timerCount != 0 ?
                        <Text style={styles.BUTTON_TEXT_DISABLED}>{t('otp_screen_resend_otp_button')} ({timerCount}s)</Text> :
                        <Text style={styles.BUTTON_TEXT_ALT}>{t('otp_screen_resend_otp_button')}</Text>
                    }
                </TouchableOpacity>
            </View>
            {loading && <Modal isVisible={true} animationIn='fadeIn' animationOut='fadeOut'>
                <View style={{ justifyContent: 'center', flex: 1 }}>
                    <View style={{ alignSelf: 'center' }}>
                        <Image source={gifLoading} style={{ width: 100, height: 100, borderRadius: 20 }} />
                    </View>
                </View>
            </Modal>}
        </View >
    )
}