import React from 'react'

interface DivTemplateProps {
  children: React.ReactNode
}

function DivTemplate({ children, ...rest }: DivTemplateProps) {
  return (
    <div style={{ margin: 10 }} {...rest}>
      {children}
    </div>
  )
}

export const generateItems = (num: number) =>
  Array.from(Array(num).keys()).map((elem, index) => <DivTemplate key={index}>Item{index}</DivTemplate>)
