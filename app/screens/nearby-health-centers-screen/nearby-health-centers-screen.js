import React, { useEffect, useState } from 'react';
import { color, icons, styles } from '../../theme';
import { ToolBar } from '../../components/toolbar';
import { Dimensions, Image, Platform, StyleSheet, View, Text, Linking, SafeAreaView } from 'react-native';
import MapView from 'react-native-maps';
import { Marker, Callout } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import Toast from 'react-native-toast-message';
import { useTranslation } from "react-i18next";
import { gifLoading } from '../../theme';
import Modal from 'react-native-modal';

export const NearbyHealthCentersScreen = ({ navigation }) => {

    const { t } = useTranslation();

    const [markers, setMarkers] = useState([]);
    const [region, setRegion] = useState({
        latitude: 41.0082,
        longitude: 28.9784,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05
    });
    const [showCurrentLocationMarker, setShowCurrentLocationMarker] = useState(false)
    const [loading, setLoading] = useState(false);
    const [latch, setLatch] = useState(1);

    const fetchHealthCenters = (latitude, longitude) => {
        setLoading(true);
        fetch({Place GOOGLE MAPS URL HERE})
            .then((resp) => {
                setLoading(false);
                return resp.json();
            })
            .then((data) => {
                setMarkers(data.results);
            })
            .catch(err => console.error(err));
    }

    const showToast = () => {
        Toast.show({
            type: 'error',
            text2: t('location_error_message_text')
        });
    }

    useEffect(() => {
        if (latch == 0) {
            fetchHealthCenters(region.latitude, region.longitude);
        }
    }, [latch])

    useEffect(() => {
        if (Platform.OS == 'ios') {
            check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE)
                .then((result) => {
                    switch (result) {
                        case RESULTS.UNAVAILABLE:
                            console.log('This feature is not available (on this device / in this context)');
                            break;
                        case RESULTS.DENIED:
                            console.log('The permission has not been requested / is denied but requestable');
                            request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE).then((result) => {
                                if (result == RESULTS.GRANTED) {
                                    console.log('The permission is granted by user');
                                    Geolocation.getCurrentPosition(info => {
                                        setRegion({
                                            latitude: info.coords.latitude,
                                            longitude: info.coords.longitude,
                                            latitudeDelta: 0.05,
                                            longitudeDelta: 0.05
                                        });
                                        setLatch(latch - 1);
                                    });
                                    setShowCurrentLocationMarker(true)
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
                            Geolocation.getCurrentPosition(info => {
                                setRegion({
                                    latitude: info.coords.latitude,
                                    longitude: info.coords.longitude,
                                    latitudeDelta: 0.05,
                                    longitudeDelta: 0.05
                                });
                                setLatch(latch - 1);
                            });
                            setShowCurrentLocationMarker(true)
                            break;
                        case RESULTS.BLOCKED:
                            console.log('The permission is denied and not requestable anymore');
                            break;
                    }
                })
                .catch((error) => {
                });
        } else if (Platform.OS == 'android') {
            check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
                .then((result) => {
                    switch (result) {
                        case RESULTS.UNAVAILABLE:
                            console.log('This feature is not available (on this device / in this context)');
                            break;
                        case RESULTS.DENIED:
                            console.log('The permission has not been requested / is denied but requestable');
                            request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION).then((result) => {
                                if (result == RESULTS.GRANTED) {
                                    console.log('The permission is granted by user');
                                    Geolocation.getCurrentPosition(info => {
                                        setRegion({
                                            latitude: info.coords.latitude,
                                            longitude: info.coords.longitude,
                                            latitudeDelta: 0.05,
                                            longitudeDelta: 0.05
                                        })
                                        setLatch(latch - 1);
                                        ;
                                    });
                                    setShowCurrentLocationMarker(true)
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
                            Geolocation.getCurrentPosition(info => {
                                setRegion({
                                    latitude: info.coords.latitude,
                                    longitude: info.coords.longitude,
                                    latitudeDelta: 0.05,
                                    longitudeDelta: 0.05
                                });
                                setLatch(latch - 1);
                            });
                            setShowCurrentLocationMarker(true)
                            break;
                        case RESULTS.BLOCKED:
                            console.log('The permission is denied and not requestable anymore');
                            break;
                    }
                })
                .catch((error) => {
                });
        }
    }, [])

    return (
        <View style={styles.FULL}>
            <SafeAreaView style={styles.SAFE_AREA_VIEW}>
                <ToolBar title={t('nearby_health_centers_screen_toolbar_title')}
                    navigation={navigation} />
            </SafeAreaView >
            <View style={[styles.CONTAINER]}>
                <MapView
                    style={style.map}
                    region={region}>
                    {markers.map((marker, index) => (
                        <Marker
                            key={index}
                            coordinate={{ latitude: marker.geometry.location.lat, longitude: marker.geometry.location.lng }}
                            title={marker.name}>
                            <Callout
                                tooltip={true}
                                onPress={() => {
                                    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
                                    const latLng = `${marker.geometry.location.lat},${marker.geometry.location.lng}`;
                                    const label = `${marker.name}`;
                                    const url = Platform.select({
                                        ios: `${scheme}${label}@${latLng}`,
                                        android: `${scheme}${latLng}(${label})`
                                    });
                                    Linking.openURL(url);
                                }}>
                                <View style={{ backgroundColor: color.white, padding: 8, borderRadius: 8 }}>
                                    <Text style={{ fontWeight: "bold" }}>{marker.name}</Text>
                                </View>
                            </Callout>
                        </Marker>
                    ))}
                    {showCurrentLocationMarker && <Marker
                        coordinate={{ latitude: region.latitude, longitude: region.longitude }}
                        title={t('current_location_text')}>
                        <Image source={icons.currentlocation} style={{ height: 35, width: 35 }} />
                    </Marker>}
                </MapView>
            </View>
            {loading && <Modal isVisible={true} animationIn='fadeIn' animationOut='fadeOut'>
                <View style={{ justifyContent: 'center', flex: 1 }}>
                    <View style={{ alignSelf: 'center' }}>
                        <Image source={gifLoading} style={{ width: 100, height: 100, borderRadius: 20 }} />
                    </View>
                </View>
            </Modal>}
            <Toast position='bottom' text2NumberOfLines={2} />
        </View>
    )
}

const style = StyleSheet.create({
    map: {
        ...StyleSheet.absoluteFillObject,
        height: Dimensions.get("window").height,
    },
});