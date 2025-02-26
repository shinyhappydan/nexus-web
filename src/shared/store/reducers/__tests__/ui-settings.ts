import uiSettingsReducer, { DEFAULT_UI_SETTINGS } from '../ui-settings';
import {
  UISettingsActionTypes,
  UISettingsActions,
} from '../../actions/ui-settings';

describe('UISettings Reducer', () => {
  it('should return default state if no match', () => {
    expect(uiSettingsReducer(undefined, { type: 'SOME_ACTION' })).toEqual(
      DEFAULT_UI_SETTINGS
    );
  });

  it('should change the appropriate key using a filterKey in the Action', () => {
    const changeOrgsListAction: UISettingsActions = {
      type: UISettingsActionTypes.CHANGE_PAGE_SIZE,
      filterKey: 'orgsListPageSize',
      payload: { pageSize: 50 },
    };
    expect(uiSettingsReducer(undefined, changeOrgsListAction)).toEqual({
      openCreationPanel: false,
      pageSizes: {
        ...DEFAULT_UI_SETTINGS.pageSizes,
        orgsListPageSize: 50,
      },
      currentResourceView: null,
      editorPopoverResolvedData: {
        error: null,
        left: 0,
        open: false,
        resolvedAs: undefined,
        results: [],
        top: 0,
      },
    });
  });
});
