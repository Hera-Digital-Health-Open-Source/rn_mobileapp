import * as React from 'react';
import { Text, View, Image, TouchableOpacity, I18nManager } from 'react-native';
import { styles, icons } from '../../theme';

export class ToolBar extends React.Component {
  render() {
    const { navigation, hide } = this.props;
    return (
      <View style={styles.TOOLBAR}>
        {!hide &&
          <View>
            <TouchableOpacity
              onPress={() => (navigation.goBack(null))}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
              <Image source={icons.back} style={{ width: 15, height: 26.25, resizeMode: 'contain', transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }] }} />
            </TouchableOpacity>
          </View>
        }
        <Text style={styles.TOOLBAR_TEXT}>{this.props.title}</Text>
      </View>
    );
  }
}
