import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import DashboardScreen from "../screens/DashboardScreen";
import TimerScreen from "../screens/TimerScreen";
import ChallengeScreen from "../screens/ChallengeScreen";
import ChallengeProgressScreen from "../screens/ChallengeProgressScreen";
import StatsScreen from "../screens/StatsScreen";
import AIInsightsScreen from "../screens/AIInsightsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import EditNameScreen from "../screens/EditNameScreen";
import ChangePasswordScreen from "../screens/ChangePasswordScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Timer" component={TimerScreen} />
        <Stack.Screen name="Challenge" component={ChallengeScreen} />
        <Stack.Screen name="ChallengeProgress" component={ChallengeProgressScreen} />
        <Stack.Screen name="Stats" component={StatsScreen} />
        <Stack.Screen name="AIInsights" component={AIInsightsScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="EditName" component={EditNameScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
