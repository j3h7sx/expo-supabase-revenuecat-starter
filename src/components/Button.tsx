import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
} from "react-native";

import { colors, radius, spacing } from "@/src/theme";

type ButtonProps = PressableProps & {
  loading?: boolean;
  title: string;
  variant?: "primary" | "secondary";
};

export function Button({
  disabled,
  loading,
  title,
  variant = "primary",
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      disabled={isDisabled}
      style={(state) => [
        styles.base,
        variant === "secondary" ? styles.secondary : styles.primary,
        state.pressed && !isDisabled ? styles.pressed : null,
        isDisabled ? styles.disabled : null,
        typeof style === "function" ? style(state) : style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? colors.primaryText : colors.primary} />
      ) : (
        <Text
          style={[
            styles.title,
            variant === "secondary" ? styles.secondaryTitle : styles.primaryTitle,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    borderRadius: radius.sm,
    minHeight: 52,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
  },
  primary: {
    backgroundColor: colors.primary,
  },
  primaryTitle: {
    color: colors.primaryText,
  },
  secondary: {
    backgroundColor: colors.surfaceMuted,
  },
  secondaryTitle: {
    color: colors.text,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
});
