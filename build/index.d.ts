import { ColorValue } from 'react-native';
declare type ThemedColorValue = {
    light: ColorValue;
    dark: ColorValue;
};
declare type Props = {
    backgroundColor: ColorValue | ThemedColorValue;
};
/**
 * A stack based component for setting the background color of the root view.
 * Useful for changing the background color on certain screens or inside of native modals.
 * Updates based on Appearance and AppState.
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <>
 *       <RootViewBackgroundColor backgroundColor={{ light: '#fff', dark: '#000' }} />
 *       <RootViewBackgroundColor backgroundColor={'#fff000'} />
 *     </>
 *   )
 * }
 * ```
 */
export declare function RootViewBackgroundColor(props: Props): null;
export declare namespace RootViewBackgroundColor {
    var setBackgroundColor: (color: ThemedColorValue) => void;
    var pushStackEntry: (props: Props) => any;
    var popStackEntry: (entry: Props) => void;
    var replaceStackEntry: (entry: Props, props: Props) => any;
    var _updatePropsStack: () => void;
}
export {};
