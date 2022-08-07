import React, {Component} from 'react';
import {
  Modal,
  Text,
  TouchableHighlight,
  View,
  StyleSheet,
  FlatList,
} from 'react-native';
import PropTypes from 'prop-types';

export class Picker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
    };
  }

  setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }

  render() {
    return (
      <View
        style={{
          backgroundColor: 'transparent',
          flex: 1,
          position: 'absolute',
        }}>
        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            this.setModalVisible(false);
          }}>
          <TouchableHighlight
            style={styles.container}
            onPress={() => this.setModalVisible(false)}
            underlayColor={'#333333cc'}>
            <View style={{zIndex: 5}}>
              <FlatList
                data={this.props.data}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({item, index}) => {
                  return (
                    <TouchableHighlight
                      onPress={() => {
                        this.setModalVisible(false);
                        this.props.onValueChange(this.props.data[index]);
                      }}>
                      {this.props.renderRow ? (
                        this.props.renderRow(item, index)
                      ) : (
                        <Text style={styles.itemText}>
                          {this.props.data[index]}
                        </Text>
                      )}
                    </TouchableHighlight>
                  );
                }}
              />
            </View>
          </TouchableHighlight>
        </Modal>
      </View>
    );
  }
}

Picker.propTypes = {
  data: PropTypes.array.isRequired,
  value: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onValueChange: PropTypes.func,
  renderRow: PropTypes.func,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#333333cc',
    padding: 16,
  },
  itemText: {
    backgroundColor: '#fff',
    padding: 16,
    fontSize: 18,
    color: '#222',
    borderTopWidth: 1,
    borderColor: '#CCC',
    textAlign: 'left'
  },
});
