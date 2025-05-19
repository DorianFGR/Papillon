import React from "react";
import { ScrollView, View } from "react-native";
import type { Screen } from "@/router/helpers/types";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { useGradesStore } from "@/stores/grades";
import QrCodeContainerCard from "@/components/Settings/QrCodeContainerCard";
import {
  NativeList,
  NativeIcon,
  NativeItem,
  NativeText,
} from "@/components/Global/NativeComponents";
import { QrCode } from "lucide-react-native";

const SettingsQrCode: Screen<"SettingsQrCode"> = ({
  navigation,
}) => {
  const theme = useTheme();
  const reelsObject = useGradesStore((store) => store.reels);
  const reels = Object.values(reelsObject);

  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: 16,
      }}
    >
      <QrCodeContainerCard theme={theme} />

      <View>
        <NativeList>
          <NativeItem
            onPress={() => {
              navigation.navigate("SettingsAddQrCode");
            }}
            leading={
              <NativeIcon
                icon={<QrCode />}
                color={"#006B6B"}
              />}
          >
            <NativeText variant="title">Ajouter un QrCode</NativeText>
          </NativeItem>
        </NativeList>
      </View>
    </ScrollView>
  );
};

export default SettingsQrCode;