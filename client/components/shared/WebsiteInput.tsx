import { TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { isEmpty } from 'lodash';
import get from 'lodash/get';
import { useEffect, useState } from 'react';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setWebsiteState } from '@/store/website/websiteSlice';

interface Props {
  type?: 'text' | 'textarea' | 'date';
  label: string;
  path: string;
  className?: string;
}

const WebsiteInput: React.FC<Props> = ({ type = 'text', label, path, className }) => {
  const dispatch = useAppDispatch();

  const stateValue = useAppSelector((state) => get(state.website.present, path, ''));

  useEffect(() => {
    setValue(stateValue);
  }, [stateValue]);

  const [value, setValue] = useState<string>(stateValue);

  const onChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValue(event.target.value);
    dispatch(setWebsiteState({ path, value: event.target.value }));
  };

  const onChangeValue = (value: string) => {
    setValue(value);
    dispatch(setWebsiteState({ path, value }));
  };

  if (type === 'textarea') {
    return (
      <TextField
        rows={5}
        multiline
        label={label}
        value={value}
        onChange={onChange}
        className={className}
        helperText=""
      />
    );
  }

  if (type === 'date') {
    return (
      <DatePicker
        openTo="year"
        label={label}
        value={value}
        views={['year', 'month', 'day']}
        renderInput={(params) => <TextField {...params} error={false} className={className} />}
        onChange={(date: Date | null, keyboardInputValue: string | undefined) => {
          isEmpty(keyboardInputValue) && onChangeValue('');
          date && dayjs(date).utc().isValid() && onChangeValue(dayjs(date).utc().toISOString());
        }}
      />
    );
  }

  return <TextField type={type} label={label} value={value} onChange={onChange} className={className} />;
};

export default WebsiteInput;
