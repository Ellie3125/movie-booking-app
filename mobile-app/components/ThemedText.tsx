import React from "react";
import { Text, TextProps, useColorScheme } from "react-native";

type Props = TextProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  ...rest
}: Props) {
  const scheme = useColorScheme();
  const colorScheme = scheme === "dark" ? "dark" : "light";

  const defaultColor =
    colorScheme === "dark" ? "#F0EEF8" : "#1A1A2E";

  const color = colorScheme === "dark"
    ? darkColor ?? defaultColor
    : lightColor ?? defaultColor;

  return <Text style={[{ color }, style]} {...rest} />;
}