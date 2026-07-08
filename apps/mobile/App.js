import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, Text } from "react-native";

// Role Selection
import RoleSelectionScreen from "./src/screens/RoleSelectionScreen";

// Customer Screens
import CustomerLoginScreen from "./src/screens/CustomerLoginScreen";
import CustomerRegisterScreen from "./src/screens/CustomerRegisterScreen";
import RestaurantsListScreen from "./src/screens/RestaurantsListScreen";
import RestaurantDetailScreen from "./src/screens/RestaurantDetailScreen";
import BookingRequestSubmittedScreen from "./src/screens/BookingRequestSubmittedScreen";
import BookingConfirmedScreen from "./src/screens/BookingConfirmedScreen";
import MyBookingsScreen from "./src/screens/MyBookingsScreen";

// Host Screens
import HostLoginScreen from "./src/screens/HostLoginScreen";
import HostRegisterScreen from "./src/screens/HostRegisterScreen";
import ClaimVenueScreen from "./src/screens/ClaimVenueScreen";
import HostHomeScreen from "./src/screens/HostHomeScreen";
import BookingRequestDetailScreen from "./src/screens/BookingRequestDetailScreen";
import HostBookingsScreen from "./src/screens/HostBookingsScreen";
import VenueProfileScreen from "./src/screens/VenueProfileScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    async function determineInitialRoute() {
      const customerToken = await AsyncStorage.getItem("customer_token");
      const hostToken = await AsyncStorage.getItem("host_token");
      
      // Basic routing logic: if they have a token, put them in that flow.
      // Since they might have both if they play both roles on the same device,
      // it's safer to start at RoleSelection if both exist or none exist, 
      // but for simplicity let's route to RoleSelection if no tokens.
      // If only one token exists, route to that app's home.
      
      if (customerToken && !hostToken) {
        setInitialRoute("RestaurantsList");
      } else if (hostToken && !customerToken) {
        setInitialRoute("HostHome"); // Note: Ideally we check if they claimed a venue, but this is a starting point.
      } else {
        setInitialRoute("RoleSelection");
      }
    }
    determineInitialRoute();
  }, []);

  if (!initialRoute) return <View style={{ flex: 1, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" }}><Text>Loading BookIt...</Text></View>;

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator initialRouteName={initialRoute}>
        {/* Entry */}
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} options={{ headerShown: false }} />
        
        {/* Customer Flow */}
        <Stack.Screen name="CustomerLogin" component={CustomerLoginScreen} options={{ title: "Login" }} />
        <Stack.Screen name="Register" component={CustomerRegisterScreen} options={{ title: "Register" }} /> 
        <Stack.Screen name="CustomerRegister" component={CustomerRegisterScreen} options={{ title: "Register" }} />
        <Stack.Screen name="RestaurantsList" component={RestaurantsListScreen} options={{ headerShown: false }} />
        <Stack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} options={{ title: "Restaurant Details" }} />
        <Stack.Screen name="BookingRequestSubmitted" component={BookingRequestSubmittedScreen} options={{ headerShown: false }} />
        <Stack.Screen name="BookingConfirmed" component={BookingConfirmedScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MyBookings" component={MyBookingsScreen} options={{ title: "My Bookings" }} />

        {/* Host Flow */}
        <Stack.Screen name="HostLogin" component={HostLoginScreen} options={{ title: "Host Login" }} />
        <Stack.Screen name="HostRegister" component={HostRegisterScreen} options={{ title: "Register as Host" }} />
        <Stack.Screen name="ClaimVenue" component={ClaimVenueScreen} options={{ title: "Claim Venue", headerBackVisible: false }} />
        <Stack.Screen name="HostHome" component={HostHomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="BookingRequestDetail" component={BookingRequestDetailScreen} options={{ title: "Booking Details" }} />
        <Stack.Screen name="Bookings" component={HostBookingsScreen} options={{ title: "All Bookings" }} />
        <Stack.Screen name="VenueProfile" component={VenueProfileScreen} options={{ title: "Venue Profile" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
