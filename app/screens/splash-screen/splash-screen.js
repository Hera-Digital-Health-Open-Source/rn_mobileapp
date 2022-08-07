import React, { useEffect } from 'react';
import { View, Image } from 'react-native';
import { loadString, saveString } from '../../../utils/storage';
import { baseURL } from '../../store/constants';
import { imgLogo, styles } from '../../theme';

export const SplashScreen = ({ navigation }) => {
    useEffect(() => {
        setTimeout(
            () => {
                loadString('token').then((authToken) => {
                    if (authToken) {
                        loadString('onboardingprogress').then((progress) => {
                            if (progress) {
                                switch (progress) {
                                    case '1':
                                        navigation.navigate('yourPregnancy1', { token: authToken });
                                        break;
                                    case '2':
                                        navigation.navigate('childrenInfo');
                                        break;
                                    case '3':
                                        navigation.navigate('home');
                                        break
                                    default:
                                        navigation.navigate('completeProfile', { token: authToken });
                                }
                            } else {
                                getOnboardingProgresses(authToken);
                            }
                        })
                    } else {
                        navigation.navigate('auth');
                    }
                })
            },
            100
        )
    });

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
                        navigation.navigate('home');
                    } else if (data.has_filled_pregnancy_status == true) {
                        saveString('onboardingprogress', '2');
                        navigation.navigate('childrenInfo');
                    } else if (data.has_filled_profile == true) {
                        saveString('onboardingprogress', '1');
                        navigation.navigate('yourPregnancy1');
                    } else {
                        navigation.navigate('completeProfile', { token: authToken });
                    }
                }).catch(e => {
                    navigation.navigate('completeProfile', { token: authToken });
                });
        })
    }

    return (
        <View style={styles.FULL}>
            <View style={styles.SPLASH_CONTAINER}>
                <Image style={{ width: 200 }} resizeMode='contain' source={imgLogo} />
            </View>
        </View>
    )
}