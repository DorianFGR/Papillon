import React, { useState } from "react";
import { ScrollView, View, Alert } from "react-native";
import type { Screen } from "@/router/helpers/types";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { useGradesStore } from "@/stores/grades";
import {
  NativeList,
  NativeIcon,
  NativeItem,
  NativeText,
} from "@/components/Global/NativeComponents";
import { Camera, File, Image } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { useCameraPermissions } from "expo-camera";
import * as BarCodeScanner from "expo-barcode-scanner"; // Importez cette bibliothèque

// État pour stocker le résultat du QR code
const SettingsAddQrCode: Screen<"SettingsAddQrCode"> = ({
  navigation,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const theme = useTheme();
  const reelsObject = useGradesStore((store) => store.reels);
  const reels = Object.values(reelsObject);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);

  const addQrCodePic = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      try {
        // Analyser l'image pour détecter un QR code
        const scannedResults = await BarCodeScanner.scanFromURLAsync(result.assets[0].uri);
        if (scannedResults && scannedResults.length > 0) {
          // QR code détecté
          const data = scannedResults[0].data;
          setQrCodeData(data);
          Alert.alert("QR Code détecté", `Contenu: ${data}`);

          console.log("Données du QR code:", data);
        } else {
          Alert.alert("Aucun QR code trouvé", "L'image ne contient pas de QR code valide.");
        }
      } catch (error) {
        console.error("Erreur lors de la lecture du QR code:", error);
        Alert.alert("Erreur", "Impossible de lire le QR code depuis cette image.");
      }
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: 16,
      }}
    >
      <View>
        <NativeList>
          <NativeItem
            onPress={() => addQrCodePic()}
            leading={
              <NativeIcon
                icon={<Image />}
                color={"#006B6B"}
              />}
          >
            <NativeText variant="title">Depuis une image</NativeText>
          </NativeItem>
          <NativeItem
            onPress={() => {
              navigation.navigate("SettingsAddQrCode");
            }}
            leading={
              <NativeIcon
                icon={<File />}
                color={"#006B6B"}
              />}
          >
            <NativeText variant="title">Depuis un fichier </NativeText>
          </NativeItem>
          <NativeItem
            onPress={() => requestPermission()}
            leading={
              <NativeIcon
                icon={<Camera />}
                color={"#006B6B"}
              />}
          >
            <NativeText variant="title">Scanner le QrCode</NativeText>
          </NativeItem>
        </NativeList>

        {qrCodeData && (
          <View style={{ marginTop: 16, padding: 10 }}>
            <NativeText variant="title">QR Code détecté:</NativeText>
            <NativeText variant="body">{qrCodeData}</NativeText>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default SettingsAddQrCode;