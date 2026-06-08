import{
    Dimensions,
    Platform,
    StatusBar,
    StyleSheet,
    View,
} from 'react-native';
import React, { ReactNode } from 'react';
import { ScreenWrapperProps } from '@/types';
import { colors } from '@/constants/theme';

const { width, height } = Dimensions.get('window');     

const ScreenWrapper = ({ style , children }: ScreenWrapperProps) => {   
    let paddingTop = Platform.OS === 'ios' ? height * 0.06 : 50;

    return (
        <View style={[
            {
                flex: 1,
                backgroundColor: colors.neutral900,
                paddingTop,
            },
            style,
        ]}>
        <StatusBar barStyle="light-content"/>
            {children}
        </View>
    );
};

export default ScreenWrapper;

const styles = StyleSheet.create({});

