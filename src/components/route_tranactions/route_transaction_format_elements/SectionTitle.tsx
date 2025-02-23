import React from 'react';

const SectionTitle = ({
    title,
    caption,
    titlePositionStyle,
  }:{
    title:string,
    caption:string|undefined,
    titlePositionStyle:string
  }) => {
  return (
    <div className={`w-full flex flex-col ${titlePositionStyle}`}>
      <span className={`flex text-black text-2xl font-bold`}>{title}</span>
      { (caption !== undefined && caption !== '') &&
        <span className={`flex text-black text-base`}>{caption}</span>
      }
    </div>
  );
};

export default SectionTitle;
