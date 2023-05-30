import React, { useState, useEffect, useCallback } from 'react';
import Select from 'react-select';

const TimePicker = ({ id, label, value, onChange, maxDuration }) => {
    const [hours, minutes, seconds] = value.split(':').map((v) => parseInt(v, 10));

    const validMaxDuration = maxDuration === Infinity ? 0 : maxDuration

    const maxHours = Math.floor(validMaxDuration / 3600);
    const maxMinutes = Math.floor((validMaxDuration % 3600) / 60);
    const maxSeconds = Math.floor(validMaxDuration % 60);

    const hoursOptions = Array.from({ length: Math.max(0, maxHours) + 1 }, (_, i) => i);
    const minutesSecondsOptions = Array.from({ length: 60 }, (_, i) => i);

    const [minuteOptions, setMinuteOptions] = useState(minutesSecondsOptions);
    const [secondOptions, setSecondOptions] = useState(minutesSecondsOptions);

    const updateValue = (newHours, newMinutes, newSeconds) => {
        onChange(`${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}:${String(newSeconds).padStart(2, '0')}`);
    };

    const updateMinuteAndSecondOptions = useCallback((newHours, newMinutes) => {
        const minutesSecondsOptions = Array.from({ length: 60 }, (_, i) => i);
        let newMinuteOptions = minutesSecondsOptions;
        let newSecondOptions = minutesSecondsOptions;

        if (newHours === maxHours) {
            newMinuteOptions = Array.from({ length: Math.max(0, maxMinutes) + 1 }, (_, i) => i);
            if (newMinutes === maxMinutes) {
                newSecondOptions = Array.from({ length: Math.max(0, maxSeconds) + 1 }, (_, i) => i);
            }
        }

        setMinuteOptions(newMinuteOptions);
        setSecondOptions(newSecondOptions);
    }, [maxHours, maxMinutes, maxSeconds]);

    useEffect(() => {
        updateMinuteAndSecondOptions(hours, minutes);
    }, [hours, minutes, updateMinuteAndSecondOptions]);

    const toOption = (value) => ({
        value: value,
        label: String(value).padStart(2, '0'),
    });

    const fromOption = (option) => option.value;

    return (
        <div className="flex flex-col md:flex-row items-center md:items-start justify-center space-y-2 md:space-y-0 md:space-x-4">
            <label htmlFor={`${id}-hours`} className="mr-2 self-center">{label}</label>
            <div>
                <div className="flex justify-around mb-1">
                    <span className="text-xs">Hours</span>
                    <span className="text-xs mx-4">Minutes</span>
                    <span className="text-xs">Seconds</span>
                </div>
                <div className="flex items-center space-x-2">
                    <Select
                        id={`${id}-hours`}
                        value={toOption(hours)}
                        onChange={(option) => {
                            const newHours = fromOption(option);
                            updateValue(newHours, minutes, seconds);
                            updateMinuteAndSecondOptions(newHours, minutes);
                        }}
                        options={hoursOptions.map(toOption)}
                        isSearchable
                    />
                    <span>:</span>
                    <Select
                        id={`${id}-minutes`}
                        value={toOption(minutes)}
                        onChange={(option) => {
                            const newMinutes = fromOption(option);
                            updateValue(hours, newMinutes, seconds);
                            updateMinuteAndSecondOptions(hours, newMinutes);
                        }}
                        options={minuteOptions.map(toOption)}
                        isSearchable
                    />
                    <span>:</span>
                    <Select
                        id={`${id}-seconds`}
                        value={toOption(seconds)}
                        onChange={(option) => {
                            const newSeconds = fromOption(option);
                            updateValue(hours, minutes, newSeconds);
                        }}
                        options={secondOptions.map(toOption)}
                        isSearchable
                    />
                </div>
            </div>
        </div>
    );
};

export default TimePicker;