import React from 'react';
import { useHomeState } from 'store/home';

const HomeView: React.FC = () => {
  const { title } = useHomeState();

  return (
    <h1 className="text-3xl top-5 font-bold underline">
      This is home page. Zustand works! The blog title is:
      {title}
    </h1>
  );
};

export default HomeView;
