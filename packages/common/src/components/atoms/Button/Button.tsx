import React from 'react'
import { StyledButton } from './Button.styles'

export interface CustomButtonProps extends ButtonProps {
  /**
   * text rendered in the button. If given, children are not painted
   */
  text?: string
}

/**
 * Main Buttom component for the application
 */
export const Button = ({ text, children, ...props }: CustomButtonProps) => (
  <StyledButton {...props}>{text || children}</StyledButton>
)
