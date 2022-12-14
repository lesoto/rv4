import { ListItem, Profile, Website, Section } from '@reactive-website/schema';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import merge from 'lodash/merge';
import pick from 'lodash/pick';
import set from 'lodash/set';
import { v4 as uuidv4 } from 'uuid';

type SetWebsiteStatePayload = { path: string; value: unknown };

type AddItemPayload = { path: string; value: ListItem };

type EditItemPayload = { path: string; value: ListItem };

type DuplicateItemPayload = { path: string; value: ListItem };

type DeleteItemPayload = { path: string; value: ListItem };

type AddSectionPayload = { value: Section };

type DeleteSectionPayload = { path: string };

type DeletePagePayload = { page: number };

const initialState: Website = {} as Website;

export const websiteSlice = createSlice({
  name: 'website',
  initialState,
  reducers: {
    setWebsite: (_state: Website, action: PayloadAction<Website>) => action.payload,
    setWebsiteState: (state: Website, action: PayloadAction<SetWebsiteStatePayload>) => {
      const { path, value } = action.payload;

      set(state, path, value);
    },
    addItem: (state: Website, action: PayloadAction<AddItemPayload>) => {
      const { path, value } = action.payload;
      const id = uuidv4();
      const list = get(state, path, []);
      const item = merge(value, { id });

      list.push(item);

      set(state, path, list);
    },
    editItem: (state: Website, action: PayloadAction<EditItemPayload>) => {
      const { path, value } = action.payload;
      const list: ListItem[] = get(state, path, []);
      const index = list.findIndex((item) => item.id === value.id);

      list[index] = value;

      set(state, path, list);
    },
    duplicateItem: (state: Website, action: PayloadAction<DuplicateItemPayload>) => {
      const { path, value } = action.payload;
      const list: ListItem[] = get(state, path, []);
      const index = list.findIndex((item) => item.id === value.id);
      const newItem = cloneDeep(list[index]);

      newItem.id = uuidv4();
      list.push(newItem);

      set(state, path, list);
    },
    deleteItem: (state: Website, action: PayloadAction<DeleteItemPayload>) => {
      const { path, value } = action.payload;
      let list = get(state, path, []);

      list = list.filter((item: Profile) => item.id !== value.id);

      set(state, path, list);
    },
    addSection: (state: Website, action: PayloadAction<AddSectionPayload>) => {
      const id = uuidv4();
      const { value } = action.payload;

      state.sections[id] = value;
      state.metadata.layout[0][0].push(id);
    },
    deleteSection: (state: Website, action: PayloadAction<DeleteSectionPayload>) => {
      const { path } = action.payload;
      const id = path.split('.')[1];

      const sections = Object.keys(state.sections).filter((x) => x !== id);
      const layout = state.metadata.layout.map((pages) => pages.map((list) => list.filter((x) => x !== id)));

      set(state, 'sections', pick(state.sections, sections));
      set(state, 'metadata.layout', layout);
    },
    addPage: (state: Website) => {
      state.metadata.layout.push([[], []]);
    },
    deletePage: (state: Website, action: PayloadAction<DeletePagePayload>) => {
      const { page } = action.payload;

      // Do not delete the first page
      if (page === 0) return;

      // Get Sections defined in Page X
      const [main, sidebar] = state.metadata.layout[page];

      // Add sections to page 0 as a default
      state.metadata.layout[0][0].push(...main);
      state.metadata.layout[0][1].push(...sidebar);

      state.metadata.layout.splice(page, 1);
    },
  },
});

export const {
  setWebsite,
  setWebsiteState,
  addItem,
  editItem,
  duplicateItem,
  deleteItem,
  addSection,
  deleteSection,
  addPage,
  deletePage,
} = websiteSlice.actions;

export default websiteSlice.reducer;
