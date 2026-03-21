

type Props = {
    cardName: string;
    cardDetails: string;
};

function SimpleCard({ cardName, cardDetails }: Props) {
    return (
        <div className="w-full p-2 text-black bg-system-primary-background rounded-lg shadow-md ">
            <h2 className="text-lg font-bold">{cardName}</h2>
            <p className="text-sm ">{cardDetails}</p>
        </div>
    );
}

export default SimpleCard;