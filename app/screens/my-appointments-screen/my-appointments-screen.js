import React, { useState, useEffect, useCallback } from 'react';
import { color, styles } from '../../theme';
import { ToolBar } from '../../components/toolbar';
import { View, TouchableOpacity, Text, ScrollView, Image, SafeAreaView, RefreshControl, I18nManager } from 'react-native';
import { CalendarList } from 'react-native-calendars';
import { load, loadString, save, saveString } from '../../../utils/storage';
import { baseURL } from '../../store/constants';
import { useTranslation } from "react-i18next";
import { gifLoading } from '../../theme';
import Modal from 'react-native-modal';
import { TabsNavigator } from '../../components/tabs-navigator';

import { formatWithOptions } from 'date-fns/fp';

import { LoadingModal } from '../../components/LoadingModal';

import { languageSwitcher } from '../../../utils/helpers';

import style from './style';

export const MyAppointmentsScreen = ({ navigation }) => {

    var currentDate = navigation.state.params ? navigation.state.params.date : null;

    const { t } = useTranslation();

    const d = new Date();
    var todayString = currentDate != null ? currentDate : d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
    var markedDatesObj = { [todayString]: { selected: true, selectedColor: color.primary } };

    const [token, setToken] = useState('');
    const [markedDates, setMarkedDates] = useState({});
    const [appointments, setAppointments] = useState([]);
    const [selectedDate, setSelectedDate] = useState(todayString);
    const [language, setLanguage] = useState('');
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        async function getLanguage() {
            const language = await loadString('language');
            setLanguage(language);
        }
        getLanguage();
    }, []);

    const getAppointments = (authToken, isRefresh) => {

        if (isRefresh) setRefreshing(true); else setLoading(true);

        const requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + authToken },
        };
        fetch(baseURL + '/calendar_events/', requestOptions)
            .then(response => {
                if (isRefresh) setRefreshing(false); else setLoading(false);
                return response.json();
            })
            .then(data => {
                for (var i = 0; i < data.length; i++) {
                    const appt = String(data[i].date);
                    markedDatesObj[appt] = {
                        marked: true,
                        dotColor: color.primary,
                        customStyles: {
                            text: {
                                fontWeight: 'bold'
                            }
                        }
                    };
                }
                markDates(data);
                setAppointments(data);
                save("my_appointments_response", data);
                save("my_appointments_need_refetch", false);
            });
    }

    const markDates = (data) => {
        for (var i = 0; i < data.length; i++) {
            const appt = String(data[i].date);
            markedDatesObj[appt] = {
                marked: true,
                dotColor: color.primary,
                customStyles: {
                    text: {
                        fontWeight: 'bold'
                    }
                }
            };
        }
        setMarkedDates(markedDatesObj);
    }

    useEffect(() => {
        load("my_appointments_response").then((data) => {
            if (data != null) {
                load("my_appointments_need_refetch").then((refetch) => {
                    if (refetch == true) {
                        callAPI();
                    } else {
                        markDates(data);
                        setAppointments(data);
                    }
                })
            } else {
                callAPI();
            }
        });
    }, []);


    async function callAPI(isRefresh) {
        loadString('token').then((authToken) => {
            setToken(authToken);
            getAppointments(authToken, isRefresh);
        });
    }

    const renderAppointments = () => {
        var hasAppointment = false

        for (var i = 0; i < appointments.length; i++) {
            if (appointments[i].date == selectedDate) {
                hasAppointment = true
            }
        }

        if (!hasAppointment) {
            if (selectedDate == todayString) {
                return (<View style={{ padding: 16 }}>
                    <View style={{ flex: 1, flexDirection: 'row', marginBottom: 24 }}>
                        <Text style={styles.TEXT, { fontSize: 16 }}>{t('my_appointments_screen_description_1')}</Text>
                    </View>
                </View>)
            }
            if (language == 'English') {
                return (
                    <View style={{ padding: 16 }}>
                        <View style={{ flex: 1, flexDirection: 'row', marginBottom: 24 }}>
                            <Text style={styles.TEXT, { fontSize: 16 }}>{t('my_appointments_screen_description_2')} {selectedDate.split("-").reverse().join("-")}</Text>
                        </View>
                    </View>
                )
            }
            if (language == 'Arabic') {
                return (
                    <View style={{ padding: 16 }}>
                        <View style={{ flex: 1, flexDirection: 'row', marginBottom: 24 }}>
                            <Text style={styles.TEXT, { fontSize: 16 }}>{selectedDate.split("-").reverse().join("-")} {t('my_appointments_screen_description_2')} </Text>
                        </View>
                    </View>
                )
            }
            if (language == 'Turkish') {
                return (
                    <View style={{ padding: 16 }}>
                        <View style={{ flex: 1, flexDirection: 'row', marginBottom: 24 }}>
                            <Text style={styles.TEXT, { fontSize: 16 }}>{selectedDate.split("-").reverse().join("-")} {t('my_appointments_screen_description_2')} </Text>
                        </View>
                    </View>
                )
            }
        }

        return (
            <View style={{ padding: 16 }}>
                {appointments
                    .filter(value => value.date == selectedDate && value.event_type == 'vaccination')
                    .map(appointment => (
                        <View key={`appointment-${appointment.person_name}-${appointment.date}-${Math.random() * 1024}`} style={{ marginBottom: 24 }}>
                            <Text style={[styles.TEXT, { fontSize: 16, fontWeight: '700' }]}>{appointment.person_name}</Text>
                            <Text style={[styles.TEXT, { fontSize: 16, marginTop: 4 }]}>{t('my_appointments_screen_child_description')} {appointment.vaccine_names.join(', ')}</Text>
                        </View>
                    ))}
                {appointments
                    .filter(value => value.date == selectedDate && value.event_type == 'prenatal_checkup')
                    .map(appointment => (
                        <View key={`appointment-${appointment.person_name}-${appointment.date}-${Math.random() * 1024}`} style={{ marginBottom: 24 }}>
                            <Text style={[styles.TEXT, { fontSize: 16, fontWeight: '700' }]}>{t('my_appointments_screen_mommy_title')}</Text>
                            <Text style={[styles.TEXT, { fontSize: 16, marginTop: 4 }]}>{t('my_appointments_screen_mommy_description')}</Text>
                        </View>
                    ))}
            </View>
        )
    }

    const formatedDates = useCallback((date) => {
        const dateToString = formatWithOptions({ locale: languageSwitcher(language) }, 'd MMMM yyyy');
        return dateToString(new Date(date));
    },
        [language],
    );

    return (
        <View style={styles.WHITE_CONTAINER_NO_HORIZONTAL_PADDING}>
            <SafeAreaView style={styles.SAFE_AREA_VIEW}>
                <ToolBar title={t('my_appointments_screen_toolbar_title')}
                    navigation={navigation} />
            </SafeAreaView >
            <View style={[styles.WHITE_CONTAINER, {
                paddingVertical: 0,
                paddingHorizontal: 0,
                marginBottom: 10
            }
            ]}>
                <TabsNavigator
                    list={[t('my_appointments_screen_list_view'), t('my_appointments_screen_calender_view')]}>
                    <View style={style.listContainer}>
                        <ScrollView refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={() => callAPI(true)}
                            />
                        }>
                            {appointments.map((e) => {
                                return (
                                    <View
                                        key={`${e.date} ${e.event_type} ${e.person_name}`}
                                        style={style.listItemContainer}>
                                        <Text
                                            style={style.itemDate}>
                                            {formatedDates(e.date)}
                                        </Text>

                                        <Text
                                            style={style.itemEvent}>
                                            {e.event_type === 'vaccination' ?
                                                e.person_name :
                                                t('my_appointments_screen_list_vaccination_mother')}
                                        </Text>
                                        <Text
                                            style={style.itemEventTarget}>
                                            {e.event_type === 'vaccination' ? (
                                                `${t('my_appointments_screen_list_recommended_vaccination')}: ${e.vaccine_names.join(', ')}`
                                            ) : (
                                                t('my_appointments_screen_mommy_description')
                                            )}
                                        </Text>
                                    </View>

                                );
                            })}
                        </ScrollView>
                        <View style={style.findCentersBtn}>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('nearbyHealthCenters')}
                                style={styles.BUTTON}>
                                <Text style={styles.BUTTON_TEXT}>
                                    {t('my_appointments_find_health_center_button')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <ScrollView refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => callAPI(true)}
                        />
                    }>
                        <CalendarList
                            theme={{
                                calendarBackground: color.white,
                                monthTextColor: color.primary,
                                selectedDayBackgroundColor: color.primary,
                                selectedDayTextColor: color.white,
                                todayTextColor: color.primary,
                                dayTextColor: color.primary,
                                textMonthFontWeight: 'bold',
                            }}
                            dayComponent={({ date, state, marking }) => {
                                if (date.dateString == todayString) {
                                    return (
                                        <TouchableOpacity onPress={() => { setSelectedDate(date.dateString); }}>
                                            <View style={{ padding: 4, alignItems: 'center' }}>
                                                <View style={{ width: 24, backgroundColor: color.primary, borderRadius: 16 }}>
                                                    <Text style={{ textAlign: 'center', color: color.white, fontWeight: marking && marking.marked ? '700' : '300' }}>{date.day}</Text>
                                                </View>
                                                <View style={{
                                                    marginTop: 4,
                                                    width: 6,
                                                    height: 6,
                                                    justifyContent: "center",
                                                    borderRadius: 60 / 2,
                                                    backgroundColor: color.primary,
                                                    opacity: marking && marking.marked ? 1 : 0
                                                }} />
                                            </View>
                                        </TouchableOpacity>
                                    );
                                } else {
                                    return (
                                        <TouchableOpacity onPress={() => { setSelectedDate(date.dateString); }}>
                                            <View style={{ padding: 4, alignItems: 'center' }}>
                                                <Text style={{ textAlign: 'center', color: color.primary, fontWeight: marking && marking.marked ? '700' : '300' }}>{date.day}</Text>
                                                <View style={{
                                                    width: 6,
                                                    height: 6,
                                                    justifyContent: "center",
                                                    borderRadius: 60 / 2,
                                                    backgroundColor: color.primary,
                                                    opacity: marking && marking.marked ? 1 : 0
                                                }} />
                                            </View>
                                        </TouchableOpacity>
                                    );
                                }
                            }}
                            allowFontScaling={true}
                            current={currentDate}
                            markedDates={markedDates}
                            horizontal={true}
                            pagingEnabled={true}
                            // Max amount of months allowed to scroll to the past. Default = 50
                            pastScrollRange={50}
                            // Max amount of months allowed to scroll to the future. Default = 50
                            futureScrollRange={50}
                            // Enable or disable scrolling of calendar list
                            scrollEnabled={true}
                            // Enable or disable vertical scroll indicator. Default = false
                            showScrollIndicator={true}
                            onDayPress={(day) => setSelectedDate(day.dateString)}
                            markingType={'custom'}
                        />
                        {renderAppointments()}
                    </ScrollView>
                </TabsNavigator>
            </View>
            {loading && <LoadingModal />}
        </View >
    )
}