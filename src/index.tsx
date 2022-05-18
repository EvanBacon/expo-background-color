import * as SystemUI from 'expo-system-ui';
import * as React from 'react';
import { Appearance, AppState, AppStateStatus, ColorSchemeName, ColorValue } from 'react-native';

export type ThemedColorValue = { light: ColorValue, dark: ColorValue };

export type Props = { color: ColorValue | ThemedColorValue }

const propsStack: Props[] = [];

const defaultProps = createStackEntry({
    color: '#fff',
});

// Timer for updating the native module values at the end of the frame.
let updateImmediate: any | null = null;

let appearanceListener: Appearance.AppearanceListener | null = null;
let appStateListener: ((state: AppStateStatus) => void) | null = null;

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
 *       <BackgroundColor color={{ light: '#fff', dark: '#000' }} />
 *       <BackgroundColor color={'#fff000'} />
 *     </>
 *   )
 * }
 * ```
 */
export function BackgroundColor(props: Props) {
    let stack = React.useRef<Props | null>(null);

    React.useEffect(() => {
        // Create a stack entry on component mount
        stack.current = BackgroundColor.pushStackEntry(props)
        return () => {
            if (stack.current) {
                // Update on component unmount
                BackgroundColor.popStackEntry(stack.current);
            }
        }
    }, [])

    React.useEffect(() => {
        if (stack.current) {
            // Update the current stack entry
            stack.current = BackgroundColor.replaceStackEntry(
                stack.current,
                props,
            );
        }
    }, [props.color]);

    return null;
}

function isThemedColor(color?: Props['color']): color is ThemedColorValue {
    return !!color && typeof color !== 'string' && ('light' in color) && ('dark' in color);
}

/**
 * Merges the prop stack with the default values.
 */
function mergePropsStack(
    propsStack: Array<Props>,
    defaultValues: Partial<Props>,
): Partial<Props> {
    return propsStack.reduce((prev, cur) => {
        for (const prop in cur) {
            // @ts-ignore
            if (cur[prop] != null) {
                // @ts-ignore
                prev[prop] = cur[prop];
            }
        }
        return prev;
    }, Object.assign({}, defaultValues));
}

function setColorAsync(scheme: ColorSchemeName, color: Props['color']) {
    if (isThemedColor(color)) {
        return SystemUI.setBackgroundColorAsync(scheme === 'dark' ? color.dark ?? '#000' : color.light ?? '#fff');
    }
    return SystemUI.setBackgroundColorAsync(color ?? '#fff');
}


/**
 * Returns an object to insert in the props stack from the props
 * and the transition/animation info.
 */
function createStackEntry(props: Props): Props {
    return {
        color: props.color
    };
}

/**
 * Set the background color for the app
 * @param color Background color.
 * @param animated Animate the style change.
 */
BackgroundColor.setColor = (color: ThemedColorValue) => {
    defaultProps.color = color;
    setColorAsync(Appearance.getColorScheme(), color);
}

/**
 * Push a BackgroundColor entry onto the stack.
 * The return value should be passed to `popStackEntry` when complete.
 *
 * @param props Object containing the BackgroundColor props to use in the stack entry.
 */
BackgroundColor.pushStackEntry = (props: Props): any => {
    const entry = createStackEntry(props);
    propsStack.push(entry);

    // Ensure we only have one appearance change listener.
    if (!appearanceListener) {
        appearanceListener = ({ colorScheme }) => {
            setColorAsync(colorScheme, propsStack[propsStack.length - 1].color);
        }
        Appearance.addChangeListener(appearanceListener);
    }

    if (!appStateListener) {
        appStateListener = () => {
            setColorAsync(Appearance.getColorScheme(), propsStack[propsStack.length - 1].color);
        }
        AppState.addEventListener('change', appStateListener);
    }

    BackgroundColor._updatePropsStack();
    return entry;
}

/**
 * Pop a BackgroundColor entry from the stack.
 *
 * @param entry Entry returned from `pushStackEntry`.
 */
BackgroundColor.popStackEntry = (entry: Props) => {
    const index = propsStack.indexOf(entry);
    if (index !== -1) {
        propsStack.splice(index, 1);
    }
    if (propsStack.length === 0) {
        if (appearanceListener) {
            Appearance.removeChangeListener(appearanceListener);
            appearanceListener = null;
        }
        if (appStateListener) {
            AppState.removeEventListener('change', appStateListener);
            appStateListener = null;
        }
    }
    BackgroundColor._updatePropsStack();
}

/**
 * Replace an existing BackgroundColor stack entry with new props.
 *
 * @param entry Entry returned from `pushStackEntry` to replace.
 * @param props Object containing the BackgroundColor props to use in the replacement stack entry.
 */
BackgroundColor.replaceStackEntry = (entry: Props, props: Props): any => {
    const newEntry = createStackEntry(props);
    const index = propsStack.indexOf(entry);
    if (index !== -1) {
        propsStack[index] = newEntry;
    }
    BackgroundColor._updatePropsStack();
    return newEntry;
}

/**
 * Updates the native background color with the props from the stack.
 */
BackgroundColor._updatePropsStack = () => {
    // Send the update to the native module only once at the end of the frame.
    clearImmediate(updateImmediate);
    updateImmediate = setImmediate(() => {
        const { color } = mergePropsStack(
            propsStack,
            defaultProps,
        );

        if (color) {
            setColorAsync(Appearance.getColorScheme(), color);
        }
    });
};