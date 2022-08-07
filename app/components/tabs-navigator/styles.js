import {StyleSheet, Dimensions} from 'react-native';
import {color} from '../../theme';

const style = StyleSheet.create({
  headerContainer: {
    width: Dimensions.get('window').width,
    flexDirection: 'row',
  },
  headerTab: {
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  headerActiveTab: {
    backgroundColor: color.white,
    borderColor: color.disabled,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderLeftWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerTabText: {
    fontSize: 16,
    fontWeight: '400',
    color: color.hint,
  },
  headerActiveTabText: {
    fontSize: 20,
    fontWeight: '600',
    color: color.primary,
  },
});

export default style;
