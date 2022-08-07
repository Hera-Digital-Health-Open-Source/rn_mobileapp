import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import Modal from 'react-native-modal';

import { gifLoading } from '../../theme';

export const LoadingModal = () => {
    return (
        <Modal isVisible={true} animationIn="fadeIn" animationOut="fadeOut">
            <View style={styles.container}>
                <View style={styles.imageContainer}>
                    <Image source={gifLoading} style={styles.image} />
                </View>
            </View>
        </Modal>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    imageContainer: {
        alignSelf: 'center',
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 20,
    },
});
