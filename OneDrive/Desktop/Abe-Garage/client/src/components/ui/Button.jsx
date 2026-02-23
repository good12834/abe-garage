import React from "react";
import { Link } from "react-router-dom";
import "./Button.css";

/**
 * Reusable Button Component for Abe Garage
 * Provides consistent styling and functionality across the application
 */
const Button = ({
  children,
  variant = "primary",
  size = "md",
  rounded = true,
  loading = false,
  disabled = false,
  block = false,
  icon,
  iconPosition = "left",
  href,
  to,
  onClick,
  type = "button",
  className = "",
  ...props
}) => {
  // Base classes
  const baseClasses = ["btn"];

  // Variant classes
  const variantClasses = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    success: "btn-success",
    warning: "btn-warning",
    danger: "btn-danger",
    light: "btn-light",
    dark: "btn-dark",
    outline: "btn-outline",
    "outline-primary": "btn-outline-primary",
    "outline-secondary": "btn-outline-secondary",
    "outline-light": "btn-outline-light",
    "outline-dark": "btn-outline-dark",
    "gradient-primary": "btn-gradient-primary",
    "gradient-gold": "btn-gradient-gold",
  };

  // Size classes
  const sizeClasses = {
    xs: "btn-xs",
    sm: "btn-sm",
    md: "btn-md",
    lg: "btn-lg",
    xl: "btn-xl",
  };

  // Rounded classes
  const roundedClasses = {
    none: "",
    sm: "btn-rounded-sm",
    md: "btn-rounded-md",
    lg: "btn-rounded-lg",
    true: "btn-rounded",
    pill: "btn-pill",
  };

  // Special classes
  if (block) baseClasses.push("btn-block");
  if (loading) baseClasses.push("btn-loading");

  // Combine all classes
  const classes = [
    ...baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    roundedClasses[rounded],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // Content with icon
  const content = (
    <>
      {icon && iconPosition === "left" && (
        <span className="btn-icon-left">{icon}</span>
      )}
      {loading ? "Loading..." : children}
      {icon && iconPosition === "right" && (
        <span className="btn-icon-right">{icon}</span>
      )}
    </>
  );

  // Handle different element types
  if (to) {
    // React Router Link
    return (
      <Link to={to} className={classes} onClick={onClick} {...props}>
        {content}
      </Link>
    );
  }

  if (href) {
    // Regular anchor link
    return (
      <a href={href} className={classes} onClick={onClick} {...props}>
        {content}
      </a>
    );
  }

  // Regular button
  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {content}
    </button>
  );
};

export default Button;
