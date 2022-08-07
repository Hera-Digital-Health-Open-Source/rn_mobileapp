import * as React from 'react';
import { View, Image, TouchableOpacity, I18nManager } from 'react-native';
import { Input } from 'react-native-elements';
import { styles, icons, color } from '../../theme';

const arrowStyle = {
  position: 'absolute',
  right: 0,
  width: 14,
  top: 18
};

const textAlign = I18nManager.isRTL ? 'right' : 'left'

export class SelectField extends React.Component {


  render() {
    return (
      <TouchableOpacity onPress={this.props.onSelect} activeOpacity={1}>
        <View style={{ justifyContent: 'center' }} pointerEvents="none">
          <Input
            placeholder={this.props.placeholder}
            textAlign={textAlign}
            inputStyle={styles.NOPADMARGIN}
            containerStyle={styles.NOPADMARGIN}
            inputContainerStyle={{ borderBottomColor: color.primary }}
            editable={false}
            onChangeText={this.props.onChangeText}
            value={this.props.value}
          />
          <Image source={icons.selectarrow} style={arrowStyle} />
        </View>
      </TouchableOpacity>
    );
  }
}
