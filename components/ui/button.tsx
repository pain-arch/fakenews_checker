import type { ComponentPropsWithoutRef, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "text";
type ButtonSize = "small" | "medium";

type SharedProps = {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

type NativeButtonProps = SharedProps &
  Omit<ComponentPropsWithoutRef<"button">, keyof SharedProps> & {
    href?: never;
  };

type AnchorButtonProps = SharedProps &
  Omit<ComponentPropsWithoutRef<"a">, keyof SharedProps> & {
    href: string;
    disabled?: boolean;
  };

export type ButtonProps = NativeButtonProps | AnchorButtonProps;

export function Button({
  children,
  className = "",
  variant = "primary",
  size = "medium",
  ...props
}: ButtonProps) {
  const classes = `button button--${variant} button--${size} ${className}`.trim();

  if ("href" in props && props.href) {
    const { disabled, href, ...anchorProps } = props;

    return (
      <a
        {...anchorProps}
        className={classes}
        href={disabled ? undefined : href}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : anchorProps.tabIndex}
      >
        {children}
      </a>
    );
  }

  const buttonProps = props as Omit<NativeButtonProps, keyof SharedProps>;

  return (
    <button className={classes} type="button" {...buttonProps}>
      {children}
    </button>
  );
}
