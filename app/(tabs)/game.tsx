import { StyleSheet, View } from "react-native";
import TicTacToeGameScreen from "../../Components/TicTacToeGameScreen";

export default function GameScreen() {
  return (
    <View style={styles.container}>
      <TicTacToeGameScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
}); 