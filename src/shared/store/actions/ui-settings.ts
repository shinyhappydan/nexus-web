import { TEditorPopoverResolvedData } from '../reducers/ui-settings';
import { FilterPayloadAction, PayloadAction } from './utils';

export enum UISettingsActionTypes {
  CHANGE_PAGE_SIZE = 'CHANGE_PAGE_SIZE',
  CHANGE_HEADER_CREATION_PANEL = 'CHANGE_HEADER_CREATION_PANEL',
  UPDATE_CURRENT_RESOURCE_VIEW = 'UPDATE_CURRENT_RESOURCE_VIEW',
  UPDATE_JSON_EDITOR_POPOVER = 'UPDATE_JSON_EDITOR_POPOVER',
}

type ChangePageSizeAction = FilterPayloadAction<
  UISettingsActionTypes.CHANGE_PAGE_SIZE,
  { pageSize: number }
>;
export type TUpdateJSONEditorPopoverAction = PayloadAction<
  UISettingsActionTypes.UPDATE_JSON_EDITOR_POPOVER,
  TEditorPopoverResolvedData
>;
export type UISettingsActions = ChangePageSizeAction;
