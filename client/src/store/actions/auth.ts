import { LoginData } from "~/types/auth";

export enum AuthTypes { 
  LOGIN_REQUEST = 'LOGIN_REQUEST',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE =  'LOGIN_FAILURE',
  LOGOUT = 'LOGOUT',
};

export interface LoginAction {
  type: typeof AuthTypes.LOGIN_REQUEST;
  payload: LoginData;
}
export interface LoginSuccessAction {
  type: typeof AuthTypes.LOGIN_SUCCESS;
  payload: string;
}
export interface LoginFailureAction {
  type: typeof AuthTypes.LOGIN_FAILURE;
  payload: string;
}
  
export interface LogoutAction {
  type: typeof AuthTypes.LOGOUT;
}


export type AuthActionTypes = LoginAction
  | LoginSuccessAction
  | LoginFailureAction
  | LogoutAction

export const login = (loginData: LoginData): LoginAction => ({
  type: AuthTypes.LOGIN_REQUEST,
  payload: loginData
})

export const logout = (): LogoutAction => ({
  type: AuthTypes.LOGOUT
})

export const AuthActions = {
    login,
    logout,
}