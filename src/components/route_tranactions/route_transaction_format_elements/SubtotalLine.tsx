import React from 'react';

const SubtotalLine = ({
    description,
    total,
    fontclassName,
  }:{
    description:string,
    total:string,
    fontclassName:string
  }) => {
  return (
    <div className={`w-11/12 flex flex-row justify-center items-center`}>
      <div className={`flex basis-5/6 justify-end`}>
        <span className={`text-black text-right ${fontclassName}`}>{description}</span>
      </div>
      <div className={`flex basis-1/6 justify-center`}>
        <span className={`text-black text-center ${fontclassName}`}>${total}</span>
      </div>
    </div>
  );
};

export default SubtotalLine;
