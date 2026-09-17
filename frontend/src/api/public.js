import { TEST_MODE } from "../testMode";
import * as remote from "./remote/public";
import * as local from "./local/public";

const impl = TEST_MODE ? local : remote;

export const registrarUsuario = impl.registrarUsuario;
export const recuperarUsuario = impl.recuperarUsuario;
export const obtenerAnunciosPublicos = impl.obtenerAnunciosPublicos;
