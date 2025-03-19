'use client'
import * as React from 'react';
import dayjs, { Dayjs } from 'dayjs';
import isBetweenPlugin from 'dayjs/plugin/isBetween';
import { styled } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import { DayCalendarProps } from '@mui/x-date-pickers/internals';

dayjs.extend(isBetweenPlugin);


// Interface of the component
interface CustomPickerDayProps extends PickersDayProps<Dayjs> {
  isSelected: boolean;
  isHovered: boolean;
  isInitialDate: boolean;
  isFinalDate: boolean;
}

// Functions
const isInRangeOfDays = (pickedDay: Dayjs, initialDate: Dayjs | null | undefined, finalDate: Dayjs | null | undefined) => {
    if (initialDate == null) {
      return false;
    }
    if (finalDate == null) {
      return false;
    }

    // The initial date always will be true
    if(pickedDay.isSame(initialDate) || pickedDay.isSame(finalDate)) {
        return true
    }

    return pickedDay.isBetween(initialDate, finalDate);
  };

const isEdgeOfRange = (pickedDay: Dayjs, edgeOfRange: Dayjs | null | undefined) => {
    if (edgeOfRange == null) {
        return false;
    }

    return pickedDay.isSame(edgeOfRange);
}


const isHoverRangeAllowed = (pickedDay: Dayjs, initialDate: Dayjs | null | undefined) => {
    if(initialDate === null || initialDate === undefined) {
        return false;     
    } else {
        if (pickedDay.isBetween(initialDate, pickedDay)) {
            return true;
        } else {
            return false;
        }
    }
}


const CustomPickersDay = styled(PickersDay, {
    shouldForwardProp: (prop) => prop !== 'isSelected' && prop !== 'isHovered' && prop !== 'isInitialDate' && prop !== 'isFinalDate',
})<CustomPickerDayProps>(({ theme, isSelected, isHovered, isInitialDate, isFinalDate, day }) => ({
  borderRadius: 0,
  ...(isSelected && {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover, &:focus': {
      backgroundColor: theme.palette.primary.main,
    },
  }),
  ...(isHovered && {
    backgroundColor: theme.palette.primary.light,
    '&:hover, &:focus': {
      backgroundColor: theme.palette.primary.light,
    },
    ...theme.applyStyles('dark', {
      backgroundColor: theme.palette.primary.dark,
      '&:hover, &:focus': {
        backgroundColor: theme.palette.primary.dark,
      },
    }),
  }),
  ...(isInitialDate && {
    borderTopLeftRadius: '50%',
    borderBottomLeftRadius: '50%',
  }),
  ...(isFinalDate && {
    borderTopRightRadius: '50%',
    borderBottomRightRadius: '50%',
  }),
})) as React.ComponentType<CustomPickerDayProps>;



function Day(
  props: PickersDayProps<Dayjs> & {
    selectedDay?: Dayjs | null;
    initialDate?: Dayjs | null;
    finalDate?: Dayjs | null;
    hoveredDay?: Dayjs | null;
  },
) {
  const { day, selectedDay, initialDate, finalDate, hoveredDay, ...other } = props;

  return (
    <CustomPickersDay
      {...other}
      day={day}
      sx={{ px: 2.5 }}
      disableMargin
      selected={false}
      isSelected={isInRangeOfDays(day, initialDate, finalDate)}
      isHovered={isHoverRangeAllowed(day, initialDate)}
      isInitialDate={isEdgeOfRange(day, initialDate)}
      isFinalDate={isEdgeOfRange(day, finalDate)}

    />
  );
}

export default function DateRangePicker({
  initialDate,
  finalDate,
  setInitialDate,
  setFinalDate,
  defaultDay,
}:{
  initialDate:Dayjs | null,
  finalDate:Dayjs | null,
  setInitialDate:(day:Dayjs | null) => void,
  setFinalDate:(day:Dayjs | null) => void,
  defaultDay?:Dayjs,
}) {
  const [hoveredDay, setHoveredDay] = React.useState<Dayjs | null>(null);
  const [value, setValue] = React.useState<Dayjs | null>(dayjs(defaultDay));

  const handlerPickDay = (ownerState:DayCalendarProps<dayjs.Dayjs> & {day:  Dayjs}) => {
        const { day } = ownerState;    

        if(initialDate === null) { // User selected the start of the range
            setInitialDate(day)
        } else { // User selected the end of the range
            if (day.isSame(initialDate) === true) { // User is restarting the range
                setInitialDate(null);
                setFinalDate(null);
            } else {
                if (finalDate === null && day.isSame(finalDate) === false) { // User is selecting the end of the range

                    // Verifyin the end of the day won't be grater than the start of the day
                    if (day < initialDate) {
                        setInitialDate(day)
                        setFinalDate(initialDate)
                    } else {
                        setFinalDate(day)
                    }
                } else { // User is restarting the range
                    
                    setFinalDate(null)
                }
            }
        }



    }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DateCalendar
        value={value}
        onChange={(newValue) => setValue(newValue)}
        showDaysOutsideCurrentMonth
        displayWeekNumber
        slots={{ day: Day }}
        slotProps={{
          day: (ownerState) =>
            ({
              selectedDay: value,
              initialDate: initialDate,
              finalDate: finalDate,
              hoveredDay,
              onClick: () => {handlerPickDay(ownerState)},
              onPointerEnter: () => setHoveredDay(ownerState.day),
              onPointerLeave: () => setHoveredDay(null),
            }) as any,
        }}
      />
    </LocalizationProvider>
  );
}