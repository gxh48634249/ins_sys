import request from '@/utils/request';
import server from '../../config/service.config';

export async function selectPer(params) {
  const service = server.server;
  const resource = '/permission/selectPer';
  const uri = service+resource;
  return request(uri, {
    method: 'POST',
    body: params,
    mode: 'cors',
  });
}

export async function selectRole(params) {
  const service = server.server;
  const resource = '/role/selectRole';
  const uri = service+resource;
  return request(uri, {
    method: 'POST',
    body: params,
    mode: 'cors',
  });
}

export async function modifyRole(params) {
  const service = server.server;
  const resource = '/role/modifyRole';
  const uri = service+resource;
  return request(uri, {
    method: 'POST',
    body: params,
    mode: 'cors',
  });
}

export async function insertRole(params) {
  const service = server.server;
  const resource = '/role/insertRole';
  const uri = service+resource;
  return request(uri, {
    method: 'POST',
    body: params,
    mode: 'cors',
  });
}

export async function deleteRole(params) {
  const service = server.server;
  const resource = '/role/deleteRole';
  const uri = service+resource;
  return request(uri, {
    method: 'POST',
    body: params,
    mode: 'cors',
  });
}

export async function roleBindPer(params) {
  const service = server.server;
  const resource = '/role/roleBindPer';
  const uri = service+resource;
  return request(uri, {
    method: 'POST',
    body: params,
    mode: 'cors',
  });
}

export async function selectPerByRole(params) {
  const service = server.server;
  const resource = '/permission/selectPerByRole';
  const uri = service+resource;
  return request(uri, {
    method: 'POST',
    body: params,
    mode: 'cors',
  });
}
