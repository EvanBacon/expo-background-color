import * as SystemUI from 'expo-system-ui';
import * as React from 'react';
import { Appearance, AppState } from 'react-native';
const propsStack = [];
const defaultProps = createStackEntry({
    backgroundColor: '#fff',
});
// Timer for updating the native module values at the end of the frame.
let updateImmediate = null;
let appearanceListener = null;
let appStateListener = null;
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
export function RootViewBackgroundColor(props) {
    let stack = React.useRef(null);
    React.useEffect(() => {
        // Create a stack entry on component mount
        stack.current = RootViewBackgroundColor.pushStackEntry(props);
        return () => {
            if (stack.current) {
                // Update on component unmount
                RootViewBackgroundColor.popStackEntry(stack.current);
            }
        };
    }, []);
    React.useEffect(() => {
        if (stack.current) {
            // Update the current stack entry
            stack.current = RootViewBackgroundColor.replaceStackEntry(stack.current, props);
        }
    }, [props.backgroundColor]);
    return null;
}
function isThemedColor(color) {
    return !!color && typeof color !== 'string' && ('light' in color) && ('dark' in color);
}
/**
 * Merges the prop stack with the default values.
 */
function mergePropsStack(propsStack, defaultValues) {
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
function setBackgroundColorAsync(scheme, backgroundColor) {
    if (isThemedColor(backgroundColor)) {
        return SystemUI.setBackgroundColorAsync(scheme === 'dark' ? backgroundColor.dark ?? '#000' : backgroundColor.light ?? '#fff');
    }
    return SystemUI.setBackgroundColorAsync(backgroundColor ?? '#fff');
}
/**
 * Returns an object to insert in the props stack from the props
 * and the transition/animation info.
 */
function createStackEntry(props) {
    return {
        backgroundColor: props.backgroundColor
    };
}
/**
 * Set the background color for the app
 * @param color Background color.
 * @param animated Animate the style change.
 */
RootViewBackgroundColor.setBackgroundColor = (color) => {
    defaultProps.backgroundColor = color;
    setBackgroundColorAsync(Appearance.getColorScheme(), color);
};
/**
 * Push a RootViewBackgroundColor entry onto the stack.
 * The return value should be passed to `popStackEntry` when complete.
 *
 * @param props Object containing the RootViewBackgroundColor props to use in the stack entry.
 */
RootViewBackgroundColor.pushStackEntry = (props) => {
    const entry = createStackEntry(props);
    propsStack.push(entry);
    // Ensure we only have one appearance change listener.
    if (!appearanceListener) {
        appearanceListener = ({ colorScheme }) => {
            setBackgroundColorAsync(colorScheme, propsStack[propsStack.length - 1].backgroundColor);
        };
        Appearance.addChangeListener(appearanceListener);
    }
    if (!appStateListener) {
        appStateListener = () => {
            setBackgroundColorAsync(Appearance.getColorScheme(), propsStack[propsStack.length - 1].backgroundColor);
        };
        AppState.addEventListener('change', appStateListener);
    }
    RootViewBackgroundColor._updatePropsStack();
    return entry;
};
/**
 * Pop a RootViewBackgroundColor entry from the stack.
 *
 * @param entry Entry returned from `pushStackEntry`.
 */
RootViewBackgroundColor.popStackEntry = (entry) => {
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
    RootViewBackgroundColor._updatePropsStack();
};
/**
 * Replace an existing RootViewBackgroundColor stack entry with new props.
 *
 * @param entry Entry returned from `pushStackEntry` to replace.
 * @param props Object containing the RootViewBackgroundColor props to use in the replacement stack entry.
 */
RootViewBackgroundColor.replaceStackEntry = (entry, props) => {
    const newEntry = createStackEntry(props);
    const index = propsStack.indexOf(entry);
    if (index !== -1) {
        propsStack[index] = newEntry;
    }
    RootViewBackgroundColor._updatePropsStack();
    return newEntry;
};
/**
 * Updates the native background color with the props from the stack.
 */
RootViewBackgroundColor._updatePropsStack = () => {
    // Send the update to the native module only once at the end of the frame.
    clearImmediate(updateImmediate);
    updateImmediate = setImmediate(() => {
        const { backgroundColor } = mergePropsStack(propsStack, defaultProps);
        if (backgroundColor) {
            setBackgroundColorAsync(Appearance.getColorScheme(), backgroundColor);
        }
    });
};
//# sourceMappingURL=index.js.map