import { apiGet, apiPut, handleApiResponse } from "./api-client";

export async function getSecurityConfig() {
  const res = await apiGet("/configuracion/seguridad");
  return handleApiResponse(res);
}

export async function updateSecurityConfig(data: any) {
  const res = await apiPut("/configuracion/seguridad", data);
  return handleApiResponse(res);
}
