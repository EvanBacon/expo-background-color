# @bacons/expo-background-color

A stack based Expo component for setting the background color of the root view. Useful for changing the background color on certain screens or inside of native modals. Updates based on `Appearance` and `AppState` native modules.

This is a published version of my [original gist](https://gist.github.com/EvanBacon/d148b2425c5a0bd11b6cecb5f4b72bb8).

## Add the package to your npm dependencies

> Runs in any React Native project. Supports iOS, Android, web.

```
expo add expo-system-ui @bacons/expo-background-color
```

## Usage

Drop the `BackgroundColor` component anywhere, background color respect the component instance at the highest level (i.e. `StatusBar` module in `react-native`).

```tsx
import { BackgroundColor } from "@bacons/expo-background-color";

function App() {
  return (
    <>
      <BackgroundColor color={{ light: "#fff", dark: "#000" }} />
      <BackgroundColor color={"#fff000"} />
    </>
  );
}
```
