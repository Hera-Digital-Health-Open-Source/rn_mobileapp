import React, { useEffect, useState } from 'react';
import { color, styles, icons, gifLoading } from '../../../theme';
import { ToolBar } from '../../../components/toolbar';
import { View, Text, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { loadString } from '../../../../utils/storage';
import { baseURL } from '../../../store/constants';
import { FlatList } from 'react-native-gesture-handler';
import { useTranslation } from "react-i18next";
import Modal from 'react-native-modal';
import { saveString } from '../../../../utils/storage';

export const ChildrenInfoScreen = ({ navigation }) => {

    const [children, setChildren] = useState([]);
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState('');

    useEffect(() => {
        async function getToken() {
            const authToken = await loadString('token')
            setToken(authToken);
        }
        getToken();
    }, []);


    var addedChild = navigation.state.params ? navigation.state.params.addedChild : null;
    var deleted = navigation.state.params ? navigation.state.params.deleted : null;
    if (deleted == true) {
        addedChild = null;
    }

    const arrowStyle = {
        position: 'absolute',
        right: 12,
        width: 8,
        tintColor: color.primary
    };

    const getChildren = (authToken) => {
        setLoading(true);
        const requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + authToken },
        };
        fetch(baseURL + '/children/', requestOptions)
            .then(response => {
                setLoading(false);
                return response.json();
            })
            .then(data => {
                setChildren(data);
            });
    }

    useEffect(() => {
        async function getToken() {
            const authToken = await loadString('token')
            getChildren(authToken);
        }
        getToken();
    }, [navigation]);

    const editChild = (item) => {
        navigation.navigate('childInfo', { editChild: item });
    }

    const Item = ({ item }) => (
        <TouchableOpacity onPress={() => editChild(item)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 22, paddingHorizontal: 16, backgroundColor: 'white' }}>
                <Text style={styles.TEXT, { fontSize: 16, fontWeight: '600', color: color.primary }}>{item.name}</Text>
                <Image source={icons.chevroncell} style={arrowStyle} />
            </View>
        </TouchableOpacity>
    );

    const renderItem = ({ item }) => {
        return (
            <Item item={item} />
        )
    };

    const FlatListItemSeparator = () => {
        return (
            <View style={{
                height: 1,
                width: "100%",
                backgroundColor: color.backgroundColor,
            }} />
        );
    }

    const description = () => {
        if (addedChild) {
            return <View flexDirection='row' paddingHorizontal={16}><Text style={styles.TEXT}>{t('children_info_screen_child_added_description').replace('childName', addedChild.name)}</Text></View>
        } else {
            return <Text style={[styles.TEXT, { paddingHorizontal: 16 }]}>{t('children_info_screen_description')}</Text>
        }
    }

    const updateOnboardingProgresses = () => {

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + token },
            body: JSON.stringify({ has_filled_children_info: true })
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
                <ToolBar title={t('children_info_screen_toolbar_title')}
                    navigation={navigation} />
            </SafeAreaView>
            <View style={styles.CONTAINER_NO_HORIZONTAL_PADDING}>
                {description()}
                <FlatList
                    data={children}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    ItemSeparatorComponent={FlatListItemSeparator}
                    style={{ marginTop: 16 }}
                />
                <View style={{ marginTop: 40, paddingHorizontal: 16 }}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('addAChild')}
                        style={styles.BUTTON_ALT}>
                        <Text style={styles.BUTTON_TEXT_ALT}>{t('children_info_screen_add_a_child_button')}</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ marginTop: 10, paddingHorizontal: 16 }}>
                    <TouchableOpacity
                        onPress={() => {
                            updateOnboardingProgresses();
                            saveString('onboardingprogress', '3');
                            navigation.navigate('home');
                        }}
                        style={styles.BUTTON}>
                        <Text style={styles.BUTTON_TEXT}>{t('children_info_screen_done_button')}</Text>
                    </TouchableOpacity>
                </View>
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