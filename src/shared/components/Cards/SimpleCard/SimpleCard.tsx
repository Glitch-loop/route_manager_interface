

type Props = {
    cardName: string;
    cardDetails: string;
};

function SimpleCard({ cardName, cardDetails }: Props) {
    return (
        <div className="w-full p-2 bg-system-primary-background rounded-lg shadow-md ">
            <h2 className="text-lg font-bold">{cardName}</h2>
            <p className="text-sm text-gray-600">{cardDetails}</p>
        </div>
    );
}

export default SimpleCard;