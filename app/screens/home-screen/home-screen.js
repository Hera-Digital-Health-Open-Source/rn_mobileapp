import React, { useEffect, useState } from 'react';
import { imgLogoSmall, color, styles, gifLoading, imgHomeAppointments, imgHomePregnancy, imgHomeHealthRecords, imgHomeChildren, imgHomeNearbyHealthCenters, imgHomeEmergencyCall, imgHomeHealthTipsNews, imgHomeSettings, imgFacebook, imgFacebookFlipped, icons } from '../../theme';
import { View, Text, Image, FlatList, TouchableOpacity, Linking, Platform, I18nManager, SafeAreaView } from 'react-native';
import Modal from 'react-native-modal';
import { keyAppointments, keyChildren, keyEmergencyCall, keyHealthCenters, keyHealthRecords, keyHealthTipsNews, keyPregnancy, keySettings, keyFacebook, baseURL } from '../../store/constants';
import { Picker } from '../../components/select-field';
import { languageOptions } from '../../store/constants';
import { saveString, loadString, save } from '../../../utils/storage';
import { useTranslation } from "react-i18next";
import RNRestart from "react-native-restart";
import * as RNLocalize from "react-native-localize";
import DeviceCountry, {
    TYPE_ANY,
    TYPE_TELEPHONY,
    TYPE_CONFIGURATION,
} from 'react-native-device-country';
import numbers from '../../../utils/phonenumbers.json';

export const HomeScreen = ({ navigation }) => {

    const [language, setLanguage] = useState('');
    const [dataSource, setDataSource] = useState([]);
    const [surveys, setSurveys] = useState([]);
    const [token, setToken] = useState('');
    const { i18n } = useTranslation();
    const [userid, setUserid] = useState();
    const [timezone, setTimezone] = useState('');
    const [latch, setLatch] = useState(4);
    const [notifications, setNotifications] = useState([]);
    const [languagelatch, setLanguageLatch] = useState(3);
    const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

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

    const getSurvey = (authToken) => {
        const requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + authToken },
        };
        fetch(baseURL + '/surveys/pending/', requestOptions)
            .then(response => {
                return response.json();
            })
            .then(data => {
                setSurveys(data);
            });
    }

    const getNotifications = (authToken) => {
        const requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + authToken },
        };
        fetch(baseURL + '/notification_events/', requestOptions)
            .then(response => {
                return response.json();
            })
            .then(data => {
                // setNotifications([{
                //     "id": 0,
                //     "notification_type": 0,
                //     "push_title": "title",
                //     "push_body": "description",
                //     "in_app_content": "health_records",
                //     "read_at": null,
                //     "created_at": "2019-08-24T14:15:22Z"
                // },
                // {
                //     "id": 1,
                //     "notification_type": 0,
                //     "push_title": "title 2",
                //     "push_body": "description 2",
                //     "in_app_content": "appointments",
                //     "read_at": "2019-08-24T14:15:22Z",
                //     "created_at": "2019-08-24T14:15:22Z"
                // }]);
                save("notifications_response", data);
                setNotifications(data);
            });
    }

    useEffect(() => {
        if (notifications != null && notifications.length > 0) {
            notifications.forEach(element => {
                if (element.read_at == null) {
                    setHasUnreadNotifications(true);
                    return;
                }
            });
        }
    }, [notifications]);

    useEffect(() => {
        setLatch(latch - 1);
        setLanguageLatch(languagelatch - 1);
    }, [userid]);

    useEffect(() => {
        setLatch(latch - 1);
        setLanguageLatch(languagelatch - 1);
    }, [token]);

    useEffect(() => {
        setLanguageLatch(languagelatch - 1);
    }, [language]);

    useEffect(() => {
        setLatch(latch - 1);
    }, [timezone]);

    useEffect(() => {
        if (latch == 0 && timezone != RNLocalize.getTimeZone()) {
            updateTimezone();
        }
    }, [latch]);

    const updateTimezone = () => {

        const requestOptions = {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token },
            body: JSON.stringify({ timezone: RNLocalize.getTimeZone() })
        };
        fetch(baseURL + '/user_profiles/' + userid + '/', requestOptions)
            .then(response => {
                if (!response.ok) {
                    throw new Error();
                }
                return response.json();
            })
            .then(data => {
                saveString('timezone', RNLocalize.getTimeZone());
            }).catch((e) => {
            });
    }


    const postSurvey = (id, answer) => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token },
            body: JSON.stringify({ response: answer })
        };
        fetch(baseURL + '/surveys/' + id + '/response/', requestOptions)
            .then(response => {
                save('my_children_need_refetch', true)
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

    const updateLanguage = (lang) => {
        const requestOptions = {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token },
            body: JSON.stringify({ language_code: lang })
        };
        fetch(baseURL + '/user_profiles/' + userid + '/', requestOptions)
            .then(response => {
                if (!response.ok) {
                    throw new Error();
                }
                else return response.json();
            })
            .then(data => {
                saveString('updatelanguage', 'false');
            })
            .catch(e => {
            });
    }


    useEffect(() => {
        setupTiles();
        async function getToken() {
            const authToken = await loadString('token')
            getSurvey(authToken);
            getNotifications(authToken);
            setToken(authToken);
            setLanguageLatch(languagelatch - 1);
        }
        loadString('userid').then((userid) => {
            setUserid(userid);
            setLanguageLatch(languagelatch - 1);
        });

        loadString('timezone').then((timezone) => {
            setTimezone(timezone);
        });

        loadString('language').then((language) => {
            setLanguage(language);
        });

        getToken();
    }, []);

    useEffect(() => {
        if (languagelatch == 0) {
            loadString('updatelanguage').then((updatelanguage) => {
                if (updatelanguage == 'true') {
                    switch (language) {
                        case 'English':
                            updateLanguage('en');
                            break;
                        case 'Arabic':
                            updateLanguage('ar');
                            break;
                        case 'Turkish':
                            updateLanguage('tr');
                            break;
                    }
                }
            })
        }
    }, [languagelatch])

    const setupTiles = () => {
        setDataSource([
            { title: `${i18n.t("home_screen_my_appointments_title")}`, key: keyAppointments, image: imgHomeAppointments, textColor: color.primary, backgroundColor: color.white },
            { title: `${i18n.t("home_screen_my_pregnancy_title")}`, key: keyPregnancy, image: imgHomePregnancy, textColor: color.primary, backgroundColor: color.white },
            { title: `${i18n.t("home_screen_health_records_title")}`, key: keyHealthRecords, image: imgHomeHealthRecords, textColor: color.primary, backgroundColor: color.white },
            { title: `${i18n.t("home_screen_my_children_title")}`, key: keyChildren, image: imgHomeChildren, textColor: color.primary, backgroundColor: color.white },
            { title: `${i18n.t("home_screen_nearby_health_centers_title")}`, key: keyHealthCenters, image: imgHomeNearbyHealthCenters, textColor: color.primary, backgroundColor: color.white },
            { title: `${i18n.t("home_screen_emergency_call_title")}`, key: keyEmergencyCall, image: imgHomeEmergencyCall, textColor: color.red, backgroundColor: color.emergencyred },
            { title: `${i18n.t("home_screen_health_tips_news_title")}`, key: keyHealthTipsNews, image: imgHomeHealthTipsNews, textColor: color.primary, backgroundColor: color.white },
            { title: `${i18n.t("home_screen_facebook_group_title")}`, key: keyFacebook, image: I18nManager.isRTL ? imgFacebookFlipped : imgFacebook, textColor: "#1877F2", backgroundColor: color.blue },
            { title: `${i18n.t("home_screen_settings_title")}`, key: keySettings, image: imgHomeSettings, textColor: color.primary, backgroundColor: color.white }
        ]);
    }

    function openModal(modal) {
        modal.setModalVisible(true);
    }

    const onItemClick = (item) => {
        switch (item.key) {
            case keyAppointments:
                navigation.navigate('myAppointments');
                break;
            case keyPregnancy:
                navigation.navigate('myPregnancy');
                break;
            case keyHealthRecords:
                navigation.navigate('healthRecords');
                break;
            case keyChildren:
                navigation.navigate('myChildrenInfo');
                break;
            case keyHealthCenters:
                navigation.navigate('nearbyHealthCenters')
                break;
            case keyEmergencyCall:
                DeviceCountry.getCountryCode(TYPE_TELEPHONY)
                    .then((result) => {
                        numbers.data.forEach((element) => {
                            if (element.Country.ISOCode.toLowerCase() == result.code.toLowerCase()) {
                                Linking.openURL('tel:' + element.Ambulance.All[0]);
                            }
                        })
                    })
                    .catch((e) => {
                        Linking.openURL('tel:112');
                    });
                break;
            case keyHealthTipsNews:
                navigation.navigate('blog')
                break;
            case keyFacebook:
                if (Platform.OS == 'ios') { handleOpenLink('fb://group?id=327710368767013'); } else { handleOpenLink('fb://group/327710368767013'); }
                break;
            case keySettings:
                navigation.navigate('settings');
                break;
            default:
        }
    }

    const handleOpenLink = async (url) => {
        try {
            await Linking.openURL(url);
        } catch {
            await Linking.openURL('https://www.facebook.com/groups/327710368767013')
        }
    };

    return (
        <View style={styles.FULL}>
            <SafeAreaView style={styles.SAFE_AREA_VIEW}>
                <View style={{ flexDirection: 'row', paddingTop: 16 }}>
                    <TouchableOpacity
                        onPress={() => openModal(languagePicker)}>
                        <View style={{ flexDirection: 'row', paddingHorizontal: 24, alignItems: 'center' }}>
                            <Text style={styles.TEXT, { fontSize: 17, color: color.primary }}>{i18n.t('home_screen_language_dropdown_hint')}</Text>
                            <Image source={icons.selectarrow} style={{ marginStart: 8, marginTop: 2, tintColor: color.primary }} />
                        </View>
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'flex-end', paddingRight: 16 }}>
                        <TouchableOpacity onPress={() => navigation.navigate('myProfile')}>
                            <Image source={icons.profile} style={{ width: 25, height: 25, marginEnd: 16 }} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            navigation.navigate('notifications', { notifications });
                            setNotifications([]);
                        }}>
                            <Image style={{ width: 25, height: 25 }} source={hasUnreadNotifications ? icons.notificationunread : icons.notification} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={[styles.HOME_TOOLBAR, { flexDirection: 'row', alignItems: 'center' }]}>
                    <Image style={{ marginStart: 8, width: 55, height: 55 }} resizeMode='contain' source={imgLogoSmall} />
                    <Text style={{ color: color.primary, marginStart: 12, fontSize: 32, fontFamily: 'Roboto-Bold' }}>{i18n.t('visit_hera_web_screen_toolbar_title')}</Text>
                </View>
            </SafeAreaView>
            <View style={[styles.HOME_CONTAINER, { paddingTop: 8, paddingHorizontal: 8 }]}>
                <FlatList
                    data={dataSource}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={{ height: 160, flex: 0.5 }} onPress={() => onItemClick(item)}>
                            <View style={{ margin: 8, flex: 1, padding: 12, backgroundColor: item.backgroundColor, borderRadius: 8 }}>
                                <Image style={[{ position: 'absolute', bottom: 0, right: 0 }, styles.RTL]} source={item.image} />
                                <Text style={{ color: item.textColor, fontWeight: '700', fontSize: 20, fontFamily: 'Roboto-Bold', textAlign: 'left' }}>{item.title}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    numColumns={2}
                />
            </View>
            {surveys.length > 0 && <Modal isVisible={true} animationIn='fadeIn' animationOut='fadeOut'>
                <View style={{ justifyContent: 'center', flex: 1 }}>
                    <View style={{ alignItems: 'center', paddingHorizontal: 32, paddingVertical: 24, borderRadius: 16, backgroundColor: '#FFD480', alignSelf: 'center' }}>
                        <Text style={{ color: color.black, fontWeight: '700', fontSize: 20, fontFamily: 'Roboto-Bold', textAlign: 'left' }}>{surveys[0].question}</Text>
                        <View style={{ marginTop: 20, flexDirection: 'row' }}>
                            <View style={{ width: 100 }}>
                                <TouchableOpacity
                                    onPress={() => {
                                        postSurvey(surveys[0].id, surveys[0].options[1].code);
                                        setSurveys(surveys.slice(1));
                                    }}
                                    style={styles.BUTTON_ALT}>
                                    <Text style={styles.BUTTON_TEXT_ALT}>{surveys[0].options[1].translated_text}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ width: 20 }}>
                            </View>
                            <View style={{ width: 100 }}>
                                <TouchableOpacity
                                    onPress={() => {
                                        postSurvey(surveys[0].id, surveys[0].options[0].code);
                                        setSurveys(surveys.slice(1));
                                    }}
                                    style={styles.BUTTON}>
                                    <Text style={styles.BUTTON_TEXT}>{surveys[0].options[0].translated_text}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>}
            <Picker
                ref={(instance) => (languagePicker = instance)}
                data={translatedLanguageOptions}
                label={'Select Language'}
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
                    setupTiles();
                    saveString('language', selectedLanguage).then(() => {
                        saveString('updatelanguage', 'true').then(() => {
                            RNRestart.Restart();
                        });
                    });
                }} />
        </View>
    )
}