import React, { useEffect, useState } from 'react';
import { color, styles, icons } from '../../../theme';
import { ToolBar } from '../../../components/toolbar';
import { View, Text, TouchableOpacity, Image, SafeAreaView, RefreshControl } from 'react-native';
import { loadString, save, load } from '../../../../utils/storage';
import { baseURL } from '../../../store/constants';
import { FlatList } from 'react-native-gesture-handler';
import { useTranslation } from "react-i18next";
import { gifLoading } from '../../../theme';
import Modal from 'react-native-modal';

export const MyChildrenInfoScreen = ({ navigation }) => {

    const { t } = useTranslation();

    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [token, setToken] = useState('');

    var addedChild = navigation.state.params ? navigation.state.params.addedChild : null;
    var deleted = navigation.state.params ? navigation.state.params.deleted : null;
    var edited = navigation.state.params ? navigation.state.params.edited : null;

    if (deleted == true) {
        addedChild = null;
    }

    const arrowStyle = {
        position: 'absolute',
        right: 12,
        width: 8,
        tintColor: color.primary
    };

    const getChildren = (authToken, isRefreshing) => {
        if (isRefreshing) setRefreshing(true); else setLoading(true);

        const requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Token ' + authToken },
        };
        fetch(baseURL + '/children/', requestOptions)
            .then(response => {
                if (isRefreshing) setRefreshing(false); else setLoading(false);
                return response.json();
            })
            .then(data => {
                save("my_children_info_response", data);
                setChildren(data);
                save("my_children_need_refetch", false);
            });
    }

    useEffect(() => {
        async function getToken() {
            const authToken = await loadString('token');
            setToken(authToken);

            load("my_children_need_refetch").then((refetch) => {
                if (refetch == true) {
                    getChildren(authToken);
                } else {
                    load("my_children_info_response").then((data) => {
                        if (data != null) {
                            if (addedChild != null || deleted == true || edited == true) {
                                getChildren(authToken);
                            } else {
                                setChildren(data);
                            }
                        } else {
                            getChildren(authToken);
                        }
                    })
                }
            })
        }
        getToken();
    }, [navigation]);

    const editChild = (item) => {
        navigation.navigate('myChildInfo', { editChild: item });
    }

    const Item = ({ item }) => (
        <TouchableOpacity style={{ flex: 1 }} onPress={() => editChild(item)}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingVertical: 22, paddingHorizontal: 16, backgroundColor: 'white' }}>
                <Text style={styles.TEXT, { fontSize: 16, fontWeight: '600', color: color.primary }}>{item.name}</Text>
                <Image source={icons.chevroncell} style={[arrowStyle, styles.RTL]} />
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
        // if (addedChild) {
        //     return <Text style={styles.TEXT, { paddingHorizontal: 16 }}>{addedChild.name}'s recommended vaccination dates have been added to your calendar. Remember to check "My Appointments" for recommended vaccination dates!</Text>
        // } else {
        return <Text style={[styles.TEXT, { paddingHorizontal: 16 }]}>{t('my_children_screen_description_1')}</Text>
        // }
    }

    return (
        <View style={styles.FULL}>
            <SafeAreaView style={styles.SAFE_AREA_VIEW}>
                <ToolBar title={t('my_children_screen_toolbar_title')}
                    navigation={navigation} />
            </SafeAreaView>
            <View style={styles.CONTAINER_NO_HORIZONTAL_PADDING}>
                {children.length > 0 &&
                    <View style={{ marginBottom: 40, paddingHorizontal: 16 }}>
                        <Text style={styles.TEXT}>
                            {t('my_children_screen_description_2')}
                        </Text>
                        <View style={{ marginTop: 20 }}>
                            <TouchableOpacity
                                onPress={() => navigation.navigate("myAppointments")}
                                style={styles.BUTTON}>
                                <Text style={styles.BUTTON_TEXT}>{t('my_children_screen_go_to_appointments_button')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                }
                {children.length == 0 && description()}
                <FlatList
                    data={children}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    ItemSeparatorComponent={FlatListItemSeparator}
                    style={{ marginTop: 16 }}
                    refreshControl={<RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => { getChildren(token, true); }} />}
                />
                <View style={{ marginTop: 40, paddingHorizontal: 16 }}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('myAddAChild')}
                        style={styles.BUTTON_ALT}>
                        <Text style={styles.BUTTON_TEXT_ALT}>{t('my_children_screen_add_a_child_button')}</Text>
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