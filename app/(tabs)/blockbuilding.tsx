import { StyleSheet, View } from "react-native";
import BlockBuildingGame from "../../Components/BlockBuildingGame";

export default function BlockBuildingTab() {
  return (
    <View style={styles.container}>
      <BlockBuildingGame />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
}); 