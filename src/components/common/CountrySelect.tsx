import { useMemo } from 'react';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { getCountryList } from '@/utils/countries';

interface Props {
  value?: string;
  onChange?: (code: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function CountrySelect({ value, onChange, placeholder, disabled }: Props) {
  const { i18n, t } = useTranslation();
  const lang = i18n.language.startsWith('tr') ? 'tr' : 'en';

  const options = useMemo(
    () =>
      getCountryList(lang).map((c) => ({
        value: c.code,
        label: (
          <span className="country-option">
            <span className="country-flag" aria-hidden="true">{c.flag}</span>
            <span>{c.name}</span>
          </span>
        ),
        searchValue: c.name,
      })),
    [lang],
  );

  return (
    <Select
      showSearch
      value={value || undefined}
      onChange={onChange}
      placeholder={placeholder ?? t('common.selectCountry')}
      disabled={disabled}
      options={options}
      filterOption={(input, option) =>
        (option?.searchValue ?? '').toLowerCase().includes(input.toLowerCase())
      }
      style={{ width: '100%' }}
    />
  );
}
