import { StyleSheet, View } from "react-native";
import TicTacToeSetupScreen from "../../Components/TicTacToeSetupScreen";

export default function TicTacToeTab() {
  return (
    <View style={styles.container}>
      <TicTacToeSetupScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
}); 