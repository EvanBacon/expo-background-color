import type { ColorValue } from 'react-native';

export type ThemedColorValue = { light: ColorValue, dark: ColorValue };

export type Props = { color: ColorValue | ThemedColorValue }

export const BackgroundColor = () => null
