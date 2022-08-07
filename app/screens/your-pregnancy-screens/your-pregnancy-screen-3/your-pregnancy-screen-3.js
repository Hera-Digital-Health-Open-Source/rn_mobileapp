import React, { useEffect, useState } from 'react';
import { styles } from '../../../theme';
import { ToolBar } from '../../../components/toolbar';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useTranslation } from "react-i18next";
import { baseURL } from '../../../store/constants';
import { loadString, saveString } from '../../../../utils/storage';

export const YourPregnancyScreen3 = ({ navigation }) => {

    const { t } = useTranslation();
    const [token, setToken] = useState('');

    useEffect(() => {
        async function getToken() {
            const authToken = await loadString('token')
            setToken(authToken);
        }
        getToken();
    }, []);

    const updateOnboardingProgresses = () => {

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token },
            body: JSON.stringify({ has_filled_pregnancy_status: true })
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

    return (
        <View style={styles.FULL}>
            <SafeAreaView style={styles.SAFE_AREA_VIEW}>
                <ToolBar title={t('your_pregnancy_screen_toolbar_title')}
                    navigation={navigation} />
            </SafeAreaView>
            <View style={styles.CONTAINER}>
                <Text style={styles.TEXT}>
                    {t('your_pregnancy_screen_description_3')}
                </Text>
                <Text style={[styles.TEXT, { marginTop: 20 }]}>
                    {t('your_pregnancy_screen_description_4')}
                </Text>
                <View style={{ flex: 1, marginTop: 40 }}>
                    <TouchableOpacity
                        onPress={() => {
                            updateOnboardingProgresses();
                            saveString('onboardingprogress', '2');
                            navigation.navigate('childrenInfo', { deleted: false });
                        }}
                        style={styles.BUTTON}>
                        <Text style={styles.BUTTON_TEXT}>{t('your_pregnancy_screen_proceed_button')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}