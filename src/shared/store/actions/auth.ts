import { Action, ActionCreator, Dispatch } from 'redux';
import { PaginatedList, Realm, IdentityList } from '@bbp/nexus-sdk';
import getUserManager from '../../../client/userManager';
import { RootState } from '../reducers';
import { ThunkAction } from '..';
import { FetchAction, FetchFulfilledAction, FetchFailedAction } from './utils';
import { TLocationState } from '../../../pages/IdentityPage/IdentityPage';

export enum AuthActionTypes {
  IDENTITY_FETCHING = '@@nexus/AUTH_IDENTITY_FETCHING',
  IDENTITY_FULFILLED = '@@nexus/AUTH_IDENTITY_FULFILLED',
  IDENTITY_FAILED = '@@nexus/AUTH_IDENTITY_FAILED',
  REALM_FETCHING = '@@nexus/AUTH_REALM_FETCHING',
  REALM_FULFILLED = '@@nexus/AUTH_REALM_FULFILLED',
  REALM_FAILED = '@@nexus/AUTH_REALM_FAILED',
  LOGIN_FAILED = '@@nexus/LOGIN_FAILED',
}

/**
 * Identity
 */
type FetchIdentitiesAction = FetchAction<AuthActionTypes.IDENTITY_FETCHING>;
const fetchIdentitiesAction: ActionCreator<FetchIdentitiesAction> = () => ({
  type: AuthActionTypes.IDENTITY_FETCHING,
});

type FetchIdentitiesFulfilledAction = FetchFulfilledAction<
  AuthActionTypes.IDENTITY_FULFILLED,
  IdentityList
>;
const fetchIdentitiesFulfilledAction: ActionCreator<FetchIdentitiesFulfilledAction> = (
  identities: IdentityList
) => ({
  type: AuthActionTypes.IDENTITY_FULFILLED,
  payload: identities,
});

type FetchIdentitiesFailedAction = FetchFailedAction<
  AuthActionTypes.IDENTITY_FAILED
>;
const fetchIdentitiesFailedAction: ActionCreator<FetchFailedAction<
  AuthActionTypes.IDENTITY_FAILED
>> = (error: Error) => ({
  error,
  type: AuthActionTypes.IDENTITY_FAILED,
});

/**
 * Auth
 */
interface SetAuthenticatedAction extends Action {
  type: 'SET_AUTHENTICATED';
  payload: boolean;
}

/**
 * Realms
 */
type FetchRealmsAction = FetchAction<AuthActionTypes.REALM_FETCHING>;
const fetchRealmsAction: ActionCreator<FetchRealmsAction> = () => ({
  type: AuthActionTypes.REALM_FETCHING,
});

type FetchRealmsFulfilledAction = FetchFulfilledAction<
  AuthActionTypes.REALM_FULFILLED,
  PaginatedList<Realm>
>;
const fetchRealmsFulfilledAction: ActionCreator<FetchRealmsFulfilledAction> = (
  realms: PaginatedList<Realm>
) => ({
  type: AuthActionTypes.REALM_FULFILLED,
  payload: realms,
});

type FetchRealmsFailedAction = FetchFailedAction<AuthActionTypes.REALM_FAILED>;
const fetchRealmsFailedAction: ActionCreator<FetchFailedAction<
  AuthActionTypes.REALM_FAILED
>> = (error: Error) => ({
  error,
  type: AuthActionTypes.REALM_FAILED,
});

export type AuthFailedAction = FetchFailedAction<AuthActionTypes.LOGIN_FAILED>;
const authFailedAction: ActionCreator<FetchFailedAction<
  AuthActionTypes.LOGIN_FAILED
>> = (error: Error) => ({
  error,
  type: AuthActionTypes.LOGIN_FAILED,
});
/**
 * Export ALL types
 */
export type AuthActions =
  | SetAuthenticatedAction
  | FetchIdentitiesAction
  | FetchIdentitiesFulfilledAction
  | FetchIdentitiesFailedAction
  | FetchRealmsAction
  | FetchRealmsFulfilledAction
  | FetchRealmsFailedAction
  | AuthFailedAction;

/**
 *  Actual Actions
 */

const fetchIdentities: ActionCreator<ThunkAction> = () => {
  return async (
    dispatch: Dispatch<any>,
    getState,
    { nexus }
  ): Promise<FetchIdentitiesFulfilledAction | FetchIdentitiesFailedAction> => {
    dispatch(fetchIdentitiesAction);
    try {
      const identities: IdentityList = await nexus.Identity.list();
      return dispatch(fetchIdentitiesFulfilledAction(identities));
    } catch (error) {
      return dispatch(fetchIdentitiesFailedAction(error));
    }
  };
};

const fetchRealms: ActionCreator<ThunkAction> = () => {
  return async (
    dispatch: Dispatch<any>,
    getState,
    { nexus }
  ): Promise<FetchRealmsFulfilledAction | FetchRealmsFailedAction> => {
    dispatch(fetchIdentitiesAction);
    try {
      const data: PaginatedList<Realm> = await nexus.Realm.list();
      return dispatch(fetchRealmsFulfilledAction(data));
    } catch (error) {
      return dispatch(fetchRealmsFailedAction(error));
    }
  };
};

function performLogin(state: TLocationState) {
  return async (
    dispatch: Dispatch<any>,
    getState: () => RootState
  ): Promise<any> => {
    const userManager = getUserManager(getState());
    const baseURl = getState().config.basePath;
    try {
      // default Redirect is home page so to avoid double slash '//' in the route (may it be temporary solution)
      // use baseURl instead of window location to get the real location
      const redirectUri =
        state.from && state.from !== '/'
          ? `${window.location.origin}/${baseURl}${state.from}${state.searchQuery}`
          : undefined;
      userManager &&
        (await userManager.signinRedirect({
          redirect_uri: redirectUri,
        }));
    } catch (error) {
      return dispatch(authFailedAction(error));
    }
  };
}

export { fetchIdentities, fetchRealms, performLogin };
