import React, { useState } from 'react';
import { ToolBar } from '../../../components/toolbar';
import { View, Text, Image, SafeAreaView } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { color, styles } from '../../../theme';
import { Input } from 'react-native-elements';
import { load, save } from '../../../../utils/storage';
import { useTranslation } from "react-i18next";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export const SaveMedicalReportScreen = ({ navigation }) => {

    const { t } = useTranslation();

    var person = navigation.state.params ? navigation.state.params.person : null;
    var result = navigation.state.params ? navigation.state.params.result : null;

    const [description, setDescription] = useState('');

    const saveMedicalReport = () => {
        load(person).then((list) => {
            if (list == null) {
                save(person, [{ description: description, path: result.assets[0].uri }]).then(() => {
                    navigation.navigate('editHealthRecords', { person });
                });;
            } else {
                list.push({ description: description, path: result.assets[0].uri });
                save(person, list).then(() => {
                    navigation.navigate('editHealthRecords', { person });
                });
            }
        })
    }

    return (
        <View style={styles.FULL}>
            <SafeAreaView style={styles.SAFE_AREA_VIEW}>
                <ToolBar title={person}
                    navigation={navigation} />
            </SafeAreaView>
            <KeyboardAwareScrollView style={{ backgroundColor: color.background }}>
                <View style={styles.CONTAINER}>
                    <Image source={{ uri: result.assets[0].uri }}
                        resizeMode='contain'
                        style={{ width: 360, height: 280, alignSelf: 'center' }} />
                    <Input
                        style={{ marginTop: 24 }}
                        inputStyle={styles.NOPADMARGIN}
                        containerStyle={styles.NOPADMARGIN}
                        inputContainerStyle={{ borderBottomColor: color.primary }}
                        editable={true}
                        multiline={true}
                        blurOnSubmit={true}
                        returnKeyType='done'
                        placeholder={t('save_medical_records_description_hint')}
                        onChangeText={setDescription}
                        scrollEnabled={false}
                        value={description}
                    />
                    <View style={{ marginTop: 40 }}>
                        <TouchableOpacity
                            onPress={() => saveMedicalReport()}
                            style={styles.BUTTON}>
                            <Text style={styles.BUTTON_TEXT}>{t('save_medical_record_button')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAwareScrollView>
        </View>
    )
}