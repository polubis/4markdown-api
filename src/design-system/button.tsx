import React from 'react';
import c from 'classnames';

interface ButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {}

const Button: React.FC<ButtonProps> = ({ className, ...props }) => {
  const classes = c(
    className,
    `bg-gray-300 dark:bg-red-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center`,
  );
  return <button className={classes} {...props} />;
};

export { Button };
