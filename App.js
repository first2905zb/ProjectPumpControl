import { StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import Home from './Screen/Home';
import Planner from './Screen/Planner';

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ navigation }) => ({
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={24} style={{ marginLeft: 16, color: "skyblue"}}/>
            </TouchableOpacity>
          ),
        })}
      >
        <Tab.Screen
          name='Home'
          component={Home}
          options={{
            tabBarLabel: 'Home',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Icon name={'home'} size={size} color={color} />
            ),
          }} 
          />
        <Tab.Screen
          name='Planner'
          component={Planner}
          options={{
            tabBarLabel: "Planner",
            tabBarIcon: ({ color, size }) => (
              <Icon name={"cog"} size={size} color={color} />
            ),
          }}

        />
      </Tab.Navigator>
    </NavigationContainer>
  )
}

export default App;

const styles = StyleSheet.create({});
