import DroppableColumn from "@/shared/components/DragAndDropContainer/components/DroppableColumn"
import DraggableItem from "@/shared/components/DragAndDropContainer/components/DraggableItem";
import RouteDayStoreDTO from "@/application/dto/RouteDayStoreDTO";

type RouteDayStoreContainerProps = {
    id_column: string;
    stores: RouteDayStoreDTO[];
}

export default function RouteDayStoreContainer({ id_column, stores }: RouteDayStoreContainerProps) {

    return (
        <div>
            <h2>Some route</h2>
            <div className="h-5/6 overflow-y-auto bg-system-secondary-background">
                <DroppableColumn id={id_column}>
                    { stores.map((store, index) => {
                        const { id_store } = store;
                        return (
                            <DraggableItem key={id_store} id={id_store} index={index} column={id_column}>
                                {id_store}
                            </DraggableItem>
                        )
                    })
                    }
                </DroppableColumn>
            </div>
        </div>
    );
}