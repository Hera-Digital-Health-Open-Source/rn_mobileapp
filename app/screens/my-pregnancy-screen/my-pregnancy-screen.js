import React, { useState, useEffect } from 'react';
import { styles, icons, color } from '../../theme';
import { ToolBar } from '../../components/toolbar';
import { View, Text, TouchableOpacity, Image, SafeAreaView, ScrollView, RefreshControl } from 'react-native';
import { SelectField, Picker } from '../../components/select-field';
import DateTimePicker from '@react-native-community/datetimepicker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { dateToString } from '../../utils/helpers';
import { baseURL, pregnancyWeekOptions, prenatalVisitsOptions } from '../../store/constants';
import { loadString, save, load } from '../../../utils/storage';
import { useTranslation } from "react-i18next";
import { gifLoading } from '../../theme';
import Modal from 'react-native-modal';

export const MyPregnancyScreen = ({ navigation }) => {

    const { t } = useTranslation();

    const [isDatePickerVisible, setDatePickerVisible] = useState(false);
    const [lastMenstrualPeriod, setLastMenstrualPeriod] = useState(new Date());
    const [lastMenstrualPeriodString, setLastMenstrualPeriodString] = useState('');
    const [pregnancyWeek, setPregnancyWeek] = useState('');
    const [prenatalVisits, setPrenatalVisits] = useState('0');
    const [errorMessage, setErrorMessage] = useState('');
    const [token, setToken] = useState();
    const [pregnancyData, setPregnancyData] = useState();
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        async function getToken() {
            const authToken = await loadString('token')
            setToken(authToken);
        }
        getToken();
    }, []);

    useEffect(() => {
        load("my_pregnancy_response").then((data) => {
            if (data != null) {
                setPregnancyData(data);
                if (data.declared_date_of_last_menstrual_period != null) setLastMenstrualPeriodString(data.declared_date_of_last_menstrual_period);
                if (data.declared_pregnancy_week != null) setPregnancyWeek(data.declared_pregnancy_week.toString());
                if (data.declared_number_of_prenatal_visits != null) setPrenatalVisits(data.declared_number_of_prenatal_visits.toString());
            } else {
                getPregnancy();
            }
        });
    }, [token])

    const updatePregnancy = () => {

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

        const method = pregnancyData ? 'PATCH' : 'POST';
        const url = pregnancyData ? baseURL + '/pregnancies/' + pregnancyData.id + '/' : baseURL + '/pregnancies/';

        const pregnancyWeekRequest = pregnancyWeek == '' ? null : pregnancyWeek;
        const lastMenstrualPeriodStringRequest = lastMenstrualPeriodString == '' ? null : lastMenstrualPeriodString;

        const requestOptions = {
            method: method,
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token },
            body: JSON.stringify({ declared_pregnancy_week: pregnancyWeekRequest, declared_date_of_last_menstrual_period: lastMenstrualPeriodStringRequest, declared_number_of_prenatal_visits: prenatalVisits })
        };

        fetch(url, requestOptions)
            .then(response => {
                setLoading(false);
                if (!response.ok) {
                    throw new Error();
                }
                else return response.json();
            })
            .then(data => {
                save("my_pregnancy_response", data);
                save("my_appointments_need_refetch", true);
                navigation.navigate('home');
            })
            .catch(e => {

            });
    }

    const getPregnancy = (isRefreshing) => {

        if (token == null) {
            return
        }

        if (isRefreshing) setRefreshing(true); else setLoading(true);

        const requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token }
        };
        fetch(baseURL + '/pregnancies/', requestOptions)
            .then(response => {
                if (isRefreshing) setRefreshing(false); else setLoading(false);
                if (!response.ok) {
                    throw new Error();
                }
                else return response.json();
            })
            .then(data => {
                if (data.length > 0) {
                    save("my_pregnancy_response", data[0]);
                    setPregnancyData(data[0]);
                    setLastMenstrualPeriodString(data[0].declared_date_of_last_menstrual_period);
                    setPregnancyWeek(data[0].declared_pregnancy_week.toString());
                    setPrenatalVisits(data[0].declared_number_of_prenatal_visits.toString());
                }
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
                <ToolBar title={t('my_pregnancy_screen_toolbar_title')}
                    navigation={navigation} />
            </SafeAreaView>
            <ScrollView style={{
                backgroundColor: color.background,
                flex: 1,
                paddingVertical: 32
            }} refreshControl={<RefreshControl
                refreshing={refreshing}
                onRefresh={() => { getPregnancy(true); }} />}>
                <View style={{ paddingHorizontal: 16 }}>
                    {pregnancyData &&
                        <View style={{ marginBottom: 40 }}>
                            <Text style={styles.TEXT}>
                                {t('my_pregnancy_screen_description_text')}
                            </Text>
                            <View style={{ marginTop: 20 }}>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate("myAppointments")}
                                    style={styles.BUTTON}>
                                    <Text style={styles.BUTTON_TEXT}>{t('my_pregnancy_screen_go_to_appointments_button')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    }
                    <Text style={[styles.TEXT, { fontWeight: '700' }]}>
                        {t('my_pregnancy_screen_menstrual_title')}
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
                        {t('my_pregnancy_screen_pregnancy_week_title')}
                    </Text>
                    <View style={{ marginTop: 10, width: 150 }}>
                        <SelectField
                            value={pregnancyWeek}
                            onSelect={() => openModal(pregnancyWeekPicker)}
                            mandatory
                        />
                    </View>
                    <Text style={[styles.TEXT, { marginTop: 20, fontWeight: '700' }]}>
                        {t('my_pregnancy_screen_prenatal_visits_title')}
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
                            onPress={() => updatePregnancy()}
                            style={styles.BUTTON}>
                            <Text style={styles.BUTTON_TEXT}>{t('my_pregnancy_screen_submit_button')}</Text>
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