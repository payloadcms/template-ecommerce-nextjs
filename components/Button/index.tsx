import Link from 'next/link';
import React, { ElementType } from 'react';
import { useBackgroundColor } from '../BackgroundColor';
import classes from './index.module.scss';

export type Props = {
  label: string
  appearance?: 'default' | 'primary' | 'secondary'
  el?: 'button' | 'link' | 'a'
  onClick?: () => void
  href?: string
  newTab?: boolean
  className?: string
  type?: 'submit' | 'button'
  disabled?: boolean
}

export const Button: React.FC<Props> = ({
  el: elFromProps = 'link',
  label,
  newTab,
  href,
  appearance,
  className: classNameFromProps,
  onClick,
  type = 'button',
  disabled
}) => {
  let el = elFromProps;
  const backgroundColor = useBackgroundColor();
  const newTabProps = newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  const className = [classNameFromProps, classes[`appearance--${appearance}`], classes[`${appearance}--${backgroundColor}`], classes.button].filter(Boolean).join(' ');

  const content = (
    <div className={classes.content}>
      {/* <Chevron /> */}
      <span className={classes.label}>
        {label}
      </span>
    </div>
  )

  if (onClick || type === 'submit') el = 'button';

  if (el === 'link') {
    return (
      <Link
        href={href}
        className={className}
        {...newTabProps}
        onClick={onClick}
      >
        {content}
      </Link>
    )
  }

  const Element: ElementType = el;

  return (
    <Element
      href={href}
      className={[
        className,
        classes.button
      ].filter(Boolean).join(' ')}
      type={type}
      {...newTabProps}
      onClick={onClick}
      disabled={disabled}
    >
      {content}
    </Element>
  )
}
