import { useState } from "react";

import { 
  Tooltip, 
  IconButton, 
  TooltipProps
} from "@mui/material";

import { 
  ChevronLeft, 
  ChevronRight,
  KeyboardArrowUp,
  KeyboardArrowDown
} from "@mui/icons-material";

type ShowHideButtonProps = {
  horizontalHidding: boolean;
  tooltipTitle: string;
  onChangeButtonState: (state: boolean) => void;
  leftDownInitialState?: boolean;
  placement?: TooltipProps["placement"];
  enterDelay?: number;
  arrow?: boolean
}


export default function ShowHideIconButton({
  horizontalHidding,
  tooltipTitle,
  onChangeButtonState,
  leftDownInitialState = true,
  placement = "right",
  enterDelay = 300,
  arrow = true
}: ShowHideButtonProps) {
  const [isLeftDownState, setIsLeftDownState] = useState<boolean>(leftDownInitialState);

  const handleChangeState = () => {
    setIsLeftDownState(!isLeftDownState);
    onChangeButtonState(!isLeftDownState);
  }

  return (
    <Tooltip
      title={tooltipTitle}
      placement={placement}
      enterDelay={enterDelay}
      arrow={arrow}
    >
      <IconButton
        onClick={() => handleChangeState()}
        className="h-fit my-auto bg-white shadow-md"
        size="small"
      >
        { horizontalHidding ?
          isLeftDownState ? <ChevronLeft /> : <ChevronRight />
          :
          isLeftDownState ? <KeyboardArrowDown /> : <KeyboardArrowUp />
        }
      </IconButton>
    </Tooltip>
  );
}
