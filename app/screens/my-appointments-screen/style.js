import { I18nManager, StyleSheet } from 'react-native';
import { color } from '../../theme';

const textAlign = I18nManager.isRTL ? 'right' : 'left';

const style = StyleSheet.create({
    listContainer: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 0,
        marginBottom: 10,
    },
    listItemContainer: {
        paddingVertical: 22,
        paddingHorizontal: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: '#E0E0E0',
        marginVertical: 8,
        height: 120,
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    itemDate: {
        fontSize: 18,
        fontWeight: '700',
        color: color.primary,
    },
    itemEvent: {
        fontSize: 16,
        fontWeight: '700',
        color: color.black,
        textAlign: textAlign,
    },
    itemEventTarget: {
        fontSize: 16,
        fontWeight: '300',
    },
    findCentersBtn: {
        paddingHorizontal: 8,
    },
});

export default style;
