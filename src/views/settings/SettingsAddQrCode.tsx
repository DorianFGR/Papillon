import React, { useEffect, useState } from "react";
import { ScrollView, View, Alert, TouchableOpacity } from "react-native";
import type { Screen } from "@/router/helpers/types";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { useGradesStore } from "@/stores/grades";
import {
  NativeList,
  NativeIcon,
  NativeItem,
  NativeText,
} from "@/components/Global/NativeComponents";
import { Camera, Image, QrCodeIcon, Trash2 } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { useCameraPermissions } from "expo-camera";
import * as BarCodeScanner from "expo-barcode-scanner";
import { useQrCodeStore } from "@/stores/QrCode";
import { QrCode } from "@/stores/QrCode/types";

const SettingsAddQrCode: Screen<"SettingsAddQrCode"> = ({
  navigation,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const theme = useTheme();
  const reelsObject = useGradesStore((store) => store.reels);
  const reels = Object.values(reelsObject);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const { addQrCode, getAllQrCodes, removeQrCode } = useQrCodeStore();
  const [savedQrCodes, setSavedQrCodes] = useState<QrCode[]>([]);

  useEffect(() => {
    const codes = getAllQrCodes();
    setSavedQrCodes(codes);
    const unsubscribe = navigation.addListener("focus", () => {
      loadQrCodes();
    });

    return unsubscribe;
  }, []);

  const loadQrCodes = () => {
    const codes = getAllQrCodes();
    setSavedQrCodes(codes);
  };

  const addQrCodePic = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      try {
        const scannedResults = await BarCodeScanner.scanFromURLAsync(result.assets[0].uri);
        if (scannedResults && scannedResults.length > 0) {
          const data = scannedResults[0].data;
          setQrCodeData(data);
          navigation.navigate("SettingsNameQrCode", { data });

        } else {
          Alert.alert("Erreur : Aucun QR code trouvé", "L'image ne contient pas de QR code valide.");
        }
      } catch (error) {
        Alert.alert("Erreur", "Impossible de lire le QR code depuis cette image.");
      }
    }
  };

  const deleteQrCode = (id: string) => {

    removeQrCode(id);
    loadQrCodes();
    Alert.alert("QR Code supprimé", "Le QR code a été supprimé avec succès.");
  };

  const renderQrCodeItem = ({ item }: { item: QrCode }) => {
    return (

      <View
        style={{
          padding: 10,
          marginBottom: 10,
          backgroundColor: theme.colors.card,
          borderRadius: 8,
        }}
      >
        <NativeText variant="title">{item.name}</NativeText>
        <TouchableOpacity
          onPress={() => deleteQrCode(item.id)}
          style={{
            padding: 8,
            borderRadius: 4,
          }}
        >
          <NativeIcon
            icon={<Trash2 size={1} />}
            color="#FF3B30"
          />
        </TouchableOpacity>
      </View>
    );
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

        <View style={{ marginTop: 24 }}>
          <View style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16
          }}>
            <NativeText
              variant="title"
              style={{ fontSize: 18 }}
            >
              QR Codes enregistrés
            </NativeText>
            {savedQrCodes.length > 0 && (
              <NativeText
                variant="body"
                style={{ color: theme.colors.text || "#666" }}
              >
                {savedQrCodes.length} {savedQrCodes.length === 1 ? "code" : "codes"}
              </NativeText>
            )}
          </View>

          {savedQrCodes.length === 0 ? (
            <View style={{
              padding: 20,
              alignItems: "center",
              backgroundColor: theme.colors.card,
              borderRadius: 8
            }}>
              <NativeIcon
                icon={<QrCodeIcon size={40} />}
                color="#CCCCCC"
                style={{ marginBottom: 12 }}
              />
              <NativeText
                variant="body"
                style={{ textAlign: "center", color: theme.colors.text || "#666" }}
              >
                Aucun QR code enregistré.
              </NativeText>
            </View>
          ) : (
            savedQrCodes.map(code => (
              <React.Fragment key={code.data}>
                {renderQrCodeItem({ item: code })}
              </React.Fragment>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default SettingsAddQrCode;
