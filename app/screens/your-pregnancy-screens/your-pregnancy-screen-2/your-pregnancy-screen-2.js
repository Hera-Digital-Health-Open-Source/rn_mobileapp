import React, { useState, useEffect } from 'react';
import { styles, icons, gifLoading, color } from '../../../theme';
import { ToolBar } from '../../../components/toolbar';
import { View, Text, TouchableOpacity, Image, SafeAreaView, ScrollView } from 'react-native';
import { SelectField, Picker } from '../../../components/select-field';
import DateTimePicker from '@react-native-community/datetimepicker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { dateToString } from '../../../utils/helpers';
import { baseURL, pregnancyWeekOptions, prenatalVisitsOptions } from '../../../store/constants';
import { loadString } from '../../../../utils/storage';
import { useTranslation } from "react-i18next";
import Modal from 'react-native-modal';

export const YourPregnancyScreen2 = ({ navigation }) => {

    const { t } = useTranslation();

    const [isDatePickerVisible, setDatePickerVisible] = useState(false);
    const [lastMenstrualPeriod, setLastMenstrualPeriod] = useState(new Date());
    const [lastMenstrualPeriodString, setLastMenstrualPeriodString] = useState('');
    const [pregnancyWeek, setPregnancyWeek] = useState('');
    const [prenatalVisits, setPrenatalVisits] = useState('0');
    const [errorMessage, setErrorMessage] = useState('');
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function getToken() {
            const authToken = await loadString('token')
            setToken(authToken);
        }
        getToken();
    }, []);

    const createPregnancy = () => {

        if (lastMenstrualPeriodString == '' && pregnancyWeek == '') {
            setErrorMessage(t('my_pregnancy_screen_error_message_menstrual'));
            return;
        }


        if (lastMenstrualPeriodString != '' && pregnancyWeek != '') {
            setLastMenstrualPeriod(new Date());
            setLastMenstrualPeriodString('');
            setPregnancyWeek('');
            setErrorMessage(t('pregnancy_pregnancy_week_or_last_menstrual_date_error_message'));
            return;
        }

        setLoading(true);

        const pregnancyWeekRequest = pregnancyWeek == '' ? null : pregnancyWeek;
        const lastMenstrualPeriodStringRequest = lastMenstrualPeriodString == '' ? null : lastMenstrualPeriodString;
        
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token },
            body: JSON.stringify({ declared_pregnancy_week: pregnancyWeekRequest, declared_date_of_last_menstrual_period: lastMenstrualPeriodStringRequest, declared_number_of_prenatal_visits: prenatalVisits })
        };

        fetch(baseURL + '/pregnancies/', requestOptions)
            .then(response => {
                console.log(JSON.stringify(response));
                setLoading(false);
                if (!response.ok) {
                    throw new Error();
                }
                else return response.json();
            })
            .then(data => {
                navigation.navigate('yourPregnancy3');
            })
            .catch(e => {
            });
    }

    function openModal(modal) {
        modal.setModalVisible(true);
    }

    const segmentDatePicker = () => {
        var minimumDate = new Date();
        minimumDate.setDate(minimumDate.getDate() - 294);

        if (Platform.OS == 'android') {
            return (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={lastMenstrualPeriod}
                    mode={'date'}
                    is24Hour={true}
                    display="default"
                    maximumDate={new Date()}
                    minimumDate={minimumDate}
                    onChange={(event, date) => onChangeLastMenstrualPeriod(date)}
                />
            );
        } else if (Platform.OS == 'ios') {
            return (
                <DateTimePickerModal
                    isVisible={true}
                    date={lastMenstrualPeriod}
                    value={lastMenstrualPeriod}
                    mode={'date'}
                    maximumDate={new Date()}
                    minimumDate={minimumDate}
                    onConfirm={onChangeLastMenstrualPeriod}
                    onCancel={() => setDatePickerVisible(false)}
                />
            );
        }
    }

    const onChangeLastMenstrualPeriod = (date) => {
        setDatePickerVisible(false)
        if (date) {
            setLastMenstrualPeriod(date)
            setLastMenstrualPeriodString(dateToString(date))
        }
    }

    const showError = () => {
        if (errorMessage.length > 0) {
            return <View style={{ flexDirection: 'row', alignItems: 'center' }}><Image source={icons.error} style={{ marginEnd: 8 }} /><Text style={styles.ERROR_STYLE}>{errorMessage}</Text></View>
        }
    }

    return (
        <View style={styles.FULL}>
            <SafeAreaView style={styles.SAFE_AREA_VIEW}>
                <ToolBar title={t('your_pregnancy_screen_toolbar_title')}
                    navigation={navigation} />
            </SafeAreaView>
            <ScrollView style={{
                backgroundColor: color.background,
                flex: 1,
                paddingVertical: 32
            }} >
                <View style={{ paddingHorizontal: 16 }}>
                    <Text style={styles.TEXT}>
                        {t('your_pregnancy_screen_description_1')}
                    </Text>
                    <Text style={[styles.TEXT, { marginTop: 20 }]}>
                        {t('your_pregnancy_screen_description_2')}
                    </Text>
                    <Text style={[styles.TEXT, { marginTop: 40, fontWeight: '700' }]}>
                        {t('your_pregnancy_screen_menstrual_title')}
                    </Text>
                    <View style={{ marginTop: 10 }}>
                        <SelectField
                            onChangeText={this.onChangeLanguage}
                            value={lastMenstrualPeriodString ? lastMenstrualPeriodString.split("-").reverse().join("-") : ""}
                            onSelect={() => setDatePickerVisible(true)}
                            mandatory
                        />
                    </View>
                    <Text style={[styles.TEXT, { marginTop: 20, fontWeight: '700' }]}>
                        {t('your_pregnancy_screen_pregnancy_week_title')}
                    </Text>
                    <View style={{ marginTop: 10, width: 150 }}>
                        <SelectField
                            value={pregnancyWeek}
                            onSelect={() => openModal(pregnancyWeekPicker)}
                            mandatory
                        />
                    </View>
                    <Text style={[styles.TEXT, { marginTop: 20, fontWeight: '700' }]}>
                        {t('your_pregnancy_screen_prenatal_visits_title')}
                    </Text>
                    <View style={{ marginTop: 10, width: 150 }}>
                        <SelectField
                            value={prenatalVisits}
                            onSelect={() => openModal(prenatalVisitsPicker)}
                            mandatory
                        />
                    </View>
                    {showError()}
                    <View style={{ flex: 1, marginTop: 20, marginBottom: 48 }}>
                        <TouchableOpacity
                            onPress={() => createPregnancy()}
                            style={styles.BUTTON}>
                            <Text style={styles.BUTTON_TEXT}>{t('your_pregnancy_screen_submit_button')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
            {loading && <Modal isVisible={true} animationIn='fadeIn' animationOut='fadeOut'>
                <View style={{ justifyContent: 'center', flex: 1 }}>
                    <View style={{ alignSelf: 'center' }}>
                        <Image source={gifLoading} style={{ width: 100, height: 100, borderRadius: 20 }} />
                    </View>
                </View>
            </Modal>}
            {isDatePickerVisible && segmentDatePicker()}
            <Picker
                ref={(instance) => (pregnancyWeekPicker = instance)}
                data={pregnancyWeekOptions}
                label={'None'}
                value={pregnancyWeek}
                onValueChange={setPregnancyWeek}
            />
            <Picker
                ref={(instance) => (prenatalVisitsPicker = instance)}
                data={prenatalVisitsOptions}
                label={'None'}
                value={prenatalVisits}
                onValueChange={setPrenatalVisits}
            />
        </View>
    )
}