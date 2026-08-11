type Props = {
  cardName: string;
  cardDetails: string;
  numericValue: string;
  isSelected?: boolean;
};

export default function NumericValueCard({
  cardName,
  cardDetails,
  numericValue,
  isSelected = false
}: Props) {
  let style:string ="w-full flex flex-row text-black rounded-lg shadow-md items-center"; 
  if(isSelected) {
    style += " bg-system-fourth-background hover:bg-system-foruth-background-hover" 
  } else {
    style += " bg-system-primary-background hover:bg-system-secondary-background" 
  }
  return (
    <div className={style}>
      <div className="flex flex-col basis-2/3 justify-start gap-1">
        <h2 className="text-lg font-bold">{cardName}</h2>
        <p className="text-sm ">{cardDetails}</p>
      </div>
      <h3 className="text-xl font-bold">{numericValue}</h3>
    </div>
  );
}
