import React from "react";

import { TextTableProps } from "@/app/interfaces/interfaces";

const TextTable: React.FC<TextTableProps> = ({ headers, data, headerStyles = {}, columnStyles = {}, rowStyles = {} }) => {
  return (
    <table className="w-full">
      <thead>
        <tr>
          {headers.map((header, colIndex) => (
            <th key={colIndex} className={`${headerStyles[colIndex] ? headerStyles[colIndex] : "italic text-center" }`}>
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex} className={`${rowStyles[rowIndex] ? rowStyles[rowIndex] : "text-center" }`}>
            {row.map((cell, colIndex) => (
              <td key={colIndex} className={`8px ${columnStyles[colIndex] ? columnStyles[colIndex] : "" }`}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};


export default TextTable;