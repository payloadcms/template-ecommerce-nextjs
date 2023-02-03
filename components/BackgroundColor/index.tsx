import React, { useContext, createContext } from 'react';
import classes from './index.module.scss';

export type BackgroundColor = 'white' | 'black'

export const BackgroundColorContext = createContext<BackgroundColor>('white');

export const useBackgroundColor = (): BackgroundColor => useContext(BackgroundColorContext);


type Props = {
  color?: BackgroundColor
  className?: string
  children?: React.ReactNode
  id?: string
}

export const BackgroundColor: React.FC<Props> = (props) => {
  const {
    id,
    className,
    children,
    color = 'white',
  } = props;

  return (
    <div
      id={id}
      className={[
        classes[color],
        className,
      ].filter(Boolean).join(' ')}
    >
      <BackgroundColorContext.Provider value={color}>
        {children}
      </BackgroundColorContext.Provider>
    </div>
  );
}
