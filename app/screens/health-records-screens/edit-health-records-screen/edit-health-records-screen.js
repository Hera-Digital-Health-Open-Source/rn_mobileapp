import React, { useEffect, useState } from 'react';
import { ToolBar } from '../../../components/toolbar';
import { View, Text, FlatList, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import Modal from 'react-native-modal';
import { color, icons, styles } from '../../../theme';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { load, save } from '../../../../utils/storage';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { useTranslation } from "react-i18next";

export const EditHealthRecordsScreen = ({ navigation }) => {

    const { t } = useTranslation();

    var person = navigation.state.params ? navigation.state.params.person : null;

    const [isModalVisible, setModalVisible] = useState(false);
    const [isFullScreenModalVisible, setFullScreenModalVisible] = useState(false);
    const [showDefaultText, setShowDefaultText] = useState(true);
    const [healthRecords, setHealthRecords] = useState([]);
    const [fullScreenPath, setFullScreenPath] = useState('');

    const startCamera = async () => {
        const result = await launchCamera({ mediaType: 'photo' });
        setModalVisible(false);
        if (result == null || result.assets == null) {
            return
        }
        navigation.navigate("saveMedicalReport", { person, result });
    }

    const handleCamera = async () => {
        if (Platform.OS == 'ios') {
            check(PERMISSIONS.IOS.CAMERA)
                .then((result) => {
                    switch (result) {
                        case RESULTS.UNAVAILABLE:
                            console.log('This feature is not available (on this device / in this context)');
                            break;
                        case RESULTS.DENIED:
                            console.log('The permission has not been requested / is denied but requestable');
                            request(PERMISSIONS.IOS.CAMERA).then((result) => {
                                if (result == RESULTS.GRANTED) {
                                    console.log('The permission is granted by user');
                                    startCamera();
                                } else {
                                    showToast();
                                }
                            });
                            break;
                        case RESULTS.LIMITED:
                            console.log('The permission is limited: some actions are possible');
                            break;
                        case RESULTS.GRANTED:
                            console.log('The permission is granted');
                            startCamera();
                            break;
                        case RESULTS.BLOCKED:
                            console.log('The permission is denied and not requestable anymore');
                            break;
                    }
                })
                .catch((error) => {
                });
        } else if (Platform.OS == 'android') {
            check(PERMISSIONS.ANDROID.CAMERA)
                .then((result) => {
                    switch (result) {
                        case RESULTS.UNAVAILABLE:
                            console.log('This feature is not available (on this device / in this context)');
                            break;
                        case RESULTS.DENIED:
                            console.log('The permission has not been requested / is denied but requestable');
                            request(PERMISSIONS.ANDROID.CAMERA).then((result) => {
                                if (result == RESULTS.GRANTED) {
                                    startCamera();
                                } else {
                                    showToast();
                                }
                            });
                            break;
                        case RESULTS.LIMITED:
                            console.log('The permission is limited: some actions are possible');
                            break;
                        case RESULTS.GRANTED:
                            console.log('The permission is granted');
                            startCamera();
                            break;
                        case RESULTS.BLOCKED:
                            console.log('The permission is denied and not requestable anymore');
                            break;
                    }
                })
                .catch((error) => {
                });
        }
    }

    const showToast = () => {
        Toast.show({
            type: 'error',
            text2: 'Camera permission is not granted. Please allow this permission through phone settings.'
        });
    }

    const handleGallery = async () => {
        const result = await launchImageLibrary({ mediaType: 'photo' });
        setModalVisible(false);
        if (result == null || result.assets == null) {
            return
        }
        navigation.navigate("saveMedicalReport", { person, result });
    }

    const arrowStyle = {
        position: 'absolute',
        right: 12,
        width: 8,
        tintColor: color.primary
    };

    const transformedArrowStyle = {
        position: 'absolute',
        right: 12,
        width: 8,
        tintColor: color.primary,
        transform: [{ rotate: '90deg' }]
    };

    const trashStyle = {
        position: 'absolute',
        right: 40,
        width: 8,
        tintColor: color.primary
    };

    useEffect(() => {
        load(person).then((list) => {
            if (list == null || list.length == 0) {
                setShowDefaultText(true);
            } else {
                setShowDefaultText(false);
                for (let i = 0; i < list.length; i++) {
                    list[i]['expanded'] = false;
                }
                setHealthRecords(list);
            }
        })
    }, [navigation]);

    const Item = ({ item }) => (
        <TouchableOpacity onPress={() => {
            for (let i = 0; i < healthRecords.length; i++) {
                if (healthRecords[i].description == item.description) {
                    healthRecords[i]['expanded'] = !healthRecords[i]['expanded'];
                }
            }
            let data = [...healthRecords]
            setHealthRecords(data);
        }}>
            <View style={{ backgroundColor: 'white' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 22, paddingHorizontal: 16, backgroundColor: 'white' }}>
                    <Text style={styles.TEXT, { fontSize: 16, fontWeight: '600', color: color.primary, marginRight: 32 }}>{item.description}</Text>
                    {item.expanded && <TouchableOpacity style={trashStyle} onPress={() => {
                        let index = healthRecords.indexOf(item)
                        if (index > -1) {
                            healthRecords.splice(index, 1);
                        }
                        let data = [...healthRecords];
                        setHealthRecords(data);
                        save(person, data);
                    }}><Image source={icons.trash} /></TouchableOpacity>}

                    {!item.expanded && <Image source={icons.chevroncell} style={arrowStyle} />}
                    {item.expanded && <Image source={icons.chevroncell} style={transformedArrowStyle} />}
                </View>
                {item.expanded && <TouchableOpacity onPress={() => {
                    setFullScreenPath(item.path);
                    setFullScreenModalVisible(true);
                }}>
                    <Image source={{ uri: item.path }}
                        resizeMode='contain'
                        style={{ width: 360, height: 280, alignSelf: 'center', marginBottom: 20 }} /></TouchableOpacity>}
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

    return (
        <View style={styles.FULL}>
            <SafeAreaView style={styles.SAFE_AREA_VIEW}>
                <ToolBar title={person}
                    navigation={navigation} />
            </SafeAreaView>
            <View style={styles.CONTAINER_NO_HORIZONTAL_PADDING}>
                {showDefaultText && <Text style={[styles.TEXT, { marginHorizontal: 16, marginBottom: 40 }]}>
                    {t('health_records_screen_no_medical_records_description')}
                </Text>}
                <FlatList
                    data={healthRecords}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    ItemSeparatorComponent={FlatListItemSeparator}
                    style={{ marginTop: 16 }}
                />
                <View>
                    <TouchableOpacity
                        onPress={() => setModalVisible(true)}
                        style={[styles.BUTTON, { marginHorizontal: 16, marginTop: 16 }]}>
                        <Text style={styles.BUTTON_TEXT}>{t('health_records_screen_add_new_button')}</Text>
                    </TouchableOpacity>
                </View>
                <Modal isVisible={isModalVisible}>
                    <View style={{ justifyContent: 'center', flex: 1 }}>
                        <View style={{ alignItems: 'center', paddingHorizontal: 32, paddingVertical: 24, borderRadius: 16, backgroundColor: 'white', alignSelf: 'center' }}>
                            <Text style={styles.TEXT, { fontSize: 18, marginBottom: 32 }}>{t('select_image_dialog_title')}</Text>
                            <TouchableOpacity onPress={() => handleCamera()} style={{ marginBottom: 32 }}>
                                <Text style={styles.TEXT, { fontSize: 18, fontWeight: '700', color: color.primary }}>
                                    {t('select_image_dialog_camera_button')}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleGallery()} style={{ marginBottom: 32 }}>
                                <Text style={styles.TEXT, { fontSize: 18, fontWeight: '700', color: color.primary }}>
                                    {t('select_image_dialog_gallery_button')}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text style={styles.TEXT, { fontSize: 18, fontWeight: '700', color: color.red }}>
                                    {t('select_image_dialog_cancel_button')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                <Modal isVisible={isFullScreenModalVisible}>
                    <TouchableOpacity onPress={() => setFullScreenModalVisible(false)}>
                        <Image style={{ width: '100%', height: '100%' }} resizeMode='contain' source={{ uri: fullScreenPath }} />
                    </TouchableOpacity>
                </Modal>
            </View>
        </View>
    )
}