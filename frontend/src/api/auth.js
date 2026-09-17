import { TEST_MODE } from "../testMode";
import * as remote from "./remote/auth";
import * as local from "./local/auth";

const impl = TEST_MODE ? local : remote;

export const login = impl.login;
export const logout = impl.logout;
export const me = impl.me;
