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

export const HealthRecordsScreen = ({ navigation }) => {

    const { t } = useTranslation();

    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

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
            });
    }

    useEffect(() => {
        async function getToken() {
            const authToken = await loadString('token');
            load("my_children_info_response").then((data) => {
                if (data != null) {
                    setChildren(data);
                } else {
                    getChildren(authToken);
                }
            })
        }
        getToken();
    }, [navigation]);

    const editChild = (item) => {
        navigation.navigate('editHealthRecords', { person: item.name });
    }

    const Item = ({ item }) => (
        <TouchableOpacity onPress={() => editChild(item)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 22, paddingHorizontal: 16, backgroundColor: 'white' }}>
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
        return <Text style={[styles.TEXT, { paddingHorizontal: 16, marginBottom: 32 }]}>{t('health_records_screen_description')}</Text>
    }

    return (
        <View style={styles.FULL}>
            <SafeAreaView style={styles.SAFE_AREA_VIEW}>
                <ToolBar title={t('health_records_screen_toolbar_title')}
                    navigation={navigation} />
            </SafeAreaView>
            <View style={styles.CONTAINER_NO_HORIZONTAL_PADDING}>
                {description()}
                <TouchableOpacity onPress={() => navigation.navigate('editHealthRecords', { person: t('health_records_screen_your_health_records_title') })}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 22, paddingHorizontal: 16, backgroundColor: 'white' }}>
                        <Text style={styles.TEXT, { fontSize: 16, fontWeight: '600', color: color.primary }}>{t('health_records_screen_your_health_records_title')}</Text>
                        <Image source={icons.chevroncell} style={[arrowStyle, styles.RTL]} />
                    </View>
                </TouchableOpacity>
                <View style={{
                    height: 1,
                    width: "100%",
                    backgroundColor: color.backgroundColor,
                }} />
                <FlatList
                    data={children}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    bounces={false}
                    ItemSeparatorComponent={FlatListItemSeparator}
                    refreshControl={<RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => { getChildren(token, true); }} />}
                />
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