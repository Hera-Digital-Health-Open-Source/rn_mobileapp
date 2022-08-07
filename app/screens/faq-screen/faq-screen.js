import React, { useEffect, useState } from 'react';
import { styles, gifLoading } from '../../theme';
import { ToolBar } from '../../components/toolbar';
import { View, Image, SafeAreaView } from 'react-native';
import WebView from 'react-native-webview';
import { loadString } from '../../../utils/storage';
import { useTranslation } from "react-i18next";
import Modal from 'react-native-modal';

export const FAQScreen = ({ navigation }) => {

    const { t } = useTranslation();

    const [language, setLanguage] = useState();
    const [loading, setLoading] = useState(false);
    const [url, setUrl] = useState();

    const webView = React.createRef();

    useEffect(() => {
        async function loadWeb() {
            const language = await loadString('language');
            setLanguage(language);
        }
        loadWeb();
    }, []);

    useEffect(() => {
        switch (language) {
            case 'English':
                setUrl('https://heradigitalhealth.org/frequently-asked-questions/');
                break;
            case 'Arabic':
                setUrl('https://heradigitalhealth.org/ar/frequently-asked-questions/');
                break;
            case 'Turkish':
                setUrl('https://heradigitalhealth.org/tr/sikca-sorulan-sorular/');
                break;
        }
    }, [language]);

    useEffect(() => {
        setLoading(true);
        webView.current.reload();
    }, [url]);

    const jsCode = `
        let headerSelector = document.getElementById('Header_wrapper')
        let footerSelector = document.getElementById('Footer')
        let languagesSelector = document.querySelector('.wpml-ls-statics-footer')
        headerSelector.style.display = "none"
        footerSelector.style.display = "none"
        languagesSelector.style.display = "none"
        true;
        `;

    return (
        <View style={styles.FULL}>
            <SafeAreaView style={styles.SAFE_AREA_VIEW}>
                <ToolBar title={t('faq_screen_toolbar_title')}
                    navigation={navigation} />
            </SafeAreaView>
            <View style={[styles.WEBVIEW_CONTAINER]}>
                <WebView
                    renderLoading={() => <View />}
                    onLoadEnd={() => setLoading(false)}
                    ref={webView}
                    injectedJavaScript={jsCode}
                    onMessage={() => { }}
                    source={{ uri: url }}
                />
            </View>
            {loading && <Modal isVisible={true} animationIn='fadeIn' animationOut='fadeOut'>
                <View style={{ justifyContent: 'center', flex: 1 }}>
                    <View style={{ alignSelf: 'center' }}>
                        <Image source={gifLoading} style={{ width: 100, height: 100, borderRadius: 20 }} />
                    </View>
                </View>
            </Modal>}
        </View >
    )
}