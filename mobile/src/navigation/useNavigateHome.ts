import { useCallback } from "react";
import { CommonActions, useNavigation } from "@react-navigation/native";

export function useNavigateHome() {
  const navigation = useNavigation();

  return useCallback(() => {
    navigation.dispatch(
      CommonActions.navigate({
        name: "Home",
        params: {
          screen: "HomeMain",
        },
      })
    );
  }, [navigation]);
}
