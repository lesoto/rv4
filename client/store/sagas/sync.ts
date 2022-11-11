import { Website } from '@reactive-website/schema';
import debounce from 'lodash/debounce';
import { select, takeLatest } from 'redux-saga/effects';

import { updateWebsite } from '@/services/website';
import { RootState } from '@/store/index';

import {
  addItem,
  addSection,
  deleteItem,
  deleteSection,
  duplicateItem,
  editItem,
  setWebsiteState,
} from '../website/websiteSlice';

const DEBOUNCE_WAIT = 1000;

const debouncedSync = debounce((website: Website) => updateWebsite(website), DEBOUNCE_WAIT);

function* handleSync() {
  const website: Website = yield select((state: RootState) => state.website.present);

  debouncedSync(website);
}

function* syncSaga() {
  yield takeLatest(
    [setWebsiteState, addItem, editItem, duplicateItem, deleteItem, addSection, deleteSection],
    handleSync
  );
}

export default syncSaga;
