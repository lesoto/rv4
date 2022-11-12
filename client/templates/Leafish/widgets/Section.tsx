import { Email, Link, Phone } from '@mui/icons-material';
import { ListItem, Section as SectionType } from '@reactive-website/schema';
import get from 'lodash/get';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import { useMemo } from 'react';

import { useAppSelector } from '@/store/hooks';
import { SectionProps } from '@/templates/sectionMap';
import DataDisplay from '@/templates/shared/DataDisplay';
import { formatDateString } from '@/utils/date';
import { parseListItemPath } from '@/utils/template';

import Heading from './Heading';

const Section: React.FC<SectionProps> = ({
  path,
  titlePath = 'title',
  subtitlePath = 'subtitle',
  headlinePath = 'headline',
  keywordsPath = 'keywords',
}) => {
  const section: SectionType = useAppSelector((state) => get(state.website.present, path, {}));
  const dateFormat: string = useAppSelector((state) => get(state.website.present, 'metadata.date.format'));
  const primaryColor: string = useAppSelector((state) => get(state.website.present, 'metadata.theme.primary'));

  const sectionId = useMemo(() => section.id || path.replace('sections.', ''), [path, section]);

  if (!section.visible) return null;

  if (isArray(section.items) && isEmpty(section.items)) return null;

  return (
    <section id={`Leafish_${sectionId}`}>
      <Heading>{section.name}</Heading>

      <div
        className="grid items-start gap-4"
        style={{ gridTemplateColumns: `repeat(${section.columns}, minmax(0, 1fr))` }}
      >
        {section.items.map((item: ListItem) => {
          const id = item.id,
            title = parseListItemPath(item, titlePath),
            subtitle = parseListItemPath(item, subtitlePath),
            headline = parseListItemPath(item, headlinePath),
            keywords: string[] = get(item, keywordsPath),
            url: string = get(item, 'url'),
            summary: string = get(item, 'summary'),
            level: string = get(item, 'level'),
            levelNum: number = get(item, 'levelNum'),
            phone: string = get(item, 'phone'),
            email: string = get(item, 'email'),
            date = formatDateString(get(item, 'date'), dateFormat);

          return (
            <div key={id} className="mb-2 grid gap-1">
              <div className="grid gap-1">
                {title && <div className="font-bold">{title}</div>}
                {subtitle && <div>{subtitle}</div>}
                {date && (
                  <div className="text-xs" style={{ color: primaryColor }}>
                    ({date})
                  </div>
                )}
                {headline && <div className="opacity-50">{headline}</div>}
              </div>

              {(level || levelNum > 0) && (
                <div className="grid gap-1">
                  {level && <span className="opacity-75">{level}</span>}
                  {levelNum > 0 && (
                    <div className="flex">
                      {Array.from(Array(5).keys()).map((_, index) => (
                        <div
                          key={index}
                          className="mr-1 h-3 w-3 rounded-full border-2"
                          style={{
                            borderColor: primaryColor,
                            backgroundColor: levelNum / (10 / 5) > index ? primaryColor : '',
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {summary}

              {url && (
                <DataDisplay icon={<Link />} link={url} className="text-xs">
                  {url}
                </DataDisplay>
              )}

              {keywords && <div>{keywords.join(', ')}</div>}

              {(phone || email) && (
                <div className="grid gap-1">
                  {phone && (
                    <DataDisplay icon={<Phone />} link={`tel:${phone}`}>
                      {phone}
                    </DataDisplay>
                  )}

                  {email && (
                    <DataDisplay icon={<Email />} link={`mailto:${email}`}>
                      {email}
                    </DataDisplay>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Section;
