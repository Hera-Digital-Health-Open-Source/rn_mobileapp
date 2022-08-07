import React, {useState} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';

import style from './styles.js';

import {styles} from '../../theme';

export const TabsNavigator = props => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <>
      <View style={style.headerContainer}>
        {props.list.map((item, index) => {
          return (
            <TouchableOpacity
              key={item}
              style={[
                style.headerTab,
                activeTab === index ? style.headerActiveTab : null,
              ]}
              onPress={i => setActiveTab(index)}>
              <Text
                style={[
                  style.headerTabText,
                  activeTab === index ? style.headerActiveTabText : null,
                ]}>
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View
        style={[
          styles.WHITE_CONTAINER_NO_HORIZONTAL_PADDING,
          style.childrenContainer,
        ]}>
        {props.children.map((item, index) => {
          return activeTab === index ? item : null;
        })}
      </View>
    </>
  );
};
