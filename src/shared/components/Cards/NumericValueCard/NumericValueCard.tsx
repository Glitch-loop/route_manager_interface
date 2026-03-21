

type Props = {
    cardName: string;
    cardDetails: string;
    numericValue: string;
};

export default function NumericValueCard({ cardName, cardDetails, numericValue }: Props) {
    return (
        <div className="w-full flex flex-row text-black bg-system-primary-background rounded-lg shadow-md items-center">
            <div className="flex flex-col basis-2/3 justify-start gap-1">
                <h2 className="text-lg font-bold">{cardName}</h2>
                <p className="text-sm ">{cardDetails}</p>
            </div>
            <h3 className="text-xl font-bold">{numericValue}</h3>
        </div>
    );
}

